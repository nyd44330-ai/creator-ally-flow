import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Calendar, Wallet, TrendingUp, Users, Loader2 } from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube } from "react-icons/si";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { statusLabel, type CampaignStatus } from "@/lib/campaign-status";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});

type FilterKey = "all" | CampaignStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشطة" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "draft", label: "مسودة" },
  { key: "completed", label: "مكتملة" },
  { key: "cancelled", label: "ملغاة" },
];

type Row = {
  id: string;
  name: string;
  goal: string | null;
  status: CampaignStatus;
  budget: number;
  spent: number;
  start_date: string | null;
  end_date: string | null;
  platforms: string[];
};

function formatDZD(n: number) {
  return `${n.toLocaleString("ar-DZ")} دج`;
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-DZ", { day: "numeric", month: "short" });
}

const statusStyle: Record<CampaignStatus, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-accent/15 text-accent-foreground",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

function CampaignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("campaigns")
      .select("id,name,goal,status,budget,spent,start_date,end_date,platforms")
      .eq("advertiser_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setRows((data as Row[] | null) ?? []);
        setLoading(false);
      });
  }, [user]);

  const filtered = useMemo(
    () =>
      rows.filter((c) => {
        if (filter !== "all" && c.status !== filter) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          if (!c.name.toLowerCase().includes(q) && !(c.goal ?? "").toLowerCase().includes(q))
            return false;
        }
        return true;
      }),
    [rows, query, filter],
  );

  const counts = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((c) => c.status === "active").length;
    const totalBudget = rows.reduce((s, c) => s + c.budget, 0);
    return { total, active, totalBudget };
  }, [rows]);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 pt-6 pb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">حملاتي</h1>
            <p className="text-xs text-muted-foreground">تابع أداء جميع حملاتك</p>
          </div>
          <Link
            to="/campaign/new"
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-card hover:opacity-95"
          >
            <Plus className="size-4" />
            جديدة
          </Link>
        </div>

        <div className="mx-auto max-w-md px-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<TrendingUp className="size-4" />} label="نشطة" value={String(counts.active)} />
            <StatCard icon={<Users className="size-4" />} label="الإجمالي" value={String(counts.total)} />
            <StatCard
              icon={<Wallet className="size-4" />}
              label="الميزانية"
              value={`${Math.round(counts.totalBudget / 1000)}ك`}
            />
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 pt-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في حملاتك..."
              className="w-full rounded-xl border border-border bg-surface py-2.5 pr-9 pl-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mx-auto max-w-md overflow-x-auto px-4 pt-3 pb-3">
          <div className="flex gap-2">
            {filters.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === "all" ? rows.length : rows.filter((c) => c.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-surface text-muted-foreground border border-border"
                  }`}
                >
                  {f.label}
                  <span className="mr-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-1">
        {loading || authLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">لا توجد حملات مطابقة.</p>
            <Link
              to="/campaign/new"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Plus className="size-4" />
              إنشاء حملة
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-2.5">
      <div className="flex items-center gap-1 text-primary">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1 text-base font-bold text-foreground">{value}</div>
    </div>
  );
}

function CampaignCard({ c }: { c: Row }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-foreground">{c.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.goal ?? "—"}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[c.status]}`}
        >
          {statusLabel[c.status]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          {formatDate(c.start_date)} - {formatDate(c.end_date)}
        </span>
        <span className="flex items-center gap-1">
          {c.platforms.includes("tiktok") && <SiTiktok className="size-3" />}
          {c.platforms.includes("instagram") && <SiInstagram className="size-3 text-pink-500" />}
          {c.platforms.includes("youtube") && <SiYoutube className="size-3 text-red-500" />}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">أُنفق / الميزانية</p>
          <p className="text-xs font-bold text-foreground">
            {formatDZD(c.spent)}{" "}
            <span className="text-muted-foreground font-normal">/ {formatDZD(c.budget)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
