import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    const dest = () => {
      const n = sessionStorage.getItem("auth:next");
      sessionStorage.removeItem("auth:next");
      return n && n.startsWith("/") ? n : "/";
    };
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && mounted) {
        navigate({ to: dest() as never, replace: true });
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s && mounted) navigate({ to: dest() as never, replace: true });
    });
    const timer = setTimeout(() => {
      if (mounted) navigate({ to: "/auth", replace: true });
    }, 5000);
    return () => {
      mounted = false;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">جارٍ إتمام تسجيل الدخول...</p>
    </div>
  );
}
