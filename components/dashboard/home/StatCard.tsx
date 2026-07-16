import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";
import type { DashboardStat } from "@/lib/dashboard/home-data";
import styles from "./StatCard.module.css";

type StatCardProps = {
  stat: DashboardStat;
};

export default function StatCard({
  stat,
}: StatCardProps) {
  const Icon = stat.icon;

  const TrendIcon =
    stat.trendDirection === "down"
      ? ArrowDown
      : stat.trendDirection === "neutral"
        ? Minus
        : ArrowUp;

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <p className={styles.title}>
          {stat.title}
        </p>

        <p className={styles.value}>
          {stat.value}
        </p>

        <div className={styles.trend}>
          <span
            className={`${styles.trendValue} ${
              styles[stat.trendDirection]
            }`}
          >
            <TrendIcon
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />

            {stat.trend}
          </span>

          <span className={styles.comparison}>
            {stat.comparison}
          </span>
        </div>
      </div>

      <div
        className={`${styles.iconBox} ${styles[stat.tone]}`}
        aria-hidden="true"
      >
        <Icon size={27} strokeWidth={1.7} />
      </div>
    </article>
  );
}
