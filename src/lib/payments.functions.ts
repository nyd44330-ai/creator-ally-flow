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

    const amount = campaign.budget;
    const fee = Math.round(amount * 0.05);
    const tax = Math.round((amount + fee) * 0.09);
    const total = amount + fee + tax;

    const apiKey = process.env.CHARGILY_API_SECRET_KEY;
    if (!apiKey) throw new Error("Chargily غير مفعّل");

    const origin =
      process.env.APP_URL ??
      `https://project--${process.env.SUPABASE_PROJECT_ID ?? "app"}.lovable.app`;

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

    const res = await fetch("https://pay.chargily.net/api/v2/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Chargily error", res.status, txt);
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      throw new Error("تعذّر إنشاء عملية الدفع");
    }

    const checkout = (await res.json()) as ChargilyCheckoutResponse;

    await supabase
      .from("payments")
      .update({ provider_ref: checkout.id, checkout_url: checkout.checkout_url })
      .eq("id", payment.id);

    return { checkoutUrl: checkout.checkout_url };
  });
