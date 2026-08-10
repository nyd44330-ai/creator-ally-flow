import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type SelfInfluencer = {
  id: string;
  name: string;
  category: string;
  image: string;
  bio: string | null;
  location: string | null;
  rating: number;
  reviews: number;
  verified: boolean;
  tiktok: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  price_min: number;
  price_max: number;
  services: unknown;
  email: string | null;
};

export function useInfluencerSelf() {
  const { user, loading } = useAuth();

  const query = useQuery({
    queryKey: ["portal", "self", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SelfInfluencer | null> => {
      await supabase.rpc("link_influencer_account");
      const { data, error } = await supabase
        .from("influencers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as SelfInfluencer | null) ?? null;
    },
  });

  return {
    influencer: query.data ?? null,
    loading: loading || query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export const inviteStatusLabels: Record<string, string> = {
  invited: "دعوة جديدة",
  accepted: "مقبولة",
  declined: "مرفوضة",
};

export function formatDzd(value: number): string {
  return new Intl.NumberFormat("ar-DZ", { maximumFractionDigits: 0 }).format(value) + " دج";
}
