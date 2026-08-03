import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Loader2, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { PortalShell, usePortalSignOut } from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import type { PortalInfluencer } from "@/lib/portal";

export const Route = createFileRoute("/_influencer/portal/profile")({
  head: () => ({
    meta: [
      { title: "ملفي — بوابة المؤثرين" },
      { name: "description", content: "حدّث بياناتك وخدماتك وأسعارك وروابط منصاتك." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "ملفي — بوابة المؤثرين" },
      { property: "og:description", content: "حدّث بياناتك وخدماتك وأسعارك وروابط منصاتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  image: z.string().url("رابط الصورة غير صالح").or(z.literal("")),
  bio: z.string().max(600, "النبذة طويلة جداً"),
  location: z.string().max(80),
  price_min: z.number().min(0, "السعر غير صالح"),
  price_max: z.number().min(0, "السعر غير صالح"),
  tiktok_url: z.string().url("رابط غير صالح").or(z.literal("")),
  instagram_url: z.string().url("رابط غير صالح").or(z.literal("")),
  youtube_url: z.string().url("رابط غير صالح").or(z.literal("")),
});

function ProfilePage() {
  return <PortalShell title="ملفي">{(me) => <ProfileForm me={me} />}</PortalShell>;
}

function ProfileForm({ me }: { me: PortalInfluencer }) {
  const queryClient = useQueryClient();
  const signOut = usePortalSignOut();
  const [form, setForm] = useState({
    name: me.name,
    image: me.image ?? "",
    bio: me.bio ?? "",
    location: me.location ?? "",
    price_min: me.price_min,
    price_max: me.price_max,
    tiktok: me.tiktok ?? "",
    instagram: me.instagram ?? "",
    youtube: me.youtube ?? "",
    tiktok_url: me.tiktok_url ?? "",
    instagram_url: me.instagram_url ?? "",
    youtube_url: me.youtube_url ?? "",
    services: (me.services ?? []).join("، "),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      name: form.name,
      image: form.image,
      bio: form.bio,
      location: form.location,
      price_min: Number(form.price_min),
      price_max: Number(form.price_max),
      tiktok_url: form.tiktok_url,
      instagram_url: form.instagram_url,
      youtube_url: form.youtube_url,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    if (Number(form.price_max) < Number(form.price_min)) {
      setErrors({ price_max: "الحد الأعلى يجب أن يكون أكبر من الأدنى" });
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase
      .from("influencers")
      .update({
        name: form.name,
        image: form.image,
        bio: form.bio || null,
        location: form.location || null,
        price_min: Number(form.price_min),
        price_max: Number(form.price_max),
        tiktok: form.tiktok || null,
        instagram: form.instagram || null,
        youtube: form.youtube || null,
        tiktok_url: form.tiktok_url || null,
        instagram_url: form.instagram_url || null,
        youtube_url: form.youtube_url || null,
        services: form.services
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", me.id);
    setSaving(false);
    if (error) {
      toast.error("تعذّر حفظ التعديلات");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["portal", "me"] });
    toast.success("تم حفظ ملفك");
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        {form.image ? (
          <img src={form.image} alt={form.name} className="size-16 rounded-full object-cover" />
        ) : (
          <div className="size-16 rounded-full bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{form.name}</p>
          <p className="text-xs text-muted-foreground">{me.category}</p>
        </div>
      </section>

      <Card title="البيانات الأساسية">
        <Field label="الاسم" value={form.name} onChange={(v) => set("name", v)} error={errors.name} />
        <Field
          label="رابط الصورة"
          value={form.image}
          onChange={(v) => set("image", v)}
          error={errors.image}
          ltr
        />
        <Field label="المدينة" value={form.location} onChange={(v) => set("location", v)} />
        <div>
          <label className="mb-1.5 block text-xs font-bold text-foreground">نبذة</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
          />
          {errors.bio && <p className="mt-1 text-[11px] text-destructive">{errors.bio}</p>}
        </div>
      </Card>

      <Card title="الأسعار (د.ج)">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="من"
            value={String(form.price_min)}
            onChange={(v) => set("price_min", v.replace(/\D/g, ""))}
            error={errors.price_min}
            ltr
          />
          <Field
            label="إلى"
            value={String(form.price_max)}
            onChange={(v) => set("price_max", v.replace(/\D/g, ""))}
            error={errors.price_max}
            ltr
          />
        </div>
      </Card>

      <Card title="الخدمات">
        <Field
          label="افصل بين الخدمات بفاصلة"
          value={form.services}
          onChange={(v) => set("services", v)}
        />
      </Card>

      <Card title="المنصات">
        <Field label="متابعو TikTok" value={form.tiktok} onChange={(v) => set("tiktok", v)} ltr />
        <Field label="رابط TikTok" value={form.tiktok_url} onChange={(v) => set("tiktok_url", v)} error={errors.tiktok_url} ltr />
        <Field label="متابعو Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} ltr />
        <Field label="رابط Instagram" value={form.instagram_url} onChange={(v) => set("instagram_url", v)} error={errors.instagram_url} ltr />
        <Field label="متابعو YouTube" value={form.youtube} onChange={(v) => set("youtube", v)} ltr />
        <Field label="رابط YouTube" value={form.youtube_url} onChange={(v) => set("youtube_url", v)} error={errors.youtube_url} ltr />
      </Card>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground shadow-card transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        حفظ التعديلات
      </button>

      <button
        type="button"
        onClick={signOut}
        className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-surface px-4 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/5"
      >
        <LogOut className="size-4" />
        تسجيل الخروج
      </button>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-foreground">{label}</label>
      <input
        value={value}
        dir={ltr ? "ltr" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
      />
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
