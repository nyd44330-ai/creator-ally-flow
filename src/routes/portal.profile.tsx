import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInfluencerSelf } from "@/lib/portal";

export const Route = createFileRoute("/portal/profile")({
  component: PortalProfile,
});

type Form = {
  name: string;
  image: string;
  bio: string;
  location: string;
  tiktok: string;
  instagram: string;
  youtube: string;
  tiktok_url: string;
  instagram_url: string;
  youtube_url: string;
  price_min: string;
  price_max: string;
  services: string;
};

const empty: Form = {
  name: "",
  image: "",
  bio: "",
  location: "",
  tiktok: "",
  instagram: "",
  youtube: "",
  tiktok_url: "",
  instagram_url: "",
  youtube_url: "",
  price_min: "0",
  price_max: "0",
  services: "",
};

function PortalProfile() {
  const { influencer, loading } = useInfluencerSelf();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!influencer) return;
    setForm({
      name: influencer.name ?? "",
      image: influencer.image ?? "",
      bio: influencer.bio ?? "",
      location: influencer.location ?? "",
      tiktok: influencer.tiktok ?? "",
      instagram: influencer.instagram ?? "",
      youtube: influencer.youtube ?? "",
      tiktok_url: influencer.tiktok_url ?? "",
      instagram_url: influencer.instagram_url ?? "",
      youtube_url: influencer.youtube_url ?? "",
      price_min: String(influencer.price_min ?? 0),
      price_max: String(influencer.price_max ?? 0),
      services: Array.isArray(influencer.services) ? (influencer.services as string[]).join("، ") : "",
    });
  }, [influencer]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!influencer) return;
    if (!form.name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    const min = Number(form.price_min);
    const max = Number(form.price_max);
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0) {
      toast.error("الأسعار يجب أن تكون أرقاماً صحيحة");
      return;
    }
    if (max > 0 && max < min) {
      toast.error("أعلى سعر يجب أن يكون أكبر من أقل سعر");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("influencers")
      .update({
        name: form.name.trim(),
        image: form.image.trim(),
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        tiktok: form.tiktok.trim() || null,
        instagram: form.instagram.trim() || null,
        youtube: form.youtube.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
        price_min: Math.round(min),
        price_max: Math.round(max),
        services: form.services
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", influencer.id);
    setSaving(false);

    if (error) {
      toast.error("تعذّر حفظ التعديلات");
      return;
    }
    toast.success("تم حفظ ملفك");
    queryClient.invalidateQueries({ queryKey: ["portal", "self"] });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <p className="mx-auto max-w-md px-4 pt-12 text-center text-sm text-muted-foreground">
        لم نعثر على ملفك في المنصة.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-center text-lg font-bold text-foreground">ملفي الشخصي</h1>

      <div className="mt-5 flex flex-col items-center">
        {form.image ? (
          <img src={form.image} alt={form.name} className="size-20 rounded-3xl object-cover" />
        ) : (
          <div className="size-20 rounded-3xl bg-accent-soft" />
        )}
      </div>

      <div className="mt-5 space-y-4">
        <Section title="المعلومات الأساسية">
          <Field label="الاسم" value={form.name} onChange={set("name")} />
          <Field label="رابط الصورة" value={form.image} onChange={set("image")} dir="ltr" />
          <Field label="المدينة" value={form.location} onChange={set("location")} />
          <Field label="نبذة" value={form.bio} onChange={set("bio")} textarea />
        </Section>

        <Section title="المنصات">
          <Field label="متابعو تيك توك" value={form.tiktok} onChange={set("tiktok")} />
          <Field label="رابط تيك توك" value={form.tiktok_url} onChange={set("tiktok_url")} dir="ltr" />
          <Field label="متابعو إنستغرام" value={form.instagram} onChange={set("instagram")} />
          <Field
            label="رابط إنستغرام"
            value={form.instagram_url}
            onChange={set("instagram_url")}
            dir="ltr"
          />
          <Field label="مشتركو يوتيوب" value={form.youtube} onChange={set("youtube")} />
          <Field label="رابط يوتيوب" value={form.youtube_url} onChange={set("youtube_url")} dir="ltr" />
        </Section>

        <Section title="الخدمات والأسعار">
          <Field
            label="الخدمات (افصل بينها بفاصلة)"
            value={form.services}
            onChange={set("services")}
            textarea
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="أقل سعر (دج)" value={form.price_min} onChange={set("price_min")} />
            <Field label="أعلى سعر (دج)" value={form.price_max} onChange={set("price_max")} />
          </div>
        </Section>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          حفظ التعديلات
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  dir,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
  dir?: "ltr" | "rtl";
}) {
  const cls =
    "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={onChange} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={onChange} dir={dir} className={cls} />
      )}
    </label>
  );
}
