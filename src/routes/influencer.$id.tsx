import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  MapPin,
  MessageCircle,
  Languages,
  Star,
  Play,
} from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube } from "react-icons/si";
import { getInfluencerById, type Influencer, type PortfolioItem } from "@/lib/mock-influencers";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/influencer/$id")({
  loader: ({ params }) => {
    const influencer = getInfluencerById(params.id);
    if (!influencer) throw notFound();
    return { influencer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.influencer.name} — الملف الشخصي` },
          {
            name: "description",
            content: loaderData.influencer.bio?.slice(0, 150) ?? "",
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div>
        <h1 className="text-xl font-bold text-foreground">المؤثر غير موجود</h1>
        <Link to="/" className="mt-3 inline-block text-primary">
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6">
      <button onClick={reset} className="text-primary">حدث خطأ، أعد المحاولة</button>
    </div>
  ),
  component: ProfilePage,
});

const platformIcon = {
  tiktok: <SiTiktok className="size-3.5" />,
  instagram: <SiInstagram className="size-3.5 text-[#E1306C]" />,
  youtube: <SiYoutube className="size-3.5 text-[#FF0000]" />,
} as const;

function ProfilePage() {
  const { influencer: inf } = Route.useLoaderData() as { influencer: Influencer };
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const startCampaign = () => {
    const next = `/campaign/new?influencer=${inf.id}`;
    if (!isAuthed) navigate({ to: "/auth", search: { next } });
    else navigate({ to: "/campaign/new", search: { influencer: inf.id } });
  };

  const socials = [
    inf.tiktokUrl && {
      label: "TikTok",
      url: inf.tiktokUrl,
      count: inf.tiktok,
      icon: <SiTiktok className="size-5" />,
      ring: "bg-foreground/5 text-foreground",
    },
    inf.instagramUrl && {
      label: "Instagram",
      url: inf.instagramUrl,
      count: inf.instagram,
      icon: <SiInstagram className="size-5 text-[#E1306C]" />,
      ring: "bg-[#E1306C]/10 text-[#E1306C]",
    },
    inf.youtubeUrl && {
      label: "YouTube",
      url: inf.youtubeUrl,
      count: inf.youtube,
      icon: <SiYoutube className="size-5 text-[#FF0000]" />,
      ring: "bg-[#FF0000]/10 text-[#FF0000]",
    },
  ].filter(Boolean) as Array<{ label: string; url: string; count?: string; icon: React.ReactNode; ring: string }>;

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={inf.image}
            alt=""
            aria-hidden
            className="size-full object-cover blur-xl scale-110 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/40 to-background" />
        </div>

        <header className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-md items-center justify-between px-4 pt-4">
          <Link
            to="/"
            aria-label="رجوع"
            className="rounded-full bg-surface/90 p-2.5 shadow-[var(--shadow-soft)] backdrop-blur"
          >
            <ArrowRight className="size-5 text-foreground" />
          </Link>
          <button
            aria-label="حفظ"
            className="rounded-full bg-surface/90 p-2.5 shadow-[var(--shadow-soft)] backdrop-blur"
          >
            <Bookmark className="size-5 text-foreground" />
          </button>
        </header>

        {/* Avatar overlapping hero */}
        <div className="mx-auto -mt-16 flex max-w-md flex-col items-center px-4">
          <img
            src={inf.image}
            alt={inf.name}
            className="size-28 rounded-full object-cover ring-4 ring-surface shadow-[var(--shadow-card)]"
          />
          <div className="mt-3 flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-foreground">{inf.name}</h1>
            {inf.verified && (
              <BadgeCheck className="size-5 fill-primary text-primary-foreground" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{inf.category}</p>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {inf.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {inf.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-foreground">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{inf.rating}</span>
              {inf.reviews && <span className="text-muted-foreground">({inf.reviews})</span>}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4">
        {/* CTA buttons */}
        <div className="mt-5 flex items-center gap-2">
          <button className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity hover:opacity-90">
            أنشئ حملة مع {inf.name.split(" ")[0]}
          </button>
          <button
            aria-label="مراسلة"
            className="rounded-2xl border border-border bg-surface p-3 text-foreground"
          >
            <MessageCircle className="size-5" />
          </button>
        </div>

        {/* Price */}
        <section className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-soft)] text-right">
          <p className="text-xs text-muted-foreground">نطاق الأسعار</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {inf.priceMin.toLocaleString("en-US")} - {inf.priceMax.toLocaleString("en-US")} دج
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            يختلف السعر حسب نوع المحتوى ومدته
          </p>
        </section>

        {/* Bio */}
        {inf.bio && (
          <section className="mt-4 text-right">
            <h2 className="text-base font-bold text-foreground">نبذة</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{inf.bio}</p>
          </section>
        )}

        {/* Languages */}
        {inf.languages && inf.languages.length > 0 && (
          <section className="mt-4 text-right">
            <h2 className="flex items-center justify-end gap-1.5 text-base font-bold text-foreground">
              اللغات
              <Languages className="size-4 text-muted-foreground" />
            </h2>
            <div className="mt-2 flex flex-wrap justify-end gap-1.5">
              {inf.languages.map((l) => (
                <span
                  key={l}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="mt-4 text-right">
          <h2 className="text-base font-bold text-foreground">الخدمات</h2>
          <div className="mt-2 flex flex-wrap justify-end gap-1.5">
            {inf.services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Social links */}
        {socials.length > 0 && (
          <section className="mt-5 text-right">
            <h2 className="text-base font-bold text-foreground">المنصات</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
                >
                  <span className={`flex size-10 items-center justify-center rounded-full ${s.ring}`}>
                    {s.icon}
                  </span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        {inf.portfolio && inf.portfolio.length > 0 && (
          <section className="mt-6 text-right">
            <div className="flex items-center justify-between">
              <button className="text-sm font-semibold text-primary">عرض الكل</button>
              <h2 className="text-base font-bold text-foreground">قائمة الأعمال</h2>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {inf.portfolio.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <div className="relative aspect-square">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
          {platformIcon[item.platform]}
          {item.views}
        </span>
        <span className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground">
          <Play className="size-3.5 fill-current" />
        </span>
      </div>
      <div className="p-2.5 text-right">
        <p className="line-clamp-1 text-xs font-semibold text-foreground">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{item.brand}</p>
      </div>
    </article>
  );
}
