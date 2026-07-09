import marwan from "@/assets/influencer-marwan.jpg";
import dunia from "@/assets/influencer-dunia.jpg";
import karim from "@/assets/influencer-karim.jpg";
import asmaa from "@/assets/influencer-asmaa.jpg";
import yassin from "@/assets/influencer-yassin.jpg";
import lina from "@/assets/influencer-lina.jpg";

const map: Record<string, string> = {
  marwan,
  dunia,
  karim,
  asmaa,
  yassin,
  lina,
};

export function influencerImage(key: string | null | undefined, fallback = marwan): string {
  if (!key) return fallback;
  return map[key] ?? fallback;
}
