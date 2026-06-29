import marwan from "@/assets/influencer-marwan.jpg";
import dunia from "@/assets/influencer-dunia.jpg";
import karim from "@/assets/influencer-karim.jpg";
import asmaa from "@/assets/influencer-asmaa.jpg";
import yassin from "@/assets/influencer-yassin.jpg";
import lina from "@/assets/influencer-lina.jpg";

export type Influencer = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  verified: boolean;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  priceMin: number;
  priceMax: number;
  services: string[];
};

export const featuredInfluencers: Influencer[] = [
  {
    id: "marwan",
    name: "مروان سفر",
    category: "سفر وسياحة",
    image: marwan,
    rating: 4.9,
    verified: true,
    priceMin: 12000,
    priceMax: 28000,
    services: ["فيديو ريلز", "ستوري"],
  },
  {
    id: "dunia",
    name: "دنيا لايف",
    category: "موضة وجمال",
    image: dunia,
    rating: 4.8,
    verified: true,
    priceMin: 14000,
    priceMax: 30000,
    services: ["فيديو ريلز", "مراجعة منتج"],
  },
  {
    id: "karim",
    name: "كريم تك",
    category: "تقنية",
    image: karim,
    rating: 4.9,
    verified: true,
    priceMin: 15000,
    priceMax: 35000,
    services: ["مراجعة منتج", "فيديو ريلز"],
  },
];

export const allInfluencers: Influencer[] = [
  {
    id: "asmaa",
    name: "أسماء بن عيسى",
    category: "جمال وعناية بالبشرة",
    image: asmaa,
    rating: 4.9,
    verified: true,
    tiktok: "1.8M",
    instagram: "920K",
    youtube: "1.2M",
    priceMin: 10000,
    priceMax: 25000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
  },
  {
    id: "yassin",
    name: "ياسين حجار",
    category: "لياقة بدنية وصحة",
    image: yassin,
    rating: 4.8,
    verified: true,
    tiktok: "2.1M",
    instagram: "1.5M",
    youtube: "1.7M",
    priceMin: 15000,
    priceMax: 35000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
  },
  {
    id: "lina",
    name: "لينا فود",
    category: "طبخ ومأكولات",
    image: lina,
    rating: 4.7,
    verified: true,
    tiktok: "980K",
    instagram: "710K",
    youtube: "680K",
    priceMin: 8000,
    priceMax: 20000,
    services: ["فيديو ريلز", "ستوري", "مراجعة منتج"],
  },
];
