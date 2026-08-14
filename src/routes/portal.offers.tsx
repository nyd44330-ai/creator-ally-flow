import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Inbox, Check, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInfluencerSelf, formatDzd, inviteStatusLabels } from "@/lib/portal";

export const Route = createFileRoute("/portal/offers")({
  component: OffersPage,
});

type OfferRow = {
  campaign_id: string;
  status: string;
  created_at: string;
  campaign: {
    name: string;
    goal: string | null;
    budget: number;
    platforms: string[] | null;
    deliverables: string | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
};

function OffersPage() {
  const { influencer, loading } = useInfluencerSelf();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const offers = useQuery({
    queryKey: ["portal", "offers-all", influencer?.id],
    enabled: !!influencer,
    queryFn: async (): Promise<OfferRow[]> => {
      const { data, error } = await supabase
        .from("campaign_influencers")
        .select(
          "campaign_id,status,created_at,campaign:campaigns(name,goal,budget,platforms,deliverables,start_date,end_date)",
        )
        .eq("influencer_id", influencer!.id)
        .neq("status", "pending_payment")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as OfferRow[]) ?? [];
    },
  });

  const respond = async (campaignId: string, status: "accepted" | "declined") => {
    if (!influencer) return;
    setBusy(campaignId);
    const { error } = await supabase
      .from("campaign_influencers")
      .update({ status })
      .eq("campaign_id", campaignId)
      .eq("influencer_id", influencer.id);

    if (error) {
      setBusy(null);
      toast.error("تعذّر تحديث العرض");
      return;
    }

    if (status === "accepted") {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id,name,advertiser_id")
        .eq("id", campaignId)
        .maybeSingle();

      if (campaign) {
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .eq("campaign_id", campaignId)
          .eq("influencer_id", influencer.id)
          .maybeSingle();

        if (!existing) {
          const { data: conv } = await supabase
            .from("conversations")
            .insert({
              advertiser_id: campaign.advertiser_id,
              influencer_id: influencer.id,
              campaign_id: campaign.id,
              last_message: `قبل المؤثر العرض على حملة: ${campaign.name}`,
              last_message_at: new Date().toISOString(),
            })
            .select("id")
            .maybeSingle();

          if (conv) {
            await supabase.from("messages").insert({
              conversation_id: conv.id,
              sender: "influencer",
              body: `مرحباً، قبلت العرض الخاص بحملة "${campaign.name}" ويمكننا البدء.`,
            });
          }
        }
      }
    }
    setBusy(null);
    toast.success(status === "accepted" ? "تم قبول العرض" : "تم رفض العرض");
    queryClient.invalidateQueries({ queryKey: ["portal"] });
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-center text-lg font-bold text-foreground">العروض</h1>

      {loading || offers.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : !influencer ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          لم نعثر على ملفك في المنصة.
        </p>
      ) : (offers.data?.length ?? 0) === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد عروض واردة بعد.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {offers.data!.map((o) => (
            <li
              key={o.campaign_id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{o.campaign?.name}</p>
                  {o.campaign?.goal && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{o.campaign.goal}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                  {inviteStatusLabels[o.status] ?? o.status}
                </span>
              </div>

              {(o.campaign?.start_date || o.campaign?.end_date) && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {o.campaign?.start_date} — {o.campaign?.end_date}
                </p>
              )}

              {o.campaign?.deliverables && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {o.campaign.deliverables}
                </p>
              )}

              <p className="mt-3 text-sm font-bold text-foreground">
                {formatDzd(o.campaign?.budget ?? 0)}
              </p>

              {o.status === "invited" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy === o.campaign_id}
                    onClick={() => respond(o.campaign_id, "accepted")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
                  >
                    {busy === o.campaign_id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    قبول
                  </button>
                  <button
                    type="button"
                    disabled={busy === o.campaign_id}
                    onClick={() => respond(o.campaign_id, "declined")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-60"
                  >
                    <X className="size-4" />
                    رفض
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
