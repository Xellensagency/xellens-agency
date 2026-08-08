import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import type {
  ProjectListItem,
} from "@/lib/dashboard/projects/project-types";

import styles from "./ProjectsTable.module.css";

type Props = {
  projects: ProjectListItem[];
};

type ProjectTone =
  | "green"
  | "purple"
  | "blue"
  | "orange"
  | "gray";

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
    label: "Pausad",
    tone: "orange",
  },

  completed: {
    label: "Klar",
    tone: "green",
  },

  cancelled: {
    label: "Avbruten",
    tone: "gray",
  },

  archived: {
    label: "Arkiverad",
    tone: "gray",
  },
};

const dateFormatter =
  new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone:
        "Europe/Stockholm",
    }
  );

function getInitials(
  value: string
) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) => word[0]
      )
      .join("")
      .toUpperCase() ||
    "VO"
  );
}

function getNextAction(
  project: ProjectListItem
) {
  if (
    !project.deadline &&
    project.status !== "completed" &&
    project.status !== "cancelled" &&
    project.status !== "archived"
  ) {
    return "Sätt deadline";
  }

  switch (project.status) {
    case "planning":
      return "Planera nästa steg";

    case "ongoing":
      return "Fortsätt projektet";

    case "waiting_customer":
      return "Följ upp kunden";

    case "production":
      return "Följ produktionen";

    case "paused":
      return "Granska pausen";

    case "completed":
      return "Visa leverans";

    default:
      return "Öppna projekt";
  }
}

function formatUpdatedAt(
  value: string
) {
  const date =
    new Date(value);

  return dateFormatter.format(
    date
  );
}

export default function ProjectsTable({
  projects,
}: Props) {
  if (projects.length === 0) {
    return (
      <section
        className={styles.emptyCard}
      >
        <div
          className={styles.emptyIcon}
        >
          +
        </div>

        <h2>
          Inga projekt hittades
        </h2>

        <p>
          Skapa ett nytt projekt eller
          ändra sökningen och filtreringen.
        </p>

        <Link
          href="/dashboard/projekt/nytt"
        >
          Skapa första projektet
        </Link>
      </section>
    );
  }

  return (
    <section
      className={styles.tableCard}
    >
      <div
        className={styles.tableHeader}
        aria-hidden="true"
      >
        <span>Projekt</span>
        <span>Kund</span>
        <span>Status</span>
        <span>Progress</span>
        <span>Deadline</span>
        <span>Ansvarig</span>
        <span>Uppdaterad</span>
        <span />
      </div>

      <div className={styles.rows}>
        {projects.map(
          (project) => {
            const status =
              statusSettings[
                project.status
              ] ?? {
                label:
                  project.status,
                tone:
                  "gray" as const,
              };

            const progress =
              Math.min(
                100,
                Math.max(
                  0,
                  Number(
                    project.progress ??
                    0
                  )
                )
              );

            const nextAction =
              getNextAction(
                project
              );

            return (
              <Link
                href={`/dashboard/projekt/${project.id}`}
                className={styles.row}
                key={project.id}
              >
                <div
                  className={
                    styles.projectCell
                  }
                  data-label="Projekt"
                >
                  <div
                    className={
                      styles.thumbnail
                    }
                    style={
                      project.thumbnail_url
                        ? {
                            backgroundImage:
                              `url("${project.thumbnail_url}")`,
                          }
                        : undefined
                    }
                  >
                    {!project.thumbnail_url && (
                      <span>
                        {getInitials(
                          project.title
                        )}
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.projectText
                    }
                  >
                    <strong
                      className={
                        styles.projectTitle
                      }
                    >
                      {project.title}
                    </strong>

                    <span>
                      {
                        project.project_number
                      }

                      {project.category
                        ? ` · ${project.category}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.customerCell
                  }
                  data-label="Kund"
                >
                  <span
                    className={
                      styles.customerAvatar
                    }
                  >
                    {getInitials(
                      project.customer_name
                    )}
                  </span>

                  <strong>
                    {
                      project.customer_name
                    }
                  </strong>
                </div>

                <div
                  className={
                    styles.statusCell
                  }
                  data-label="Status"
                >
                  <span
                    className={`${styles.status} ${
                      styles[
                        status.tone
                      ]
                    }`}
                  >
                    {status.label}
                  </span>

                  <small
                    className={
                      styles.nextAction
                    }
                  >
                    {nextAction}
                  </small>
                </div>

                <div
                  className={
                    styles.progressCell
                  }
                  data-label="Progress"
                >
                  <div
                    className={
                      styles.progressTrack
                    }
                  >
                    <span
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {progress}%
                  </strong>
                </div>

                <div
                  className={
                    styles.deadlineCell
                  }
                  data-label="Deadline"
                >
                  <CalendarDays
                    size={16}
                    strokeWidth={1.7}
                  />

                  <span>
                    {project.deadline
                      ? dateFormatter.format(
                          new Date(
                            `${project.deadline}T12:00:00`
                          )
                        )
                      : "Saknas"}
                  </span>
                </div>

                <div
                  className={
                    styles.ownerCell
                  }
                  data-label="Ansvarig"
                >
                  {project.owner_name ? (
                    <>
                      <span
                        className={
                          styles.ownerAvatar
                        }
                      >
                        {getInitials(
                          project.owner_name
                        )}
                      </span>

                      <strong>
                        {
                          project.owner_name
                        }
                      </strong>
                    </>
                  ) : (
                    <span
                      className={
                        styles.unassigned
                      }
                    >
                      Ej tilldelad
                    </span>
                  )}
                </div>

                <div
                  className={
                    styles.updatedCell
                  }
                  data-label="Uppdaterad"
                >
                  {formatUpdatedAt(
                    project.updated_at
                  )}
                </div>

                <span
                  className={
                    styles.openIcon
                  }
                >
                  <ChevronRight
                    size={18}
                    strokeWidth={1.8}
                  />
                </span>
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}