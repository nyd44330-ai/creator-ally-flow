import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Star, Wallet, ChevronLeft } from "lucide-react";
import { PortalShell, EmptyBox } from "@/components/PortalShell";
import { fetchMyOffers, fetchMyEarnings, formatDzd } from "@/lib/portal";

export const Route = createFileRoute("/_influencer/portal/")({
  head: () => ({
    meta: [
      { title: "لوحة المؤثر — بوابة المؤثرين" },
      { name: "description", content: "نظرة سريعة على عروضك وأرباحك وتقييمك." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة المؤثر — بوابة المؤثرين" },
      { property: "og:description", content: "نظرة سريعة على عروضك وأرباحك وتقييمك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalHome,
});

function PortalHome() {
  return (
    <PortalShell title="بوابة المؤثرين">
      {(me) => <Dashboard influencerId={me.id} name={me.name} image={me.image} rating={me.rating} />}
    </PortalShell>
  );
}

function Dashboard({
  influencerId,
  name,
  image,
  rating,
}: {
  influencerId: string;
  name: string;
  image: string;
  rating: number;
}) {
  const offers = useQuery({
    queryKey: ["portal", "offers", influencerId],
    queryFn: () => fetchMyOffers(influencerId),
  });
  const earnings = useQuery({ queryKey: ["portal", "earnings"], queryFn: fetchMyEarnings });

  const newOffers = (offers.data ?? []).filter((o) => o.status === "invited");
  const total = (earnings.data ?? []).reduce((s, e) => s + e.share, 0);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        {image ? (
          <img src={image} alt={name} className="size-14 rounded-full object-cover" />
        ) : (
          <div className="size-14 rounded-full bg-muted" />
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">مرحباً بك</p>
          <p className="truncate text-base font-bold text-foreground">{name}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <StatCard icon={<Inbox className="size-4" />} label="عروض جديدة" value={String(newOffers.length)} />
        <StatCard icon={<Wallet className="size-4" />} label="الأرباح" value={formatDzd(total)} />
        <StatCard icon={<Star className="size-4" />} label="التقييم" value={rating.toFixed(1)} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">آخر العروض</h2>
          <Link to="/portal/offers" className="flex items-center text-xs font-medium text-accent">
            الكل <ChevronLeft className="size-4" />
          </Link>
        </div>
        {offers.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (offers.data ?? []).length === 0 ? (
          <EmptyBox message="لا توجد عروض بعد. ستظهر هنا عندما يدعوك معلن لحملة." />
        ) : (
          <ul className="flex flex-col gap-2">
            {(offers.data ?? []).slice(0, 3).map((o) => (
              <li
                key={o.campaign_id}
                className="rounded-2xl border border-border bg-surface p-3 shadow-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-foreground">
                    {o.campaign?.name ?? "حملة"}
                  </p>
                  <span className="shrink-0 rounded-lg bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                    {o.status === "invited" ? "بانتظار ردك" : o.status === "accepted" ? "مقبولة" : "مرفوضة"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {o.campaign?.goal ?? "—"} · {formatDzd(o.campaign?.budget ?? 0)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center shadow-soft">
      <span className="mx-auto mb-1 flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <p className="truncate text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
