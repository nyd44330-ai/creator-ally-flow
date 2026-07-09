import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/campaign/payment/success")({
  head: () => ({ meta: [{ title: "تم الدفع بنجاح" }, { name: "robots", content: "noindex" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="relative mb-6">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
        <span className="relative flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-card">
          <CheckCircle2 className="size-10" />
        </span>
      </div>
      <h1 className="mb-2 text-xl font-bold text-foreground">تم الدفع بنجاح</h1>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
        تم استلام الدفع وإرسال الدعوات إلى المؤثرين. يمكنك متابعة الحملة والمحادثات الآن.
      </p>
      <div className="flex gap-2">
        <Link to="/messages" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          فتح الرسائل
        </Link>
        <Link to="/campaigns" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground">
          حملاتي
        </Link>
      </div>
    </div>
  );
}
