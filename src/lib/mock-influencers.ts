import marwan from "@/assets/influencer-marwan.jpg";
import dunia from "@/assets/influencer-dunia.jpg";
import karim from "@/assets/influencer-karim.jpg";
import asmaa from "@/assets/influencer-asmaa.jpg";
import yassin from "@/assets/influencer-yassin.jpg";
import lina from "@/assets/influencer-lina.jpg";

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

const defaultPortfolio = (img: string): PortfolioItem[] => [
  {
    id: "p1",
    image: img,
    title: "حملة ترويجية لمنتج جديد",
    brand: "Nedjma",
    platform: "instagram",
    views: "320K",
  },
  {
    id: "p2",
    image: img,
    title: "مراجعة شاملة وتجربة استخدام",
    brand: "Condor",
    platform: "youtube",
    views: "180K",
  },
  {
    id: "p3",
    image: img,
    title: "تحدي قصير بأسلوب ترفيهي",
    brand: "Hamoud Boualem",
    platform: "tiktok",
    views: "1.2M",
  },
  {
    id: "p4",
    image: img,
    title: "ستوريز ترويجية متتالية",
    brand: "Djezzy",
    platform: "instagram",
    views: "95K",
  },
];

export const featuredInfluencers: Influencer[] = [
  {
    id: "marwan",
    name: "مروان سفر",
    category: "سفر وسياحة",
    image: marwan,
    rating: 4.9,
    reviews: 142,
    verified: true,
    tiktok: "1.4M",
    instagram: "880K",
    youtube: "620K",
    tiktokUrl: "https://tiktok.com/@marwan",
    instagramUrl: "https://instagram.com/marwan",
    youtubeUrl: "https://youtube.com/@marwan",
    priceMin: 12000,
    priceMax: 28000,
    services: ["فيديو ريلز", "ستوري", "فلوغ"],
    bio: "صانع محتوى متخصص في السفر والمغامرات حول العالم. أوثّق رحلاتي بأسلوب سينمائي وأقدّم نصائح للمسافرين العرب. تعاونت مع أكثر من 30 علامة سياحية.",
    location: "الجزائر العاصمة",
    languages: ["العربية", "الفرنسية", "الإنجليزية"],
    portfolio: defaultPortfolio(marwan),
  },
  {
    id: "dunia",
    name: "دنيا لايف",
    category: "موضة وجمال",
    image: dunia,
    rating: 4.8,
    reviews: 210,
    verified: true,
    tiktok: "2.0M",
    instagram: "1.3M",
    youtube: "540K",
    tiktokUrl: "https://tiktok.com/@dunia",
    instagramUrl: "https://instagram.com/dunia",
    youtubeUrl: "https://youtube.com/@dunia",
    priceMin: 14000,
    priceMax: 30000,
    services: ["فيديو ريلز", "مراجعة منتج", "ستوري"],
    bio: "مدوّنة موضة وجمال، أشارك يومياتي ونصائح العناية بالبشرة والميك آب. شغوفة بإبراز جمال المرأة العربية بأسلوب عصري.",
    location: "وهران",
    languages: ["العربية", "الفرنسية"],
    portfolio: defaultPortfolio(dunia),
  },
  {
    id: "karim",
    name: "كريم تك",
    category: "تقنية",
    image: karim,
    rating: 4.9,
    reviews: 178,
    verified: true,
    tiktok: "900K",
    instagram: "650K",
    youtube: "1.1M",
    tiktokUrl: "https://tiktok.com/@karimtech",
    instagramUrl: "https://instagram.com/karimtech",
    youtubeUrl: "https://youtube.com/@karimtech",
    priceMin: 15000,
    priceMax: 35000,
    services: ["مراجعة منتج", "فيديو ريلز", "أنبوكسينغ"],
    bio: "مهتم بكل ما هو جديد في عالم التكنولوجيا. أراجع الهواتف والإكسسوارات وأقدّم محتوى مبسّط للمستهلك العربي.",
    location: "قسنطينة",
    languages: ["العربية", "الإنجليزية"],
    portfolio: defaultPortfolio(karim),
  },
];

export const allInfluencers: Influencer[] = [
  {
    id: "asmaa",
    name: "أسماء بن عيسى",
    category: "جمال وعناية بالبشرة",
    image: asmaa,
    rating: 4.9,
    reviews: 256,
    verified: true,
    tiktok: "1.8M",
    instagram: "920K",
    youtube: "1.2M",
    tiktokUrl: "https://tiktok.com/@asmaa",
    instagramUrl: "https://instagram.com/asmaa",
    youtubeUrl: "https://youtube.com/@asmaa",
    priceMin: 10000,
    priceMax: 25000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
    bio: "خبيرة جمال وعناية بالبشرة. أقدّم محتوى موثوق حول مستحضرات التجميل وروتين العناية اليومية للمرأة العربية.",
    location: "الجزائر العاصمة",
    languages: ["العربية", "الفرنسية"],
    portfolio: defaultPortfolio(asmaa),
  },
  {
    id: "yassin",
    name: "ياسين حجار",
    category: "لياقة بدنية وصحة",
    image: yassin,
    rating: 4.8,
    reviews: 198,
    verified: true,
    tiktok: "2.1M",
    instagram: "1.5M",
    youtube: "1.7M",
    tiktokUrl: "https://tiktok.com/@yassin",
    instagramUrl: "https://instagram.com/yassin",
    youtubeUrl: "https://youtube.com/@yassin",
    priceMin: 15000,
    priceMax: 35000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
    bio: "مدرّب لياقة بدنية محترف. أساعدك على بناء جسم صحي وقوي من خلال تمارين عملية ونصائح غذائية مدروسة.",
    location: "عنابة",
    languages: ["العربية", "الإنجليزية"],
    portfolio: defaultPortfolio(yassin),
  },
  {
    id: "lina",
    name: "لينا فود",
    category: "طبخ ومأكولات",
    image: lina,
    rating: 4.7,
    reviews: 134,
    verified: true,
    tiktok: "980K",
    instagram: "710K",
    youtube: "680K",
    tiktokUrl: "https://tiktok.com/@lina",
    instagramUrl: "https://instagram.com/lina",
    youtubeUrl: "https://youtube.com/@lina",
    priceMin: 8000,
    priceMax: 20000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
    bio: "عاشقة الطبخ والمأكولات التقليدية والعصرية. أشارك وصفات سهلة بمكوّنات متوفرة في كل بيت جزائري.",
    location: "تلمسان",
    languages: ["العربية", "الفرنسية"],
    portfolio: defaultPortfolio(lina),
  },
];

export const allInfluencersById: Record<string, Influencer> = Object.fromEntries(
  [...featuredInfluencers, ...allInfluencers].map((i) => [i.id, i]),
);

export function getInfluencerById(id: string): Influencer | undefined {
  return allInfluencersById[id];
}
