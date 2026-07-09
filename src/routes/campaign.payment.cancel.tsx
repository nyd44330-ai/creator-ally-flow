import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/campaign/payment/cancel")({
  head: () => ({ meta: [{ title: "تم إلغاء الدفع" }, { name: "robots", content: "noindex" }] }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="size-10" />
      </span>
      <h1 className="mb-2 text-xl font-bold text-foreground">لم يكتمل الدفع</h1>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
        تم إلغاء عملية الدفع أو حدث خطأ. يمكنك المحاولة مرة أخرى من صفحة حملاتي.
      </p>
      <Link to="/campaigns" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
        الرجوع لحملاتي
      </Link>
    </div>
  );
}
