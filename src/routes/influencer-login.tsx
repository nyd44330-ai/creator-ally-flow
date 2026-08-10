import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, ShieldCheck, Wallet, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/influencer-login")({
  head: () => ({
    meta: [
      { title: "بوابة المؤثرين — تسجيل الدخول" },
      {
        name: "description",
        content: "سجّل الدخول إلى بوابة المؤثرين لإدارة عروضك وأرباحك ورسائلك مع المعلنين.",
      },
      { property: "og:title", content: "بوابة المؤثرين — تسجيل الدخول" },
      {
        property: "og:description",
        content: "سجّل الدخول إلى بوابة المؤثرين لإدارة عروضك وأرباحك ورسائلك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InfluencerLogin,
});

const perks = [
  { icon: Sparkles, text: "استقبل عروض التعاون من العلامات التجارية" },
  { icon: Wallet, text: "تابع أرباحك من كل حملة" },
  { icon: MessageSquare, text: "تواصل مباشرة مع المعلنين" },
];

function InfluencerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal", replace: true });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem("auth:next", "/portal");
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth/callback",
      });
      if (res.error) {
        toast.error("تعذّر تسجيل الدخول");
        setLoading(false);
        return;
      }
      if (res.redirected) return;
      navigate({ to: "/portal", replace: true });
    } catch {
      toast.error("حدث خطأ غير متوقع");
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-accent-soft via-background to-background px-4 py-10"
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-card">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">بوابة المؤثرين</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            مساحتك الخاصة لإدارة تعاوناتك مع المعلنين
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
          <ul className="mb-5 space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.96h5.27c-.23 1.38-1.6 4.05-5.27 4.05-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.02.77 3.71 1.44l2.53-2.44C16.79 3.86 14.7 3 12.18 3 7.03 3 2.86 7.14 2.86 12.25s4.17 9.25 9.32 9.25c5.38 0 8.94-3.78 8.94-9.1 0-.61-.07-1.08-.17-1.3Z"
                />
              </svg>
            )}
            تسجيل الدخول بـ Google
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            دخول آمن — نستخدم بريدك فقط لربطك بملفك.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          هذه البوابة مخصّصة للمؤثرين. إن كنت معلناً استخدم صفحة الدخول الخاصة بالمعلنين.
        </p>
      </div>
    </div>
  );
}
