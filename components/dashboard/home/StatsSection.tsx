import {
  CircleCheckBig,
  FileText,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import type { DashboardStatsData } from "@/lib/dashboard/dashboard-types";
import type {
  DashboardStat,
  StatTrendDirection,
} from "@/lib/dashboard/home-data";
import StatCard from "./StatCard";
import styles from "./StatsSection.module.css";

type StatsSectionProps = {
  stats: DashboardStatsData;
};

const numberFormatter = new Intl.NumberFormat(
  "sv-SE"
);

const currencyFormatter = new Intl.NumberFormat(
  "sv-SE",
  {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }
);

function getDirection(
  value: number
): StatTrendDirection {
  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "neutral";
}

function formatTrend(value: number) {
  return numberFormatter.format(
    Math.abs(value)
  );
}

export default function StatsSection({
  stats,
}: StatsSectionProps) {
  const dashboardStats: DashboardStat[] = [
    {
      id: "active-projects",
      title: "Aktiva projekt",
      value: numberFormatter.format(
        stats.active_projects
      ),
      trend: formatTrend(
        stats.active_projects_change
      ),
      trendDirection: getDirection(
        stats.active_projects_change
      ),
      comparison: "nya denna vecka",
      icon: FolderKanban,
      tone: "green",
    },
    {
      id: "active-offers",
      title: "Pågående offerter",
      value: numberFormatter.format(
        stats.ongoing_offers
      ),
      trend: formatTrend(
        stats.ongoing_offers_change
      ),
      trendDirection: getDirection(
        stats.ongoing_offers_change
      ),
      comparison: "nya denna vecka",
      icon: FileText,
      tone: "purple",
    },
    {
      id: "monthly-revenue",
      title: "Intäkter (månad)",
      value: currencyFormatter.format(
        stats.monthly_revenue
      ),
      trend: `${formatTrend(
        stats.monthly_revenue_change
      )}%`,
      trendDirection: getDirection(
        stats.monthly_revenue_change
      ),
      comparison: "jämfört med förra månaden",
      icon: TrendingUp,
      tone: "cyan",
    },
    {
      id: "completed-projects",
      title: "Klara projekt",
      value: numberFormatter.format(
        stats.completed_projects
      ),
      trend: formatTrend(
        stats.completed_projects_change
      ),
      trendDirection: getDirection(
        stats.completed_projects_change
      ),
      comparison: "klara denna månad",
      icon: CircleCheckBig,
      tone: "blue",
    },
  ];

  return (
    <section
      className={styles.section}
      aria-label="Verksamhetsöversikt"
    >
      <div className={styles.grid}>
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            stat={stat}
          />
        ))}
      </div>
    </section>
  );
}
