import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

async function verify(signature: string | null, body: string): Promise<boolean> {
  if (!signature) return false;
  const secret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/chargily-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("signature") ?? request.headers.get("x-signature");
        const ok = await verify(sig, raw);
        if (!ok) return new Response("invalid signature", { status: 401 });

        let evt: {
          type?: string;
          data?: {
            id?: string;
            status?: string;
            metadata?: Array<{ key: string; value: string }>;
          };
        };
        try {
          evt = JSON.parse(raw);
        } catch {
          return new Response("bad json", { status: 400 });
        }

        const meta = new Map((evt.data?.metadata ?? []).map((m) => [m.key, m.value]));
        const campaignId = meta.get("campaign_id");
        const paymentId = meta.get("payment_id");
        const providerRef = evt.data?.id;

        if (!campaignId || !paymentId) return new Response("ok", { status: 200 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (evt.type === "checkout.paid") {
          await supabaseAdmin
            .from("payments")
            .update({ status: "paid", provider_ref: providerRef ?? null })
            .eq("id", paymentId);

          await supabaseAdmin
            .from("campaigns")
            .update({ status: "active" })
            .eq("id", campaignId);

          // Create conversations for each invited influencer
          const { data: cis } = await supabaseAdmin
            .from("campaign_influencers")
            .select("influencer_id, campaign:campaigns(advertiser_id, name)")
            .eq("campaign_id", campaignId);

          if (cis) {
            for (const ci of cis) {
              const advertiser =
                (ci as unknown as { campaign: { advertiser_id: string; name: string } }).campaign;
              if (!advertiser) continue;
              const { data: conv } = await supabaseAdmin
                .from("conversations")
                .insert({
                  advertiser_id: advertiser.advertiser_id,
                  influencer_id: ci.influencer_id,
                  campaign_id: campaignId,
                  last_message: `دعوة للانضمام إلى حملة: ${advertiser.name}`,
                  last_message_at: new Date().toISOString(),
                })
                .select("id")
                .single();
              if (conv) {
                await supabaseAdmin.from("messages").insert({
                  conversation_id: conv.id,
                  sender: "system",
                  body: `تم إنشاء الحملة "${advertiser.name}" ودعوة المؤثر للانضمام.`,
                });
              }
            }
          }
        } else if (evt.type === "checkout.failed" || evt.type === "checkout.cancelled") {
          await supabaseAdmin
            .from("payments")
            .update({ status: evt.type === "checkout.failed" ? "failed" : "cancelled" })
            .eq("id", paymentId);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
