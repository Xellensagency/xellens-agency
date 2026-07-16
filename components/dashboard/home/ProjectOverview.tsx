import { ChevronDown } from "lucide-react";
import type {
  DashboardProjectOverview,
  DashboardProjectStatus,
} from "@/lib/dashboard/dashboard-types";
import styles from "./ProjectOverview.module.css";

type ProjectOverviewProps = {
  overview: DashboardProjectOverview;
};

const toneColors: Record<
  DashboardProjectStatus["tone"],
  string
> = {
  green: "#58d8bd",
  purple: "#8d6bea",
  blue: "#58a8f7",
  orange: "#ffb451",
};

function createChartGradient(
  overview: DashboardProjectOverview
) {
  if (overview.total <= 0) {
    return "conic-gradient(rgba(114, 156, 161, 0.14) 0% 100%)";
  }

  let currentValue = 0;

  const segments = overview.statuses.map((status) => {
    const start =
      (currentValue / overview.total) * 100;

    currentValue += status.value;

    const end =
      (currentValue / overview.total) * 100;

    return `${
      toneColors[status.tone]
    } ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export default function ProjectOverview({
  overview,
}: ProjectOverviewProps) {
  const chartGradient =
    createChartGradient(overview);

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2>Projektöversikt</h2>

        <button
          type="button"
          className={styles.periodButton}
        >
          <span>{overview.period}</span>
          <ChevronDown
            size={17}
            strokeWidth={1.7}
          />
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.chartArea}>
          <div
            className={styles.donut}
            style={{
              background: chartGradient,
            }}
            role="img"
            aria-label={`${overview.total} projekt totalt`}
          >
            <div className={styles.donutCenter}>
              <strong>{overview.total}</strong>
              <span>Totalt</span>
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          {overview.statuses.map((status) => (
            <div
              className={styles.legendRow}
              key={status.id}
            >
              <strong>{status.value}</strong>

              <span
                className={`${styles.dot} ${
                  styles[status.tone]
                }`}
                aria-hidden="true"
              />

              <span className={styles.legendLabel}>
                {status.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
