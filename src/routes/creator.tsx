import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Plus, Trash2, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  claimInfluencerProfile,
  getMyInfluencerProfile,
  updateMyInfluencerProfile,
  getMyInvitedCampaigns,
  respondToCampaignInvite,
} from "@/lib/creator.functions";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "لوحة المؤثر — إدارة ملفك" },
      { name: "description", content: "عدّل أسعارك وخدماتك وأعمالك، وتابع الحملات الموجهة إليك." },
    ],
  }),
  component: CreatorPage,
});

type Tab = "profile" | "portfolio" | "campaigns";

function CreatorPage() {
  const { isAuthed, loading } = useAuth();
  const navigate = useNavigate();
  const claim = useServerFn(claimInfluencerProfile);
  const getProfile = useServerFn(getMyInfluencerProfile);
  const [tab, setTab] = useState<Tab>("profile");

  const profileQ = useQuery({
    queryKey: ["my-influencer-profile"],
    queryFn: () => getProfile(),
    enabled: isAuthed,
  });

  // Auto-claim on first visit
  useEffect(() => {
    if (!isAuthed || profileQ.isLoading) return;
    if (!profileQ.data) {
      claim().then((r) => {
        if (r.claimed) profileQ.refetch();
      });
    }
  }, [isAuthed, profileQ.data, profileQ.isLoading, claim, profileQ]);

  useEffect(() => {
    if (!loading && !isAuthed) navigate({ to: "/auth", search: { next: "/creator" } });
  }, [loading, isAuthed, navigate]);

  if (loading || profileQ.isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileQ.data) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 pt-6 text-center">
          <h1 className="text-lg font-bold text-foreground">لا يوجد ملف مؤثر مرتبط بحسابك</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            إذا كنت مؤثرًا مسجَّلًا لدينا، تأكد من تسجيل الدخول بنفس البريد الإلكتروني الذي زوّدتنا به.
            إن لم يكن لديك ملف بعد، تواصل معنا للانضمام.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", search: { next: "/creator" } });
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground"
          >
            <LogOut className="size-4" />
            تسجيل الخروج والدخول بحساب آخر
          </button>
        </main>
      </div>
    );
  }

  const inf = profileQ.data;

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-16">
      <Header />
      <main className="mx-auto max-w-md px-4 pt-2">
        <div className="flex items-center gap-3">
          <img src={inf.image} alt={inf.name} className="size-14 rounded-full object-cover ring-2 ring-primary-soft" />
          <div className="text-right">
            <h1 className="text-lg font-bold text-foreground">{inf.name}</h1>
            <p className="text-xs text-muted-foreground">{inf.category}</p>
          </div>
        </div>

        <div className="mt-5 flex rounded-2xl bg-muted p-1 text-sm">
          {(
            [
              ["profile", "ملفي"],
              ["portfolio", "أعمالي"],
              ["campaigns", "الحملات"],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "flex-1 rounded-xl px-3 py-2 font-semibold transition-colors " +
                (tab === k ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "profile" && <ProfileTab inf={inf} />}
          {tab === "portfolio" && <PortfolioTab inf={inf} />}
          {tab === "campaigns" && <CampaignsTab />}
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="mx-auto flex max-w-md items-center justify-between px-4 pt-4">
      <Link to="/" aria-label="رجوع" className="rounded-full p-2 text-muted-foreground hover:bg-muted">
        <ArrowRight className="size-5" />
      </Link>
      <h2 className="text-sm font-bold text-foreground">لوحة المؤثر</h2>
      <span className="size-8" />
    </header>
  );
}

// ---------- Profile tab ----------

type InfluencerRow = {
  id: string;
  name: string;
  image: string;
  category: string;
  price_min: number;
  price_max: number;
  services: unknown;
  bio: string | null;
  location: string | null;
  languages: unknown;
  portfolio: unknown;
};

function ProfileTab({ inf }: { inf: InfluencerRow }) {
  const qc = useQueryClient();
  const update = useServerFn(updateMyInfluencerProfile);
  const [priceMin, setPriceMin] = useState(inf.price_min);
  const [priceMax, setPriceMax] = useState(inf.price_max);
  const [services, setServices] = useState<string[]>(Array.isArray(inf.services) ? (inf.services as string[]) : []);
  const [newSvc, setNewSvc] = useState("");
  const [bio, setBio] = useState(inf.bio ?? "");
  const [location, setLocation] = useState(inf.location ?? "");

  const mut = useMutation({
    mutationFn: () =>
      update({
        data: {
          price_min: priceMin,
          price_max: priceMax,
          services,
          bio: bio || null,
          location: location || null,
        },
      }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["my-influencer-profile"] });
      qc.invalidateQueries({ queryKey: ["influencers"] });
      qc.invalidateQueries({ queryKey: ["influencer", inf.id] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر الحفظ"),
  });

  return (
    <section className="space-y-4">
      <Card title="الأسعار (دج)">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="الحد الأدنى" value={priceMin} onChange={setPriceMin} />
          <NumberField label="الحد الأقصى" value={priceMax} onChange={setPriceMax} />
        </div>
      </Card>

      <Card title="الخدمات">
        <div className="flex flex-wrap justify-end gap-1.5">
          {services.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {s}
              <button aria-label="حذف" onClick={() => setServices(services.filter((x) => x !== s))}>
                <Trash2 className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newSvc}
            onChange={(e) => setNewSvc(e.target.value)}
            placeholder="أضف خدمة جديدة"
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              const v = newSvc.trim();
              if (v && !services.includes(v)) setServices([...services, v]);
              setNewSvc("");
            }}
            className="rounded-xl bg-primary px-3 text-primary-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </Card>

      <Card title="نبذة">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm"
        />
      </Card>

      <Card title="الموقع">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={120}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        />
      </Card>

      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60"
      >
        {mut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        حفظ التغييرات
      </button>
    </section>
  );
}

// ---------- Portfolio tab ----------

type PortfolioItem = {
  id: string;
  image: string;
  title: string;
  brand: string;
  platform: "tiktok" | "instagram" | "youtube";
  views: string;
};

function PortfolioTab({ inf }: { inf: InfluencerRow }) {
  const qc = useQueryClient();
  const update = useServerFn(updateMyInfluencerProfile);
  const initial: PortfolioItem[] = Array.isArray(inf.portfolio) ? (inf.portfolio as PortfolioItem[]) : [];
  const [items, setItems] = useState<PortfolioItem[]>(initial);
  const [draft, setDraft] = useState<PortfolioItem>({
    id: "",
    image: "",
    title: "",
    brand: "",
    platform: "instagram",
    views: "",
  });

  const mut = useMutation({
    mutationFn: (portfolio: PortfolioItem[]) => update({ data: { portfolio } }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["my-influencer-profile"] });
      qc.invalidateQueries({ queryKey: ["influencer", inf.id] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر الحفظ"),
  });

  const add = () => {
    if (!draft.image || !draft.title) {
      toast.error("الصورة والعنوان مطلوبان");
      return;
    }
    const next = [
      ...items,
      { ...draft, id: crypto.randomUUID() },
    ];
    setItems(next);
    setDraft({ id: "", image: "", title: "", brand: "", platform: "instagram", views: "" });
    mut.mutate(next);
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    mut.mutate(next);
  };

  return (
    <section className="space-y-4">
      <Card title="إضافة عمل جديد">
        <div className="space-y-2">
          <input
            placeholder="رابط الصورة"
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
          <input
            placeholder="عنوان العمل"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
          <input
            placeholder="اسم البراند"
            value={draft.brand}
            onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={draft.platform}
              onChange={(e) => setDraft({ ...draft, platform: e.target.value as PortfolioItem["platform"] })}
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
            <input
              placeholder="المشاهدات (مثل 1.2M)"
              value={draft.views}
              onChange={(e) => setDraft({ ...draft, views: e.target.value })}
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={add}
            disabled={mut.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Plus className="size-4" /> إضافة
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <article key={it.id} className="overflow-hidden rounded-2xl bg-surface shadow-soft">
            <img src={it.image} alt={it.title} className="aspect-square w-full object-cover" />
            <div className="p-2.5 text-right">
              <p className="line-clamp-1 text-xs font-semibold text-foreground">{it.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{it.brand}</p>
              <button
                onClick={() => remove(it.id)}
                className="mt-2 flex items-center gap-1 text-[11px] text-destructive"
              >
                <Trash2 className="size-3" /> حذف
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="col-span-2 rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
            لا توجد أعمال بعد.
          </p>
        )}
      </div>
    </section>
  );
}

// ---------- Campaigns tab ----------

function CampaignsTab() {
  const qc = useQueryClient();
  const getInvites = useServerFn(getMyInvitedCampaigns);
  const respond = useServerFn(respondToCampaignInvite);
  const invitesQ = useQuery({
    queryKey: ["my-invites"],
    queryFn: () => getInvites(),
  });

  const mut = useMutation({
    mutationFn: (v: { campaignId: string; action: "accepted" | "rejected" }) =>
      respond({ data: v }),
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["my-invites"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر التحديث"),
  });

  if (invitesQ.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  type Row = {
    status: string;
    campaign: { id: string; name: string; goal: string | null; budget: number | null; status: string } | null;
  };
  const rows = (invitesQ.data ?? []) as Row[];

  if (rows.length === 0) {
    return <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">لا توجد حملات موجهة إليك بعد.</p>;
  }

  return (
    <section className="space-y-3">
      {rows.map((r) => {
        if (!r.campaign) return null;
        const c = r.campaign;
        return (
          <article key={c.id} className="rounded-2xl bg-surface p-4 text-right shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <StatusBadge status={r.status} />
              <h3 className="font-bold text-foreground">{c.name}</h3>
            </div>
            {c.goal && <p className="mt-1 text-xs text-muted-foreground">{c.goal}</p>}
            {c.budget != null && (
              <p className="mt-2 text-sm font-semibold text-foreground">
                {c.budget.toLocaleString("en-US")} دج
              </p>
            )}
            {(r.status === "pending" || r.status === "invited") && (
              <div className="mt-3 flex gap-2">
                <button
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ campaignId: c.id, action: "accepted" })}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  قبول
                </button>
                <button
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ campaignId: c.id, action: "rejected" })}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground disabled:opacity-60"
                >
                  رفض
                </button>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    invited: { label: "بانتظار الرد", cls: "bg-yellow-100 text-yellow-800" },
    pending: { label: "بانتظار الرد", cls: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "مقبولة", cls: "bg-green-100 text-green-800" },
    rejected: { label: "مرفوضة", cls: "bg-red-100 text-red-800" },
  };

  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold " + s.cls}>{s.label}</span>;
}

// ---------- Shared ----------

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface p-4 text-right shadow-soft">
      <h3 className="mb-3 text-sm font-bold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-right">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
      />
    </label>
  );
}
