import Link from "next/link";
import {
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";
import type {
  ProjectListItem,
  ProjectMember,
} from "@/lib/dashboard/projects/project-types";
import styles from "./ProjectsTable.module.css";

type ProjectsTableProps = {
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
    tone: "blue",
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

const dateFormatter = new Intl.DateTimeFormat(
  "sv-SE",
  {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }
);

const timeFormatter = new Intl.DateTimeFormat(
  "sv-SE",
  {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }
);

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "XA"
  );
}

function getStockholmDateKey(value: Date) {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Europe/Stockholm",
    }
  ).format(value);
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const now = new Date();

  const todayKey = getStockholmDateKey(now);
  const dateKey = getStockholmDateKey(date);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey =
    getStockholmDateKey(yesterday);

  if (dateKey === todayKey) {
    return `Idag ${timeFormatter.format(date)}`;
  }

  if (dateKey === yesterdayKey) {
    return `Igår ${timeFormatter.format(date)}`;
  }

  return dateFormatter.format(date);
}

function getPeople(project: ProjectListItem) {
  const people: ProjectMember[] = [
    ...(project.owner_id && project.owner_name
      ? [
          {
            id: project.owner_id,
            full_name: project.owner_name,
            email: null,
            member_role: "owner",
          },
        ]
      : []),
    ...project.members,
  ];

  return Array.from(
    new Map(
      people.map((person) => [
        person.id,
        person,
      ])
    ).values()
  );
}

export default function ProjectsTable({
  projects,
}: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <section className={styles.emptyCard}>
        <div className={styles.emptyIcon}>
          <span>+</span>
        </div>

        <h2>Inga projekt hittades</h2>

        <p>
          Skapa ett nytt projekt eller ändra
          sökningen och filtreringen.
        </p>

        <Link href="/dashboard/projekt/nytt">
          Skapa första projektet
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.tableCard}>
      <div
        className={styles.tableHeader}
        aria-hidden="true"
      >
        <span>Projekt</span>
        <span>Kund</span>
        <span>Status</span>
        <span>Deadline</span>
        <span>Medlemmar</span>
        <span>Senast uppdaterad</span>
        <span />
      </div>

      <div className={styles.rows}>
        {projects.map((project) => {
          const status =
            statusSettings[project.status] ?? {
              label: project.status,
              tone: "gray" as const,
            };

          const people = getPeople(project);
          const visiblePeople = people.slice(0, 3);

          const remainingPeople = Math.max(
            people.length - visiblePeople.length,
            0
          );

          return (
            <Link
              href={`/dashboard/projekt/${project.id}`}
              className={styles.row}
              key={project.id}
            >
              <div
                className={styles.projectCell}
                data-label="Projekt"
              >
                <div
                  className={styles.thumbnail}
                  style={
                    project.thumbnail_url
                      ? {
                          backgroundImage: `url("${project.thumbnail_url}")`,
                        }
                      : undefined
                  }
                  aria-hidden="true"
                >
                  {!project.thumbnail_url && (
                    <span>
                      {getInitials(project.title)}
                    </span>
                  )}
                </div>

                <div className={styles.projectText}>
                  <strong
                    className={
                      styles.projectTitle
                    }
                  >
                    {project.title}
                  </strong>

                  <span>
                    {project.category ||
                      project.project_number}
                  </span>
                </div>
              </div>

              <div
                className={styles.customerCell}
                data-label="Kund"
              >
                <span
                  className={styles.customerAvatar}
                >
                  {getInitials(
                    project.customer_name
                  )}
                </span>

                <strong>
                  {project.customer_name}
                </strong>
              </div>

              <div
                className={styles.statusCell}
                data-label="Status"
              >
                <span
                  className={`${styles.status} ${
                    styles[status.tone]
                  }`}
                >
                  {status.label}
                </span>
              </div>

              <div
                className={styles.deadlineCell}
                data-label="Deadline"
              >
                <CalendarDays
                  size={16}
                  strokeWidth={1.6}
                />

                <span>
                  {project.deadline
                    ? dateFormatter.format(
                        new Date(
                          `${project.deadline}T12:00:00`
                        )
                      )
                    : "Ingen deadline"}
                </span>
              </div>

              <div
                className={styles.membersCell}
                data-label="Medlemmar"
              >
                {visiblePeople.length === 0 ? (
                  <span className={styles.noMembers}>
                    Ej tilldelad
                  </span>
                ) : (
                  <div className={styles.memberStack}>
                    {visiblePeople.map((person) => (
                      <span
                        className={styles.member}
                        title={
                          person.full_name ||
                          person.email ||
                          "Medlem"
                        }
                        key={person.id}
                      >
                        {getInitials(
                          person.full_name ||
                            person.email ||
                            "Medlem"
                        )}
                      </span>
                    ))}

                    {remainingPeople > 0 && (
                      <span
                        className={styles.moreMembers}
                      >
                        +{remainingPeople}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div
                className={styles.updatedCell}
                data-label="Uppdaterad"
              >
                {formatUpdatedAt(
                  project.updated_at
                )}
              </div>

              <span
                className={styles.moreButton}
                aria-hidden="true"
              >
                <MoreHorizontal
                  size={19}
                  strokeWidth={1.8}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

