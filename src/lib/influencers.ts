import { supabase } from "@/integrations/supabase/client";

export type PortfolioItem = {
  id: string;
  image: string;
  title: string;
  brand: string;
  platform: "tiktok" | "instagram" | "youtube";
  views: string;
};

export type Influencer = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews?: number;
  verified: boolean;
  featured?: boolean;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  priceMin: number;
  priceMax: number;
  services: string[];
  bio?: string;
  location?: string;
  languages?: string[];
  portfolio?: PortfolioItem[];
};

type DbRow = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number | string;
  reviews: number | null;
  verified: boolean;
  featured: boolean;
  tiktok: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  price_min: number;
  price_max: number;
  services: unknown;
  bio: string | null;
  location: string | null;
  languages: unknown;
  portfolio: unknown;
};

function toArray<T>(v: unknown, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

export function mapInfluencer(r: DbRow): Influencer {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    image: r.image,
    rating: Number(r.rating),
    reviews: r.reviews ?? undefined,
    verified: r.verified,
    featured: r.featured,
    tiktok: r.tiktok ?? undefined,
    instagram: r.instagram ?? undefined,
    youtube: r.youtube ?? undefined,
    tiktokUrl: r.tiktok_url ?? undefined,
    instagramUrl: r.instagram_url ?? undefined,
    youtubeUrl: r.youtube_url ?? undefined,
    priceMin: r.price_min,
    priceMax: r.price_max,
    services: toArray<string>(r.services),
    bio: r.bio ?? undefined,
    location: r.location ?? undefined,
    languages: toArray<string>(r.languages),
    portfolio: toArray<PortfolioItem>(r.portfolio),
  };
}

export const PUBLIC_INFLUENCER_COLUMNS =
  "id,name,category,image,rating,reviews,verified,featured,tiktok,instagram,youtube,tiktok_url,instagram_url,youtube_url,price_min,price_max,services,bio,location,languages,portfolio,published";

export async function fetchInfluencers(): Promise<Influencer[]> {
  const { data, error } = await supabase
    .from("influencers")
    .select(PUBLIC_INFLUENCER_COLUMNS)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data as unknown as DbRow[]).map(mapInfluencer);
}

export async function fetchInfluencerById(id: string): Promise<Influencer | null> {
  const { data, error } = await supabase
    .from("influencers")
    .select(PUBLIC_INFLUENCER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapInfluencer(data as unknown as DbRow) : null;
}
