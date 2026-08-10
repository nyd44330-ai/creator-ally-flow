import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInfluencerSelf, formatDzd, inviteStatusLabels } from "@/lib/portal";

export const Route = createFileRoute("/portal/earnings")({
  component: EarningsPage,
});

type EarningRow = {
  campaign_id: string;
  campaign_name: string;
  status: string;
  invite_status: string;
  budget: number;
  influencer_count: number;
  share: number;
  start_date: string | null;
  end_date: string | null;
};

const campaignStatusLabels: Record<string, string> = {
  draft: "مسودة",
  pending: "بانتظار الدفع",
  active: "نشطة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

function EarningsPage() {
  const { influencer, loading } = useInfluencerSelf();

  const rows = useQuery({
    queryKey: ["portal", "earnings", influencer?.id],
    enabled: !!influencer,
    queryFn: async (): Promise<EarningRow[]> => {
      const { data, error } = await supabase.rpc("my_influencer_earnings");
      if (error) throw error;
      return ((data ?? []) as unknown as EarningRow[]).map((r) => ({
        ...r,
        share: Number(r.share),
      }));
    },
  });

  const accepted = (rows.data ?? []).filter((r) => r.invite_status === "accepted");
  const paid = accepted.filter((r) => r.status === "completed");
  const pending = accepted.filter((r) => r.status !== "completed");
  const sum = (list: EarningRow[]) => list.reduce((s, r) => s + r.share, 0);

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-center text-lg font-bold text-foreground">الأرباح</h1>

      {loading || rows.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : !influencer ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">لم نعثر على ملفك في المنصة.</p>
      ) : (
        <>
          <div className="mt-5 rounded-3xl border border-border bg-accent-soft p-5 text-center shadow-soft">
            <p className="text-xs text-accent">إجمالي الأرباح</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatDzd(sum(accepted))}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-surface p-3">
                <p className="text-sm font-bold text-success">{formatDzd(sum(paid))}</p>
                <p className="text-[11px] text-muted-foreground">مكتملة</p>
              </div>
              <div className="rounded-2xl bg-surface p-3">
                <p className="text-sm font-bold text-foreground">{formatDzd(sum(pending))}</p>
                <p className="text-[11px] text-muted-foreground">قيد التنفيذ</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            يُحتسب نصيبك من كل حملة = ميزانية الحملة ÷ عدد المؤثرين المشاركين فيها.
          </p>

          <h2 className="mt-6 mb-3 text-sm font-bold text-foreground">تفاصيل الحملات</h2>

          {accepted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
              <Wallet className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">لا توجد أرباح بعد. اقبل عرضاً لتبدأ.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {accepted.map((r) => (
                <li
                  key={r.campaign_id}
                  className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{r.campaign_name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDzd(r.budget)} ÷ {r.influencer_count} مؤثر
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {campaignStatusLabels[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-accent">{formatDzd(r.share)}</p>
                </li>
              ))}
            </ul>
          )}

          {(rows.data ?? []).some((r) => r.invite_status !== "accepted") && (
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              العروض غير المقبولة ({
                (rows.data ?? []).filter((r) => r.invite_status !== "accepted").length
              }) لا تُحتسب ضمن الأرباح — {inviteStatusLabels.invited}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
