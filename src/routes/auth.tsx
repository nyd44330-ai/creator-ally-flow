import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

const search = z.object({
  next: z.string().optional().default("/"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — منصة المؤثرين" },
      { name: "description", content: "سجّل الدخول لإنشاء حملاتك والتواصل مع المؤثرين." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: next as never, replace: true });
    });
  }, [navigate, next]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const safeNext = typeof next === "string" && next.startsWith("/") ? next : "/";
      sessionStorage.setItem("auth:next", safeNext);
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth/callback",
      });
      if (res.error) {
        toast.error("تعذّر تسجيل الدخول");
        setLoading(false);
        return;
      }
      if (res.redirected) return;
      navigate({ to: safeNext as never, replace: true });
    } catch {
      toast.error("حدث خطأ غير متوقع");
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-md items-center gap-3 px-4 pt-4">
        <Link to="/" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="رجوع">
          <ArrowRight className="size-5" />
        </Link>
      </header>
      <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-card">
          <Sparkles className="size-8" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">مرحباً بك</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          سجّل الدخول بحسابك في Google لإنشاء الحملات وإرسال العروض للمؤثرين ومتابعة رسائلك.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground shadow-soft transition hover:bg-muted disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.98 6.98 0 0 1 5.47 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
          )}
          <span>{loading ? "جارٍ التحويل..." : "المتابعة بحساب Google"}</span>
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          هل أنت مؤثر مسجَّل لدينا؟ سجّل الدخول بنفس بريد Google الذي زوّدتنا به وستجد <Link to="/creator" className="font-semibold text-primary">لوحة المؤثر</Link> جاهزة.
        </p>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          بمتابعتك فإنك توافق على شروط الاستخدام وسياسة الخصوصية.
        </p>

      </main>
    </div>
  );
}
