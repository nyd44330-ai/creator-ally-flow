import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/campaign/payment")({
  head: () => ({
    meta: [
      { title: "الدفع — إنشاء حملة" },
      {
        name: "description",
        content: "أكمل الدفع الآمن لإطلاق حملتك وإرسال الدعوات للمؤثرين.",
      },
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
  { id: "edahabia", label: "الذهبية / CIB", hint: "دفع فوري بالبطاقة الجزائرية", icon: Wallet },
  { id: "card", label: "بطاقة بنكية دولية", hint: "Visa / Mastercard", icon: CreditCard },
  { id: "bank", label: "تحويل بنكي", hint: "تأكيد خلال 24 ساعة", icon: Building2 },
];

function formatDZD(n: number) {
  return `${n.toLocaleString("ar-DZ")} دج`;
}

function PaymentPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("edahabia");
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");

  const campaignAmount = 50000;
  const fee = Math.round(campaignAmount * 0.05);
  const tax = Math.round((campaignAmount + fee) * 0.09);
  const total = campaignAmount + fee + tax;

  const summary = useMemo(
    () => [
      { k: "قيمة الحملة", v: formatDZD(campaignAmount) },
      { k: "عمولة المنصة (5%)", v: formatDZD(fee) },
      { k: "الرسوم (9%)", v: formatDZD(tax) },
    ],
    [campaignAmount, fee, tax],
  );

  const handlePay = () => {
    setState("processing");
    setTimeout(() => setState("done"), 1400);
    setTimeout(() => navigate({ to: "/messages" }), 2600);
  };

  if (state === "done") {
    return <SuccessScreen />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link
            to="/campaign/new"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">
            الدفع الآمن
          </h1>
          <span className="w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 pt-5">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-bold text-foreground">ملخص الدفع</h2>
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
                    active
                      ? "border-primary bg-primary-soft shadow-soft"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <m.icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {m.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">{m.hint}</span>
                  </span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
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
            <p className="mb-1 font-bold text-primary">دفع محفوظ بأمان</p>
            <p className="text-muted-foreground">
              سيتم الاحتفاظ بمبلغ الدفع لدى المنصة بشكل آمن، ولن يُحوَّل إلى المؤثر إلا
              بعد قبوله للحملة وانطلاق التعاون رسمياً.
            </p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <button
            type="button"
            disabled={state === "processing"}
            onClick={handlePay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-95 disabled:opacity-60"
          >
            {state === "processing" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري معالجة الدفع...
              </>
            ) : (
              <>
                <Lock className="size-4" />
                ادفع وأنشئ الحملة · {formatDZD(total)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"
    >
      <div className="relative mb-6">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
        <span className="relative flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-card">
          <CheckCircle2 className="size-10" />
        </span>
      </div>
      <h1 className="mb-2 text-xl font-bold text-foreground">تم إنشاء الحملة بنجاح</h1>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
        أُرسلت الدعوات إلى المؤثرين المختارين وفُتحت محادثة معهم. سيتم توجيهك إلى صفحة
        الرسائل...
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        تحويل...
      </div>
    </div>
  );
}
