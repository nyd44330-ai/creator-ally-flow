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

export const mockCampaigns: Campaign[] = [];

export const statusLabel: Record<CampaignStatus, string> = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  active: "نشطة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};
