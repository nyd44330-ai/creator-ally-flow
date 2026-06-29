import { BadgeCheck, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Influencer } from "@/lib/mock-influencers";

export function FeaturedInfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <Link
      to="/influencer/$id"
      params={{ id: influencer.id }}
      className="relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-card)]"
    >
      <img
        src={influencer.image}
        alt={influencer.name}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-2 bottom-2 rounded-xl bg-black/40 px-2 py-1.5 text-right text-white backdrop-blur-sm">
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs font-bold">{influencer.name}</span>
          {influencer.verified && (
            <BadgeCheck className="size-3 fill-primary text-white" />
          )}
        </div>
        <p className="text-[10px] text-white/80">{influencer.category}</p>
        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span className="text-[11px] font-semibold">{influencer.rating}</span>
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    </Link>
  );
}
