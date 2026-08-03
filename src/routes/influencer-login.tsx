import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/influencer-login")({
  head: () => ({
    meta: [
      { title: "بوابة المؤثرين — تسجيل الدخول" },
      { name: "description", content: "ادخل إلى بوابة المؤثرين لمتابعة عروض التعاون وأرباحك ورسائلك." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "بوابة المؤثرين — تسجيل الدخول" },
      { property: "og:description", content: "ادخل إلى بوابة المؤثرين لمتابعة عروض التعاون وأرباحك ورسائلك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InfluencerLoginPage,
});

const schema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة السر يجب أن تكون 6 أحرف على الأقل"),
});

function InfluencerLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("بيانات الدخول غير صحيحة");
          return;
        }
        navigate({ to: "/portal", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/influencer-login" },
        });
        if (error) {
          toast.error(error.message.includes("registered") ? "هذا البريد مسجّل مسبقاً" : "تعذّر إنشاء الحساب");
          return;
        }
        if (data.session) {
          navigate({ to: "/portal", replace: true });
        } else {
          setSentConfirm(true);
          toast.success("تم إرسال رابط التفعيل إلى بريدك");
        }
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      setErrors({ email: "أدخل بريدك أولاً لإعادة التعيين" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/influencer-reset-password",
    });
    if (error) toast.error("تعذّر إرسال رابط الاستعادة");
    else toast.success("أرسلنا لك رابط استعادة كلمة السر");
  };

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-secondary">
      <div className="pointer-events-none absolute -top-32 -start-24 size-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-16 size-64 rounded-full bg-primary/20 blur-3xl" />

      <header className="relative mx-auto flex max-w-md items-center px-4 pt-4">
        <Link to="/" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="رجوع">
          <ArrowRight className="size-5" />
        </Link>
      </header>

      <main className="relative mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-5 pb-10">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-card">
            <Sparkles className="size-8" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">بوابة المؤثرين</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            تابع عروض التعاون، أرباحك، ورسائلك مع المعلنين في مكان واحد.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErrors({});
                  setSentConfirm(false);
                }}
                className={
                  "rounded-xl px-3 py-2 text-sm font-bold transition " +
                  (mode === m ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground")
                }
              >
                {m === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          {sentConfirm ? (
            <div className="py-6 text-center">
              <Mail className="mx-auto mb-3 size-8 text-accent" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                أرسلنا رابط تفعيل إلى <span className="font-bold text-foreground">{email}</span>. افتح
                الرابط ثم عد لتسجيل الدخول.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {errors.email && <p className="mt-1 text-[11px] text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground" htmlFor="password">
                  كلمة السر
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3">
                  <Lock className="size-4 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground shadow-card transition hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "دخول إلى البوابة" : "إنشاء حساب مؤثر"}
              </button>

              {mode === "signin" && (
                <button
                  type="button"
                  onClick={forgot}
                  className="text-center text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  نسيت كلمة السر؟
                </button>
              )}
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          هذه البوابة مخصصة للمؤثرين فقط. إن كنت معلناً،{" "}
          <Link to="/auth" search={{ next: "/" }} className="font-bold text-primary">
            سجّل من هنا
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
