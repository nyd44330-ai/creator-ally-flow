import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { finalizeCampaignPayment } from "@/lib/payments.functions";

const searchSchema = z.object({ campaign: z.string().uuid().optional() });

export const Route = createFileRoute("/campaign/payment/success")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "تم الدفع بنجاح" }, { name: "robots", content: "noindex" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { campaign } = useSearch({ from: "/campaign/payment/success" });
  const navigate = useNavigate();
  const finalize = useServerFn(finalizeCampaignPayment);
  const [state, setState] = useState<"working" | "done" | "pending" | "error">("working");

  useEffect(() => {
    if (!campaign) {
      setState("error");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      try {
        const res = await finalize({ data: { campaignId: campaign } });
        if (cancelled) return;
        if (res.status === "active") {
          setState("done");
          setTimeout(() => {
            if (!cancelled) navigate({ to: "/messages", replace: true });
          }, 1200);
          return;
        }
        if (attempts >= 6) {
          setState("pending");
          return;
        }
        setTimeout(tick, 2000);
      } catch (e) {
        console.error(e);
        if (!cancelled) setState("error");
      }
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [campaign, finalize, navigate]);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {state === "working" && (
        <>
          <Loader2 className="mb-4 size-10 animate-spin text-primary" />
          <h1 className="mb-2 text-lg font-bold text-foreground">جارٍ تأكيد الدفع...</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            نتحقق من عملية الدفع وتفعيل الحملة، يستغرق ذلك بضع ثوانٍ.
          </p>
        </>
      )}

      {state === "done" && (
        <>
          <div className="relative mb-6">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
            <span className="relative flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-card">
              <CheckCircle2 className="size-10" />
            </span>
          </div>
          <h1 className="mb-2 text-xl font-bold text-foreground">تم الدفع بنجاح</h1>
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            تم تفعيل الحملة وإرسال الدعوات إلى المؤثرين. سيتم تحويلك إلى الرسائل...
          </p>
          <Link to="/messages" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            فتح الرسائل الآن
          </Link>
        </>
      )}

      {state === "pending" && (
        <>
          <AlertCircle className="mb-4 size-10 text-accent-foreground" />
          <h1 className="mb-2 text-lg font-bold text-foreground">قيد التأكيد</h1>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            استلمنا طلبك ولكن لم يصلنا تأكيد الدفع بعد. ستظهر الحملة تلقائياً بمجرد التأكيد.
          </p>
          <div className="flex gap-2">
            <Link to="/campaigns" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              حملاتي
            </Link>
            <Link to="/messages" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground">
              الرسائل
            </Link>
          </div>
        </>
      )}

      {state === "error" && (
        <>
          <AlertCircle className="mb-4 size-10 text-destructive" />
          <h1 className="mb-2 text-lg font-bold text-foreground">تعذّر تأكيد الدفع</h1>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            حاول فتح حملاتك، وإذا استمرت المشكلة تواصل مع الدعم.
          </p>
          <Link to="/campaigns" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            حملاتي
          </Link>
        </>
      )}
    </div>
  );
}
