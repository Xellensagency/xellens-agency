import {
  ArrowUp,
  Box,
  CheckCircle2,
  Clock3,
  FolderKanban,
} from "lucide-react";
import type { ProjectListStats } from "@/lib/dashboard/projects/project-types";
import styles from "./ProjectStatsSection.module.css";

type ProjectStatsSectionProps = {
  stats: ProjectListStats;
};

const numberFormatter =
  new Intl.NumberFormat("sv-SE");

const projectStats = [
  {
    id: "active",
    title: "Aktiva projekt",
    valueKey: "active_projects",
    changeKey: "active_projects_change",
    comparison: "nya sedan veckan började",
    icon: FolderKanban,
    tone: "green",
  },
  {
    id: "waiting",
    title: "Väntar på kund",
    valueKey: "waiting_projects",
    changeKey: "waiting_projects_change",
    comparison: "nya sedan veckan började",
    icon: Clock3,
    tone: "purple",
  },
  {
    id: "completed",
    title: "Klara projekt",
    valueKey: "completed_projects",
    changeKey: "completed_projects_change",
    comparison: "klara denna månad",
    icon: CheckCircle2,
    tone: "blue",
  },
  {
    id: "total",
    title: "Totala projekt",
    valueKey: "total_projects",
    changeKey: "total_projects_change",
    comparison: "nya denna månad",
    icon: Box,
    tone: "orange",
  },
] as const;

export default function ProjectStatsSection({
  stats,
}: ProjectStatsSectionProps) {
  return (
    <section
      className={styles.grid}
      aria-label="Projektstatistik"
    >
      {projectStats.map((item) => {
        const Icon = item.icon;

        const value =
          stats[item.valueKey];

        const change =
          stats[item.changeKey];

        return (
          <article
            className={styles.card}
            key={item.id}
          >
            <div
              className={`${styles.iconBox} ${
                styles[item.tone]
              }`}
              aria-hidden="true"
            >
              <Icon
                size={27}
                strokeWidth={1.7}
              />
            </div>

            <div className={styles.cardContent}>
              <p>{item.title}</p>

              <strong>
                {numberFormatter.format(
                  value
                )}
              </strong>

              <div className={styles.change}>
                <span>
                  <ArrowUp
                    size={13}
                    strokeWidth={2}
                  />

                  {numberFormatter.format(
                    change
                  )}
                </span>

                <small>
                  {item.comparison}
                </small>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
