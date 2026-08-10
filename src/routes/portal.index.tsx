import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Inbox, Wallet, Star, ChevronLeft, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, displayName, avatarUrl } from "@/lib/auth";
import { useInfluencerSelf, formatDzd, inviteStatusLabels } from "@/lib/portal";

export const Route = createFileRoute("/portal/")({
  component: PortalHome,
});

type OfferRow = {
  campaign_id: string;
  status: string;
  created_at: string;
  campaign: { name: string; goal: string | null; budget: number } | null;
};

function PortalHome() {
  const { user } = useAuth();
  const { influencer, loading } = useInfluencerSelf();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const offers = useQuery({
    queryKey: ["portal", "offers", influencer?.id],
    enabled: !!influencer,
    queryFn: async (): Promise<OfferRow[]> => {
      const { data, error } = await supabase
        .from("campaign_influencers")
        .select("campaign_id,status,created_at,campaign:campaigns(name,goal,budget)")
        .eq("influencer_id", influencer!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data as unknown as OfferRow[]) ?? [];
    },
  });

  const earnings = useQuery({
    queryKey: ["portal", "earnings-sum", influencer?.id],
    enabled: !!influencer,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_influencer_earnings");
      if (error) throw error;
      return (data ?? []) as { share: number; invite_status: string }[];
    },
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/influencer-login", replace: true });
  };

  const totalEarnings = (earnings.data ?? [])
    .filter((r) => r.invite_status === "accepted")
    .reduce((s, r) => s + Number(r.share), 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <header className="flex items-center gap-3">
        {influencer?.image || avatarUrl(user) ? (
          <img
            src={influencer?.image || avatarUrl(user)}
            alt={influencer?.name || displayName(user)}
            className="size-12 rounded-2xl object-cover"
          />
        ) : (
          <div className="size-12 rounded-2xl bg-accent-soft" />
        )}
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">أهلاً بك</p>
          <h1 className="text-lg font-bold text-foreground">
            {influencer?.name || displayName(user)}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      {!influencer && (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
          لم نعثر على ملفك في المنصة. تأكد من الدخول بالبريد نفسه المسجّل لدينا أو تواصل مع الدعم.
        </div>
      )}

      {influencer && (
        <>
          <section className="mt-5 grid grid-cols-3 gap-3">
            <StatCard
              icon={<Inbox className="size-4" />}
              label="العروض"
              value={String(offers.data?.length ?? 0)}
            />
            <StatCard
              icon={<Wallet className="size-4" />}
              label="الأرباح"
              value={formatDzd(totalEarnings)}
            />
            <StatCard
              icon={<Star className="size-4" />}
              label="التقييم"
              value={String(influencer.rating ?? 0)}
            />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">آخر العروض</h2>
              <Link to="/portal/offers" className="flex items-center text-xs text-accent">
                عرض الكل
                <ChevronLeft className="size-4" />
              </Link>
            </div>

            {offers.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-accent" />
              </div>
            ) : (offers.data?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                لا توجد عروض بعد.
              </div>
            ) : (
              <ul className="space-y-3">
                {offers.data!.map((o) => (
                  <li
                    key={o.campaign_id}
                    className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{o.campaign?.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{o.campaign?.goal}</p>
                      </div>
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                        {inviteStatusLabels[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground">
                      {formatDzd(o.campaign?.budget ?? 0)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center shadow-soft">
      <span className="mx-auto mb-1.5 flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <p className="truncate text-sm font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
