import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Clock, CheckCircle2 } from "lucide-react";
import { PortalShell, EmptyBox } from "@/components/PortalShell";
import { fetchMyEarnings, formatDzd } from "@/lib/portal";

export const Route = createFileRoute("/_influencer/portal/earnings")({
  head: () => ({
    meta: [
      { title: "الأرباح — بوابة المؤثرين" },
      { name: "description", content: "تابع أرباحك من الحملات المقبولة وحالة كل دفعة." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "الأرباح — بوابة المؤثرين" },
      { property: "og:description", content: "تابع أرباحك من الحملات المقبولة وحالة كل دفعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EarningsPage,
});

function EarningsPage() {
  return <PortalShell title="الأرباح">{() => <EarningsBody />}</PortalShell>;
}

function EarningsBody() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", "earnings"],
    queryFn: fetchMyEarnings,
  });

  const items = data ?? [];
  const paid = items.filter((e) => e.paid).reduce((s, e) => s + e.share, 0);
  const pending = items.filter((e) => !e.paid).reduce((s, e) => s + e.share, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-accent p-5 text-accent-foreground shadow-card">
        <p className="text-xs opacity-80">إجمالي الأرباح</p>
        <p className="mt-1 text-2xl font-bold">{formatDzd(paid + pending)}</p>
        <p className="mt-2 text-[11px] opacity-80">
          يُحتسب نصيبك من ميزانية كل حملة مقسومة على عدد المؤثرين المشاركين فيها.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <span className="mb-1 flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <CheckCircle2 className="size-4" />
          </span>
          <p className="text-sm font-bold text-foreground">{formatDzd(paid)}</p>
          <p className="text-[10px] text-muted-foreground">مدفوعة للمنصة</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <span className="mb-1 flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Clock className="size-4" />
          </span>
          <p className="text-sm font-bold text-foreground">{formatDzd(pending)}</p>
          <p className="text-[10px] text-muted-foreground">قيد التحصيل</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold text-foreground">التفاصيل</h2>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <EmptyBox message="تعذّر تحميل الأرباح، حاول التحديث." />
        ) : items.length === 0 ? (
          <EmptyBox message="لا توجد أرباح بعد. اقبل عرضاً لتبدأ." />
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((e) => (
              <li
                key={e.campaign_id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Wallet className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{e.campaign_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.participants} مؤثر في الحملة · {e.paid ? "مدفوعة" : "قيد التحصيل"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-foreground">{formatDzd(e.share)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
