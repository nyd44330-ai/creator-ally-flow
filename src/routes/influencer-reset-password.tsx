import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/influencer-reset-password")({
  head: () => ({
    meta: [
      { title: "استعادة كلمة السر — بوابة المؤثرين" },
      { name: "description", content: "اضبط كلمة سر جديدة لحسابك في بوابة المؤثرين." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "استعادة كلمة السر — بوابة المؤثرين" },
      { property: "og:description", content: "اضبط كلمة سر جديدة لحسابك في بوابة المؤثرين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      toast.error("تعذّر تحديث كلمة السر، افتح الرابط من بريدك مجدداً");
      return;
    }
    toast.success("تم تحديث كلمة السر");
    navigate({ to: "/portal", replace: true });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-secondary">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
          <h1 className="text-lg font-bold text-foreground">كلمة سر جديدة</h1>
          <p className="mt-1 text-xs text-muted-foreground">اختر كلمة سر جديدة لحسابك.</p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3">
              <Lock className="size-4 text-muted-foreground" />
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground shadow-card transition hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              حفظ كلمة السر
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
