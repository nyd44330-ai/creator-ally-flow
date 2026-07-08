import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Target,
  Wallet,
  Package,
  Check,
  Video,
  Image as ImageIcon,
  Megaphone,
  ShoppingBag,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube } from "react-icons/si";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "الأساسيات", icon: Target },
  { id: 2, label: "الميزانية والمدة", icon: Wallet },
  { id: 3, label: "تفاصيل التسليم", icon: Package },
] as const;

const goals = [
  { id: "awareness", label: "زيادة الوعي بالعلامة", icon: Megaphone },
  { id: "sales", label: "زيادة المبيعات", icon: ShoppingBag },
  { id: "followers", label: "زيادة المتابعين", icon: Users },
  { id: "engagement", label: "زيادة التفاعل", icon: TrendingUp },
  { id: "launch", label: "إطلاق منتج جديد", icon: Sparkles },
] as const;

const contentTypes = [
  { id: "reel", label: "فيديو قصير (Reel)", icon: Video },
  { id: "story", label: "ستوري", icon: ImageIcon },
  { id: "post", label: "منشور صورة", icon: ImageIcon },
  { id: "live", label: "بث مباشر", icon: Video },
] as const;

const platforms = [
  { id: "tiktok", label: "تيك توك", icon: SiTiktok },
  { id: "instagram", label: "إنستغرام", icon: SiInstagram },
  { id: "youtube", label: "يوتيوب", icon: SiYoutube },
] as const;

type FormState = {
  name: string;
  goal: string;
  contentTypes: string[];
  platforms: string[];
  budget: number;
  durationDays: number;
  startDate: string;
  deliverables: string;
  notes: string;
};

const initial: FormState = {
  name: "",
  goal: "",
  contentTypes: [],
  platforms: [],
  budget: 50000,
  durationDays: 14,
  startDate: "",
  deliverables: "",
  notes: "",
};

export const Route = createFileRoute("/campaign/new")({
  head: () => ({
    meta: [
      { title: "إنشاء حملة جديدة — منصة التسويق بالمؤثرين" },
      { name: "description", content: "أنشئ حملة تسويقية جديدة وحدد الهدف والميزانية والمدة." },
    ],
  }),
  component: NewCampaignPage,
});

function NewCampaignPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (k: "contentTypes" | "platforms", id: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id],
    }));

  const canNext =
    (step === 1 &&
      form.name.trim().length >= 3 &&
      form.goal &&
      form.contentTypes.length > 0 &&
      form.platforms.length > 0) ||
    (step === 2 && form.budget >= 5000 && form.durationDays >= 1 && form.startDate) ||
    (step === 3 && form.deliverables.trim().length >= 10);

  const handleSubmit = () => {
    toast.success("تمت مراجعة الحملة", {
      description: `أكمل الدفع لإطلاق حملة "${form.name}".`,
    });
    navigate({ to: "/campaign/payment" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link
            to="/campaigns"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">
            إنشاء حملة جديدة
          </h1>
          <span className="w-9 text-xs text-muted-foreground">
            {step}/{steps.length}
          </span>
        </div>
        <Stepper current={step} />
      </header>

      <main className="mx-auto max-w-md px-4 pt-5">
        {step === 1 && (
          <section className="space-y-6">
            <Field label="اسم الحملة">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="مثلاً: إطلاق العطر الصيفي"
                maxLength={80}
                className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Field label="هدف الحملة">
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <OptionCard
                    key={g.id}
                    active={form.goal === g.id}
                    onClick={() => update("goal", g.id)}
                    icon={<g.icon className="size-5" />}
                    label={g.label}
                  />
                ))}
              </div>
            </Field>

            <Field label="نوع المحتوى (اختر واحد أو أكثر)">
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((c) => (
                  <OptionCard
                    key={c.id}
                    active={form.contentTypes.includes(c.id)}
                    onClick={() => toggle("contentTypes", c.id)}
                    icon={<c.icon className="size-5" />}
                    label={c.label}
                  />
                ))}
              </div>
            </Field>

            <Field label="المنصات المستهدفة">
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((p) => (
                  <OptionCard
                    key={p.id}
                    active={form.platforms.includes(p.id)}
                    onClick={() => toggle("platforms", p.id)}
                    icon={<p.icon className="size-5" />}
                    label={p.label}
                  />
                ))}
              </div>
            </Field>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <Field label="الميزانية (دج)">
              <div className="rounded-xl border border-input bg-surface p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {form.budget.toLocaleString("ar-DZ")} دج
                  </span>
                  <span className="text-xs text-muted-foreground">
                    من 5,000 إلى 1,000,000
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={1000000}
                  step={5000}
                  value={form.budget}
                  onChange={(e) => update("budget", Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[20000, 50000, 100000, 200000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update("budget", v)}
                      className="rounded-lg border border-border bg-muted px-2 py-1.5 text-xs font-medium text-foreground hover:bg-primary-soft hover:text-primary"
                    >
                      {v.toLocaleString("ar-DZ")}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <Field label="مدة الحملة">
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update("durationDays", d)}
                    className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                      form.durationDays === d
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface text-foreground hover:border-primary/40"
                    }`}
                  >
                    {d} يوم
                  </button>
                ))}
              </div>
            </Field>

            <Field label="تاريخ البداية">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6">
            <Field label="تفاصيل التسليم">
              <textarea
                value={form.deliverables}
                onChange={(e) => update("deliverables", e.target.value)}
                placeholder="مثلاً: 3 ريلز خلال أسبوعين + 5 ستوريز، مع ذكر العلامة والوسم..."
                rows={5}
                maxLength={800}
                className="w-full resize-none rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.deliverables.length}/800 حرف
              </p>
            </Field>

            <Field label="ملاحظات إضافية (اختياري)">
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="أي متطلبات أخرى، هاشتاقات، حسابات للإشارة إليها..."
                rows={3}
                maxLength={400}
                className="w-full resize-none rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Summary form={form} />
          </section>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <ArrowRight className="size-4" />
              السابق
            </button>
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (step < 3 ? setStep((s) => s + 1) : handleSubmit())}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-95 disabled:opacity-40"
          >
            {step < 3 ? "التالي" : "إنشاء الحملة"}
            {step < 3 ? <ArrowLeft className="size-4" /> : <Check className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-3">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => {
          const done = current > s.id;
          const active = current === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary-soft text-primary ring-2 ring-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-4" /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
        {steps[current - 1].label}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-right text-sm font-medium transition ${
        active
          ? "border-primary bg-primary-soft text-primary shadow-soft"
          : "border-border bg-surface text-foreground hover:border-primary/40"
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function Summary({ form }: { form: FormState }) {
  const goalLabel = goals.find((g) => g.id === form.goal)?.label ?? "—";
  return (
    <div className="rounded-2xl border border-border bg-primary-soft/50 p-4">
      <h3 className="mb-3 text-sm font-bold text-primary">ملخص الحملة</h3>
      <dl className="space-y-2 text-sm">
        <Row k="الاسم" v={form.name || "—"} />
        <Row k="الهدف" v={goalLabel} />
        <Row
          k="الميزانية"
          v={`${form.budget.toLocaleString("ar-DZ")} دج`}
        />
        <Row k="المدة" v={`${form.durationDays} يوم`} />
        <Row k="البداية" v={form.startDate || "—"} />
        <Row
          k="المنصات"
          v={
            form.platforms
              .map((p) => platforms.find((x) => x.id === p)?.label)
              .join("، ") || "—"
          }
        />
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-foreground text-left">{v}</dd>
    </div>
  );
}
