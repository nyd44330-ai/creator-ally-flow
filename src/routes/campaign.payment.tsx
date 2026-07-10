import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  Building2,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { createChargilyCheckout } from "@/lib/payments.functions";

const searchSchema = z.object({ campaign: z.string().uuid().optional() });

export const Route = createFileRoute("/campaign/payment")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "الدفع — إنشاء حملة" },
      { name: "description", content: "أكمل الدفع الآمن لإطلاق حملتك عبر Chargily." },
    ],
  }),
  component: PaymentPage,
});

type Method = "card" | "edahabia" | "bank";

const methods: {
  id: Method;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "edahabia", label: "الذهبية (EDAHABIA)", hint: "دفع فوري ببطاقة الجزائر", icon: Wallet },
  { id: "card", label: "CIB / بطاقة بنكية", hint: "بطاقات CIB الجزائرية", icon: CreditCard },
  { id: "bank", label: "تحويل بنكي", hint: "تأكيد يدوي خلال 24 ساعة", icon: Building2 },
];

function formatDZD(n: number) {
  return `${n.toLocaleString("ar-DZ")} دج`;
}

function PaymentPage() {
  const navigate = useNavigate();
  const { campaign } = useSearch({ from: "/campaign/payment" });
  const { user, loading: authLoading, isAuthed } = useAuth();
  const [method, setMethod] = useState<Method>("edahabia");
  const [processing, setProcessing] = useState(false);
  const [campaignData, setCampaignData] = useState<{ name: string; budget: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const createCheckout = useServerFn(createChargilyCheckout);

  useEffect(() => {
    if (!authLoading && !isAuthed) {
      navigate({ to: "/auth", search: { next: `/campaign/payment?campaign=${campaign ?? ""}` } });
    }
  }, [authLoading, isAuthed, campaign, navigate]);

  useEffect(() => {
    if (!user || !campaign) {
      setLoading(false);
      return;
    }
    supabase
      .from("campaigns")
      .select("name, budget")
      .eq("id", campaign)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching campaign:", error);
          toast.error("تعذّر تحميل بيانات الحملة");
        } else if (data) {
          setCampaignData(data);
        }
        setLoading(false);
      });
  }, [user, campaign]);

  const amount = campaignData?.budget ?? 0;
  const fee = Math.round(amount * 0.05);
  const tax = Math.round((amount + fee) * 0.09);
  const total = amount + fee + tax;

  const summary = useMemo(
    () => [
      { k: "قيمة الحملة", v: formatDZD(amount) },
      { k: "عمولة المنصة (5%)", v: formatDZD(fee) },
      { k: "الرسوم (9%)", v: formatDZD(tax) },
    ],
    [amount, fee, tax],
  );

  const handlePay = async () => {
    if (!campaign) {
      toast.error("لا توجد حملة للدفع");
      return;
    }
    setProcessing(true);
    try {
      const res = await createCheckout({ data: { campaignId: campaign, method } });
      window.location.href = res.checkoutUrl;
    } catch (e) {
      console.error(e);
      toast.error("تعذّر بدء الدفع، حاول مجدداً");
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign || !campaignData) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">لا توجد حملة معلّقة للدفع</p>
        <Link to="/campaigns" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          العودة إلى حملاتي
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link to="/campaigns" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="رجوع">
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">الدفع الآمن</h1>
          <span className="w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 pt-5">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <h2 className="mb-1 text-sm font-bold text-foreground">{campaignData.name}</h2>
          <p className="mb-3 text-xs text-muted-foreground">ملخص الدفع</p>
          <dl className="space-y-2 text-sm">
            {summary.map((r) => (
              <div key={r.k} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{r.k}</dt>
                <dd className="font-semibold text-foreground">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 border-t border-dashed border-border pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">الإجمالي</span>
              <span className="text-2xl font-bold text-primary">{formatDZD(total)}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-foreground">اختر طريقة الدفع</h2>
          <div className="space-y-2">
            {methods.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${
                    active ? "border-primary bg-primary-soft shadow-soft" : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <m.icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.hint}</span>
                  </span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex gap-3 rounded-2xl border border-primary/20 bg-primary-soft/60 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div className="text-sm leading-relaxed text-foreground">
            <p className="mb-1 font-bold text-primary">دفع محفوظ عبر Chargily</p>
            <p className="text-muted-foreground">
              سيتم الاحتفاظ بالمبلغ لدى المنصة بشكل آمن، ولن يُحوَّل للمؤثر إلا بعد قبوله للحملة.
            </p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <button
            type="button"
            disabled={processing}
            onClick={handlePay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-95 disabled:opacity-60"
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ التحويل إلى Chargily...
              </>
            ) : (
              <>
                <Lock className="size-4" />
                ادفع {formatDZD(total)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
