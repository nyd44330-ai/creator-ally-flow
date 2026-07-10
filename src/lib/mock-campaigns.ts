import type { Influencer } from "./mock-influencers";

export type CampaignStatus = "draft" | "pending" | "active" | "completed" | "cancelled";

export type Campaign = {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  platforms: ("tiktok" | "instagram" | "youtube")[];
  influencers: Influencer[];
  progress: number;
  createdAt: string;
};



export const mockCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "إطلاق عطر الصيف",
    goal: "زيادة الوعي بالعلامة",
    status: "active",
    budget: 250000,
    spent: 142000,
    startDate: "2026-06-15",
    endDate: "2026-07-15",
    platforms: ["instagram", "tiktok"],
    influencers: [all[0], all[3]].filter(Boolean),
    progress: 57,
    createdAt: "2026-06-10",
  },
  {
    id: "c2",
    name: "حملة تخفيضات رمضان",
    goal: "زيادة المبيعات",
    status: "completed",
    budget: 500000,
    spent: 487000,
    startDate: "2026-03-01",
    endDate: "2026-04-01",
    platforms: ["tiktok", "youtube", "instagram"],
    influencers: [all[1], all[2], all[4]].filter(Boolean),
    progress: 100,
    createdAt: "2026-02-20",
  },
  {
    id: "c3",
    name: "مراجعة تطبيق التوصيل",
    goal: "تحميلات التطبيق",
    status: "pending",
    budget: 120000,
    spent: 0,
    startDate: "2026-07-20",
    endDate: "2026-08-10",
    platforms: ["youtube"],
    influencers: [all[5]].filter(Boolean),
    progress: 0,
    createdAt: "2026-07-05",
  },
  {
    id: "c4",
    name: "مسابقة صيف 2026",
    goal: "زيادة المتابعين",
    status: "draft",
    budget: 80000,
    spent: 0,
    startDate: "2026-08-01",
    endDate: "2026-08-20",
    platforms: ["instagram"],
    influencers: [],
    progress: 0,
    createdAt: "2026-07-06",
  },
  {
    id: "c5",
    name: "إطلاق مطعم جديد",
    goal: "زيارات المتجر",
    status: "cancelled",
    budget: 150000,
    spent: 15000,
    startDate: "2026-05-10",
    endDate: "2026-06-10",
    platforms: ["tiktok", "instagram"],
    influencers: [all[6]].filter(Boolean),
    progress: 10,
    createdAt: "2026-05-01",
  },
];

export const statusLabel: Record<CampaignStatus, string> = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  active: "نشطة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};
