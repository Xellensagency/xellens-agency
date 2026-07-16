import Link from "next/link";
import { MoreVertical } from "lucide-react";
import type { DashboardRecentProjectData } from "@/lib/dashboard/dashboard-types";
import styles from "./RecentProjects.module.css";

type ProjectTone =
  | "green"
  | "blue"
  | "purple"
  | "orange";

type RecentProjectsProps = {
  projects: DashboardRecentProjectData[];
};

const statusSettings: Record<
  string,
  {
    label: string;
    tone: ProjectTone;
  }
> = {
  planning: {
    label: "Planering",
    tone: "blue",
  },
  ongoing: {
    label: "Pågående",
    tone: "green",
  },
  waiting_customer: {
    label: "Väntar på kund",
    tone: "purple",
  },
  production: {
    label: "I produktion",
    tone: "blue",
  },
  paused: {
    label: "Pausat",
    tone: "orange",
  },
  completed: {
    label: "Klart",
    tone: "green",
  },
  cancelled: {
    label: "Avbrutet",
    tone: "orange",
  },
};

const dateFormatter = new Intl.DateTimeFormat(
  "sv-SE",
  {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }
);

function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "XA";
}

export default function RecentProjects({
  projects,
}: RecentProjectsProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2>Senaste projekt</h2>

        <Link href="/dashboard/projekt">
          Visa alla projekt
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>Inga projekt ännu</strong>

          <span>
            När det första projektet skapas
            visas det här automatiskt.
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {projects.map((project) => {
            const status =
              statusSettings[
                project.status
              ] ?? {
                label: project.status,
                tone: "blue" as const,
              };

            const ownerName =
              project.owner_name?.trim() ||
              "Ej tilldelad";

            return (
              <div
                className={styles.project}
                key={project.id}
              >
                <div
                  className={`${styles.thumbnail} ${
                    styles[status.tone]
                  }`}
                  aria-hidden="true"
                >
                  <span>
                    {getInitials(
                      project.title
                    )}
                  </span>
                </div>

                <div
                  className={styles.projectInfo}
                >
                  <strong>
                    {project.title}
                  </strong>

                  <span>
                    {project.category ||
                      project.customer_name}
                  </span>
                </div>

                <span
                  className={`${styles.status} ${
                    styles[
                      `${status.tone}Status`
                    ]
                  }`}
                >
                  {status.label}
                </span>

                <div className={styles.deadline}>
                  <span>Deadline</span>

                  <strong>
                    {project.deadline
                      ? dateFormatter.format(
                          new Date(
                            `${project.deadline}T12:00:00`
                          )
                        )
                      : "Ingen deadline"}
                  </strong>
                </div>

                <span
                  className={styles.owner}
                  title={ownerName}
                >
                  {project.owner_name
                    ? getInitials(
                        project.owner_name
                      )
                    : "–"}
                </span>

                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label={`Fler alternativ för ${project.title}`}
                >
                  <MoreVertical
                    size={19}
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
