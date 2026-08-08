import Link from "next/link";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Minus,
} from "lucide-react";

import type {
  DashboardStat,
} from "@/lib/dashboard/home-data";

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
    <Link
      href={stat.href}
      className={styles.card}
    >
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
              styles[
                stat.trendDirection
              ]
            }`}
          >
            <TrendIcon
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />

            {stat.trend}
          </span>

          <span
            className={styles.comparison}
          >
            {stat.comparison}
          </span>
        </div>
      </div>

      <div className={styles.side}>
        <div
          className={`${styles.iconBox} ${
            styles[stat.tone]
          }`}
        >
          <Icon
            size={25}
            strokeWidth={1.7}
          />
        </div>

        <ArrowRight
          className={styles.arrow}
          size={17}
          strokeWidth={1.8}
        />
      </div>
    </Link>
  );
}