import { createFileRoute } from "@tanstack/react-router";
import { Bell, Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { InfluencerCard } from "@/components/InfluencerCard";
import { FeaturedInfluencerCard } from "@/components/FeaturedInfluencerCard";
import { fetchInfluencers } from "@/lib/influencers";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اكتشف المؤثرين — منصة التسويق بالمؤثرين" },
      {
        name: "description",
        content:
          "تصفّح وتواصل مع أفضل المؤثرين في الجزائر والوطن العربي عبر منصة تسويق ذكية.",
      },
      { property: "og:title", content: "اكتشف المؤثرين — منصة التسويق بالمؤثرين" },
      {
        property: "og:description",
        content: "تصفّح وتواصل مع أفضل المؤثرين في الجزائر والوطن العربي عبر منصة تسويق ذكية.",
      },
    ],
  }),
  component: DiscoverPage,
});

const filters = [
  { label: "الأعلى تقييماً", active: true },
  { label: "الموقع" },
  { label: "الفئة" },
  { label: "المنصة" },
];

function DiscoverPage() {
  const [q, setQ] = useState("");
  const { data: influencers = [], isLoading, error } = useQuery({
    queryKey: ["influencers"],
    queryFn: fetchInfluencers,
  });

  const { featured, list } = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? influencers.filter(
          (i) =>
            i.name.toLowerCase().includes(query) ||
            i.category.toLowerCase().includes(query),
        )
      : influencers;
    return {
      featured: filtered.filter((i) => i.featured),
      list: filtered,
    };
  }, [influencers, q]);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 pt-4 pb-3">
          <button aria-label="الإشعارات" className="rounded-full bg-surface p-2.5 shadow-[var(--shadow-soft)]">
            <Bell className="size-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">اكتشف المؤثرين</h1>
          <button aria-label="الفلاتر" className="rounded-full bg-surface p-2.5 shadow-[var(--shadow-soft)]">
            <SlidersHorizontal className="size-5 text-foreground" />
          </button>
        </div>

        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-soft)]">
            <Search className="size-5 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مؤثر أو مجال..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none text-right"
            />
          </div>
        </div>

        <div className="mx-auto max-w-md overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2">
            <button className="shrink-0 rounded-full border border-border bg-surface p-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
            </button>
            {filters.map((f) => (
              <button
                key={f.label}
                className={
                  "shrink-0 flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
                  (f.active
                    ? "border-primary bg-primary-soft text-primary font-semibold"
                    : "border-border bg-surface text-muted-foreground")
                }
              >
                <ChevronDown className="size-3.5" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <p className="py-10 text-center text-sm text-destructive">تعذّر تحميل المؤثرين.</p>
        )}
        {!isLoading && !error && list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">لا يوجد مؤثرون.</p>
        )}

        {featured.length > 0 && (
          <section className="mt-2">
            <div className="flex items-center justify-between">
              <button className="text-sm font-semibold text-primary">عرض الكل</button>
              <h2 className="text-base font-bold text-foreground">مؤثرون مميزون</h2>
            </div>
            <div className="mt-3 -mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-row-reverse justify-end gap-3">
                {featured.map((inf) => (
                  <FeaturedInfluencerCard key={inf.id} influencer={inf} />
                ))}
              </div>
            </div>
          </section>
        )}

        {list.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold text-foreground text-right">جميع المؤثرين</h2>
            <div className="mt-3 space-y-3">
              {list.map((inf) => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

