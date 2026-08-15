import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateCheckoutInput = z.object({
  campaignId: z.string().uuid(),
  method: z.enum(["card", "edahabia", "bank"]),
});

type ChargilyCheckoutResponse = {
  id: string;
  checkout_url: string;
  status?: string;
};

export const createChargilyCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateCheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch campaign for amount + validate ownership via RLS
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("id, name, budget, advertiser_id")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (cErr || !campaign) throw new Error("الحملة غير موجودة");

    // Prevent paying twice for the same campaign
    const { data: paidRow } = await supabase
      .from("payments")
      .select("id")
      .eq("campaign_id", campaign.id)
      .eq("status", "paid")
      .maybeSingle();
    if (paidRow) throw new Error("تم دفع هذه الحملة مسبقاً");

    const amount = campaign.budget;
    const fee = Math.round(amount * 0.05);
    const tax = Math.round((amount + fee) * 0.09);
    const total = amount + fee + tax;

    const apiKey = process.env.CHARGILY_API_SECRET_KEY?.trim();
    if (!apiKey) throw new Error("Chargily غير مفعّل");
    const configuredMode = process.env.CHARGILY_MODE?.toLowerCase();
    const isTestKey = apiKey.toLowerCase().startsWith("test_");
    const useTestMode = configuredMode === "test" || configuredMode === "sandbox" || isTestKey;
    const useLiveMode = configuredMode === "live";
    const chargilyBaseUrls = useTestMode
      ? ["https://pay.chargily.net/test/api/v2"]
      : useLiveMode
        ? ["https://pay.chargily.net/api/v2"]
        : ["https://pay.chargily.net/api/v2", "https://pay.chargily.net/test/api/v2"];

    const origin = "https://creator-ally-flow.lovable.app";

    const successUrl = `${origin}/campaign/payment/success?campaign=${campaign.id}`;
    const failureUrl = `${origin}/campaign/payment/cancel?campaign=${campaign.id}`;
    const webhookUrl = `${origin}/api/public/chargily-webhook`;

    // Create payment record first
    const { data: payment, error: pErr } = await supabase
      .from("payments")
      .insert({
        campaign_id: campaign.id,
        advertiser_id: userId,
        amount,
        fee,
        tax,
        total,
        method: data.method,
        provider: "chargily",
        status: "pending",
      })
      .select("id")
      .single();
    if (pErr || !payment) throw new Error("تعذّر إنشاء سجل الدفع");

    const body = {
      amount: total,
      currency: "dzd",
      success_url: successUrl,
      failure_url: failureUrl,
      webhook_endpoint: webhookUrl,
      description: `دفع الحملة: ${campaign.name}`,
      metadata: [
        { key: "campaign_id", value: campaign.id },
        { key: "payment_id", value: payment.id },
      ],
      payment_method: data.method === "edahabia" ? "edahabia" : "cib",
    };

    let checkout: ChargilyCheckoutResponse | null = null;
    let lastErrorStatus: number | null = null;
    let lastErrorText = "";

    for (const baseUrl of chargilyBaseUrls) {
      const res = await fetch(`${baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        checkout = (await res.json()) as ChargilyCheckoutResponse;
        break;
      }

      lastErrorStatus = res.status;
      lastErrorText = await res.text();
      if (res.status !== 401) break;
    }

    if (!checkout) {
      console.error("Chargily error", lastErrorStatus, lastErrorText);
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      if (lastErrorStatus === 401) {
        throw new Error("مفتاح Chargily غير صحيح أو لا يطابق وضع Test/Live");
      }
      throw new Error("تعذّر إنشاء عملية الدفع");
    }

    const checkoutUrl = (checkout.checkout_url ?? "").replace(/^http:\/\//i, "https://");
    if (!checkoutUrl) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      throw new Error("لم يُرجع Chargily رابط الدفع");
    }

    await supabase
      .from("payments")
      .update({ provider_ref: checkout.id, checkout_url: checkoutUrl })
      .eq("id", payment.id);

    return { checkoutUrl };
  });

const FinalizeInput = z.object({ campaignId: z.string().uuid() });

export const finalizeCampaignPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => FinalizeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, name, status, advertiser_id")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (!campaign) throw new Error("الحملة غير موجودة");
    if (campaign.advertiser_id !== userId) throw new Error("غير مصرح");

    // Already finalized
    if (campaign.status === "active") {
      return { status: "active" as const };
    }

    // Latest payment for this campaign
    const { data: payment } = await supabase
      .from("payments")
      .select("id, status, provider_ref")
      .eq("campaign_id", data.campaignId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!payment) return { status: "pending" as const };

    let paid = payment.status === "paid";

    // Verify against Chargily when we have a provider ref
    if (!paid && payment.provider_ref) {
      const apiKey = process.env.CHARGILY_API_SECRET_KEY?.trim();
      if (apiKey) {
        const configuredMode = process.env.CHARGILY_MODE?.toLowerCase();
        const isTestKey = apiKey.toLowerCase().startsWith("test_");
        const useTestMode = configuredMode === "test" || configuredMode === "sandbox" || isTestKey;
        const useLiveMode = configuredMode === "live";
        const bases = useTestMode
          ? ["https://pay.chargily.net/test/api/v2"]
          : useLiveMode
            ? ["https://pay.chargily.net/api/v2"]
            : ["https://pay.chargily.net/api/v2", "https://pay.chargily.net/test/api/v2"];

        for (const base of bases) {
          const res = await fetch(`${base}/checkouts/${payment.provider_ref}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const co = (await res.json()) as { status?: string };
            if (co.status === "paid") paid = true;
            break;
          }
          if (res.status !== 401) break;
        }
      }
    }

    if (!paid) return { status: "pending" as const };

    // Mark payment paid
    await supabase.from("payments").update({ status: "paid" }).eq("id", payment.id);

    // Activate campaign and record the spent amount
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: paidTotals } = await supabaseAdmin
      .from("payments")
      .select("total")
      .eq("campaign_id", campaign.id)
      .eq("status", "paid");
    const spent = (paidTotals ?? []).reduce((sum, p) => sum + (p.total ?? 0), 0);

    await supabaseAdmin
      .from("campaigns")
      .update({ status: "active", spent })
      .eq("id", campaign.id);

    // Release the invitations to the influencers (conversations start on acceptance)
    await supabaseAdmin
      .from("campaign_influencers")
      .update({ status: "invited" })
      .eq("campaign_id", campaign.id)
      .eq("status", "pending_payment");

    return { status: "active" as const };
  });
