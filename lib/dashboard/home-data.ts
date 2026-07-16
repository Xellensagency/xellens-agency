import type { LucideIcon } from "lucide-react";

export type StatTone =
  | "green"
  | "purple"
  | "cyan"
  | "blue";

export type StatTrendDirection =
  | "up"
  | "down"
  | "neutral";

export type DashboardStat = {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendDirection: StatTrendDirection;
  comparison: string;
  icon: LucideIcon;
  tone: StatTone;
};
