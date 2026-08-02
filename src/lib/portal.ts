import { supabase } from "@/integrations/supabase/client";

export type PortalInfluencer = {
  id: string;
  name: string;
  category: string;
  image: string;
  bio: string | null;
  location: string | null;
  rating: number;
  reviews: number;
  verified: boolean;
  price_min: number;
  price_max: number;
  services: string[];
  tiktok: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

export type PortalOffer = {
  campaign_id: string;
  influencer_id: string;
  status: string;
  created_at: string;
  campaign: {
    id: string;
    name: string;
    goal: string | null;
    budget: number;
    platforms: string[];
    content_type: string | null;
    deliverables: string | null;
    notes: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
  } | null;
};

export type PortalEarning = {
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  invite_status: string;
  participants: number;
  share: number;
  paid: boolean;
  created_at: string;
};

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") {
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    } catch {
      return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
    }
  }
  return [];
}

/** Links the signed-in account to its influencer record (by email) and returns it. */
export async function fetchMyInfluencer(): Promise<PortalInfluencer | null> {
  await supabase.rpc("claim_influencer_profile");
  const { data, error } = await supabase
    .from("influencers")
    .select(
      "id,name,category,image,bio,location,rating,reviews,verified,price_min,price_max,services,tiktok,instagram,youtube,tiktok_url,instagram_url,youtube_url",
    )
    .not("user_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    ...(row as unknown as PortalInfluencer),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    services: toStringArray(row.services),
  };
}

export async function fetchMyOffers(influencerId: string): Promise<PortalOffer[]> {
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select(
      "campaign_id,influencer_id,status,created_at,campaign:campaigns(id,name,goal,budget,platforms,content_type,deliverables,notes,start_date,end_date,status)",
    )
    .eq("influencer_id", influencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as PortalOffer[] | null) ?? [];
}

export async function respondToOffer(
  campaignId: string,
  influencerId: string,
  status: "accepted" | "declined",
) {
  const { error } = await supabase
    .from("campaign_influencers")
    .update({ status })
    .eq("campaign_id", campaignId)
    .eq("influencer_id", influencerId);
  if (error) throw error;
}

export async function fetchMyEarnings(): Promise<PortalEarning[]> {
  const { data, error } = await supabase.rpc("influencer_earnings");
  if (error) throw error;
  return (data as unknown as PortalEarning[] | null) ?? [];
}

export type PortalConversation = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  campaign: { name: string } | null;
};

export async function fetchMyConversations(influencerId: string): Promise<PortalConversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,last_message,last_message_at,campaign:campaigns(name)")
    .eq("influencer_id", influencerId)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as PortalConversation[] | null) ?? [];
}

export type PortalMessage = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

export async function fetchMessages(conversationId: string): Promise<PortalMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender,body,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as PortalMessage[] | null) ?? [];
}

export async function sendMessage(conversationId: string, body: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender: "influencer", body });
  if (error) throw error;
}

export function formatDzd(n: number): string {
  return new Intl.NumberFormat("ar-DZ").format(Math.round(n)) + " د.ج";
}
