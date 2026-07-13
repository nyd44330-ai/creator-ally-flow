import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Pencil,
  Mail,
  Phone,
  Building2,
  Globe,
  Briefcase,
  Lock,
  Bell,
  Languages,
  ShieldCheck,
  CreditCard,
  Plus,
  HelpCircle,
  MessageCircleQuestion,
  FileText,
  ScrollText,
  LogOut,
  ChevronLeft,
  Camera,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { useMyInfluencerProfile } from "@/lib/creator-hooks";


export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي — منصة التسويق بالمؤثرين" },
      { name: "description", content: "إدارة معلوماتك الشخصية والتجارية وإعدادات الحساب." },
    ],
  }),
  component: AccountPage,
});

type Profile = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
};

type Business = {
  company: string;
  industry: string;
  website: string;
  description: string;
};

const initialProfile: Profile = {
  fullName: "أمين بلقاسم",
  company: "نور للتجارة",
  email: "amine@noor.dz",
  phone: "+213 555 12 34 56",
  avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Amine%20Belkacem&backgroundColor=6366f1",
};

const initialBusiness: Business = {
  company: "نور للتجارة",
  industry: "التجارة الإلكترونية",
  website: "https://noor.dz",
  description:
    "متجر إلكتروني متخصص في العطور ومستحضرات التجميل بالجزائر، يستهدف الفئة العمرية 18-35 سنة.",
};

function AccountPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [business, setBusiness] = useState(initialBusiness);
  const [editProfile, setEditProfile] = useState(false);
  const [editBusiness, setEditBusiness] = useState(false);
  const creatorQ = useMyInfluencerProfile();


  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-center px-4 py-3">
          <h1 className="text-base font-bold text-foreground">حسابي</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 pt-5">
        {/* Profile card */}
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-bold text-foreground">المعلومات الشخصية</h2>
            <button
              type="button"
              onClick={() => setEditProfile((v) => !v)}
              className="flex items-center gap-1 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary hover:opacity-90"
            >
              {editProfile ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editProfile ? "إلغاء" : "تعديل"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="size-20 rounded-full border-2 border-primary-soft object-cover"
              />
              {editProfile && (
                <button
                  type="button"
                  className="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card"
                  aria-label="تغيير الصورة"
                >
                  <Camera className="size-4" />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-foreground">
                {profile.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{profile.company}</p>
            </div>
          </div>

          {editProfile ? (
            <div className="mt-4 space-y-3">
              <EditField
                label="الاسم الكامل"
                value={profile.fullName}
                onChange={(v) => setProfile({ ...profile, fullName: v })}
              />
              <EditField
                label="اسم الشركة"
                value={profile.company}
                onChange={(v) => setProfile({ ...profile, company: v })}
              />
              <EditField
                label="البريد الإلكتروني"
                type="email"
                value={profile.email}
                onChange={(v) => setProfile({ ...profile, email: v })}
              />
              <EditField
                label="رقم الهاتف"
                type="tel"
                value={profile.phone}
                onChange={(v) => setProfile({ ...profile, phone: v })}
              />
              <button
                type="button"
                onClick={() => {
                  setEditProfile(false);
                  toast.success("تم حفظ التعديلات");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-card hover:opacity-95"
              >
                <Check className="size-4" />
                حفظ التغييرات
              </button>
            </div>
          ) : (
            <dl className="mt-4 space-y-2.5 border-t border-dashed border-border pt-4">
              <InfoRow icon={Mail} label="البريد" value={profile.email} />
              <InfoRow icon={Phone} label="الهاتف" value={profile.phone} />
            </dl>
          )}
        </section>

        {/* Business card */}
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-bold text-foreground">معلومات الشركة</h2>
            <button
              type="button"
              onClick={() => setEditBusiness((v) => !v)}
              className="flex items-center gap-1 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary hover:opacity-90"
            >
              {editBusiness ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editBusiness ? "إلغاء" : "تعديل"}
            </button>
          </div>

          {editBusiness ? (
            <div className="mt-4 space-y-3">
              <EditField
                label="اسم الشركة"
                value={business.company}
                onChange={(v) => setBusiness({ ...business, company: v })}
              />
              <EditField
                label="القطاع"
                value={business.industry}
                onChange={(v) => setBusiness({ ...business, industry: v })}
              />
              <EditField
                label="الموقع الإلكتروني (اختياري)"
                type="url"
                value={business.website}
                onChange={(v) => setBusiness({ ...business, website: v })}
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  وصف الشركة
                </label>
                <textarea
                  rows={4}
                  value={business.description}
                  onChange={(e) =>
                    setBusiness({ ...business, description: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditBusiness(false);
                  toast.success("تم تحديث معلومات الشركة");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-card hover:opacity-95"
              >
                <Check className="size-4" />
                حفظ التغييرات
              </button>
            </div>
          ) : (
            <dl className="mt-4 space-y-2.5">
              <InfoRow icon={Building2} label="الشركة" value={business.company} />
              <InfoRow icon={Briefcase} label="القطاع" value={business.industry} />
              {business.website && (
                <InfoRow icon={Globe} label="الموقع" value={business.website} />
              )}
              <div className="border-t border-dashed border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                {business.description}
              </div>
            </dl>
          )}
        </section>

        {/* Settings */}
        <SectionCard title="إعدادات الحساب">
          <ActionRow icon={Lock} label="تغيير كلمة المرور" />
          <ActionRow icon={Bell} label="تفضيلات الإشعارات" hint="مفعّلة" />
          <ActionRow icon={Languages} label="اللغة" hint="العربية" />
          <ActionRow icon={ShieldCheck} label="الخصوصية والأمان" last />
        </SectionCard>

        {/* Payment */}
        <SectionCard title="معلومات الدفع">
          <div className="space-y-2">
            <PaymentCard brand="الذهبية" last4="4821" primary />
            <PaymentCard brand="Visa" last4="3390" />
          </div>
          <button
            type="button"
            onClick={() => toast("سيتم فتح إدارة وسائل الدفع")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 py-3 text-sm font-semibold text-primary hover:bg-primary-soft"
          >
            <Plus className="size-4" />
            إدارة وسائل الدفع
          </button>
        </SectionCard>

        {/* Help */}
        <SectionCard title="المساعدة والدعم">
          <ActionRow icon={HelpCircle} label="مركز المساعدة" />
          <ActionRow icon={MessageCircleQuestion} label="التواصل مع الدعم" />
          <ActionRow icon={FileText} label="الشروط والأحكام" />
          <ActionRow icon={ScrollText} label="سياسة الخصوصية" last />
        </SectionCard>

        {/* Logout */}
        <button
          type="button"
          onClick={() => toast.success("تم تسجيل الخروج بنجاح")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-4 text-sm font-bold text-destructive transition hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </button>

        <p className="pb-2 pt-1 text-center text-xs text-muted-foreground">
          الإصدار 1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function ActionRow({
  icon: Icon,
  label,
  hint,
  last,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => toast(label)}
      className={`flex w-full items-center gap-3 py-3 text-right ${
        last ? "" : "border-b border-border/70"
      }`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      <ChevronLeft className="size-4 text-muted-foreground" />
    </button>
  );
}

function PaymentCard({
  brand,
  last4,
  primary,
}: {
  brand: string;
  last4: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CreditCard className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          {brand} •••• {last4}
        </p>
        <p className="text-xs text-muted-foreground">تنتهي 12/28</p>
      </div>
      {primary && (
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
          افتراضية
        </span>
      )}
    </div>
  );
}
