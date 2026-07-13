import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Try to claim an influencer profile matching the signed-in user's email.
// Returns { claimed: true, influencerId } on success (already claimed or newly claimed),
// { claimed: false, reason } otherwise.
export const claimInfluencerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims.email as string | undefined)?.toLowerCase();

    // Already linked?
    const { data: mine } = await supabase
      .from("influencers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (mine) return { claimed: true as const, influencerId: mine.id };

    if (!email) return { claimed: false as const, reason: "no-email" };

    // Match by email (case-insensitive) and unclaimed
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: match } = await supabaseAdmin
      .from("influencers")
      .select("id, user_id, email")
      .ilike("email", email)
      .maybeSingle();

    if (!match) return { claimed: false as const, reason: "no-match" };
    if (match.user_id && match.user_id !== userId) {
      return { claimed: false as const, reason: "taken" };
    }

    const { error } = await supabaseAdmin
      .from("influencers")
      .update({ user_id: userId })
      .eq("id", match.id);
    if (error) return { claimed: false as const, reason: "error" };
    return { claimed: true as const, influencerId: match.id };
  });

// Fetch the signed-in user's influencer profile (for the creator dashboard).
export const getMyInfluencerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("influencers")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data;
  });

const updateSchema = z.object({
  price_min: z.number().int().nonnegative().optional(),
  price_max: z.number().int().nonnegative().optional(),
  services: z.array(z.string().min(1).max(60)).max(20).optional(),
  bio: z.string().max(1000).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  languages: z.array(z.string().min(1).max(40)).max(10).optional(),
  portfolio: z
    .array(
      z.object({
        id: z.string(),
        image: z.string().url().or(z.string().startsWith("/")),
        title: z.string().max(120),
        brand: z.string().max(80),
        platform: z.enum(["tiktok", "instagram", "youtube"]),
        views: z.string().max(20),
      }),
    )
    .max(50)
    .optional(),
});

export const updateMyInfluencerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("influencers")
      .update(data)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Campaigns the influencer was invited to
export const getMyInvitedCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: prof } = await context.supabase
      .from("influencers")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!prof) return [];
    const { data } = await context.supabase
      .from("campaign_influencers")
      .select("status, created_at, campaign:campaigns(*)")
      .eq("influencer_id", prof.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

const invitationAction = z.object({
  campaignId: z.string().uuid(),
  action: z.enum(["accepted", "rejected"]),
});

export const respondToCampaignInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => invitationAction.parse(data))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("influencers")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!prof) throw new Error("Not an influencer");
    const { error } = await context.supabase
      .from("campaign_influencers")
      .update({ status: data.action })
      .eq("campaign_id", data.campaignId)
      .eq("influencer_id", prof.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
