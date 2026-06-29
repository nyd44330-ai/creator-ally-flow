import { BadgeCheck, Bookmark } from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube } from "react-icons/si";
import type { Influencer } from "@/lib/mock-influencers";

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <button
          aria-label="حفظ"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Bookmark className="size-5" />
        </button>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <h3 className="font-bold text-foreground">{influencer.name}</h3>
            {influencer.verified && (
              <BadgeCheck className="size-4 fill-primary text-primary-foreground" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {influencer.category}
          </p>

          <div className="mt-3 flex items-center justify-end gap-4 text-sm text-foreground">
            {influencer.youtube && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold">{influencer.youtube}</span>
                <SiYoutube className="size-4 text-[#FF0000]" />
              </span>
            )}
            {influencer.instagram && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold">{influencer.instagram}</span>
                <SiInstagram className="size-4 text-[#E1306C]" />
              </span>
            )}
            {influencer.tiktok && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold">{influencer.tiktok}</span>
                <SiTiktok className="size-4 text-foreground" />
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold text-foreground">
            {influencer.priceMin.toLocaleString("en-US")} -{" "}
            {influencer.priceMax.toLocaleString("en-US")} دج
          </p>
        </div>

        <img
          src={influencer.image}
          alt={influencer.name}
          width={56}
          height={56}
          loading="lazy"
          className="size-14 rounded-full object-cover ring-2 ring-primary-soft"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button className="rounded-xl border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft">
          عرض الملف
        </button>
        <div className="flex flex-wrap justify-end gap-1.5">
          {influencer.services.map((s) => (
            <span
              key={s}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
