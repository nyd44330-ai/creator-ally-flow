import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PortalShell, EmptyBox } from "@/components/PortalShell";
import { fetchMyOffers, respondToOffer, formatDzd, type PortalOffer } from "@/lib/portal";

export const Route = createFileRoute("/_influencer/portal/offers")({
  head: () => ({
    meta: [
      { title: "العروض — بوابة المؤثرين" },
      { name: "description", content: "استعرض عروض الحملات المرسلة إليك واقبلها أو ارفضها." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "العروض — بوابة المؤثرين" },
      { property: "og:description", content: "استعرض عروض الحملات المرسلة إليك واقبلها أو ارفضها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OffersPage,
});

const filters = [
  { key: "all", label: "الكل" },
  { key: "invited", label: "بانتظار الرد" },
  { key: "accepted", label: "مقبولة" },
  { key: "declined", label: "مرفوضة" },
] as const;

function OffersPage() {
  return <PortalShell title="العروض">{(me) => <OffersList influencerId={me.id} />}</PortalShell>;
}

function OffersList({ influencerId }: { influencerId: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", "offers", influencerId],
    queryFn: () => fetchMyOffers(influencerId),
  });

  const items = (data ?? []).filter((o) => filter === "all" || o.status === filter);

  const respond = async (o: PortalOffer, status: "accepted" | "declined") => {
    setBusy(o.campaign_id);
    try {
      await respondToOffer(o.campaign_id, influencerId, status);
      await queryClient.invalidateQueries({ queryKey: ["portal"] });
      toast.success(status === "accepted" ? "تم قبول العرض" : "تم رفض العرض");
    } catch {
      toast.error("تعذّر تحديث العرض، حاول مجدداً");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const count = f.key === "all" ? (data ?? []).length : (data ?? []).filter((o) => o.status === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={
                "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition " +
                (filter === f.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-muted-foreground")
              }
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <EmptyBox message="تعذّر تحميل العروض، حاول التحديث." />
      ) : items.length === 0 ? (
        <EmptyBox message="لا توجد عروض في هذا التصنيف." />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((o) => (
            <li key={o.campaign_id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{o.campaign?.name ?? "حملة"}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{o.campaign?.goal ?? "—"}</p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold " +
                    (o.status === "accepted"
                      ? "bg-accent-soft text-accent"
                      : o.status === "declined"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary")
                  }
                >
                  {o.status === "invited" ? "بانتظار ردك" : o.status === "accepted" ? "مقبولة" : "مرفوضة"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{formatDzd(o.campaign?.budget ?? 0)}</span>
                {o.campaign?.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {o.campaign.start_date} → {o.campaign.end_date ?? "—"}
                  </span>
                )}
                {(o.campaign?.platforms ?? []).length > 0 && (
                  <span>{(o.campaign?.platforms ?? []).join(" · ")}</span>
                )}
              </div>

              {o.campaign?.deliverables && (
                <p className="mt-2 rounded-xl bg-muted p-2 text-[11px] leading-relaxed text-muted-foreground">
                  {o.campaign.deliverables}
                </p>
              )}

              {o.status === "invited" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy === o.campaign_id}
                    onClick={() => respond(o, "accepted")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {busy === o.campaign_id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    قبول
                  </button>
                  <button
                    type="button"
                    disabled={busy === o.campaign_id}
                    onClick={() => respond(o, "declined")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-bold text-muted-foreground transition hover:bg-muted disabled:opacity-60"
                  >
                    <X className="size-4" />
                    رفض
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
