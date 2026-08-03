import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PortalNav } from "./PortalNav";
import { fetchMyInfluencer, type PortalInfluencer } from "@/lib/portal";
import { supabase } from "@/integrations/supabase/client";

export function useMyInfluencer() {
  return useQuery({
    queryKey: ["portal", "me"],
    queryFn: fetchMyInfluencer,
    staleTime: 60_000,
  });
}

export function usePortalSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/influencer-login", replace: true });
  };
}

export function PortalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: (influencer: PortalInfluencer) => ReactNode;
}) {
  const { data, isLoading, error } = useMyInfluencer();
  const signOut = usePortalSignOut();

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      <header className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-6 pb-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl border border-border bg-surface p-2 text-muted-foreground transition hover:bg-muted"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      <main className="mx-auto max-w-md px-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-accent" />
          </div>
        ) : error ? (
          <ErrorBox message="تعذّر تحميل البيانات، حاول التحديث." />
        ) : !data ? (
          <ErrorBox message="لم نعثر على ملف مؤثر مرتبط ببريدك الإلكتروني. تواصل مع الدعم لإضافة حسابك." />
        ) : (
          children(data)
        )}
      </main>

      <PortalNav />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
      <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground" />
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
