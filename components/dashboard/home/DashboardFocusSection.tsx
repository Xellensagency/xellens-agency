import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  PauseCircle,
  UserRoundCheck,
} from "lucide-react";

import type {
  DashboardDeadlineData,
  DashboardProjectOverview,
  DashboardRecentProjectData,
} from "@/lib/dashboard/dashboard-types";

import styles from "./DashboardFocusSection.module.css";

type DashboardFocusSectionProps = {
  overview: DashboardProjectOverview;
  deadlines: DashboardDeadlineData[];
  projects: DashboardRecentProjectData[];
};

type AttentionTone =
  | "danger"
  | "warning"
  | "info"
  | "neutral";

type AttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: AttentionTone;
  icon:
    | typeof AlertTriangle
    | typeof CircleAlert
    | typeof Clock3
    | typeof PauseCircle
    | typeof UserRoundCheck;
};

const dateFormatter = new Intl.DateTimeFormat(
  "sv-SE",
  {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Stockholm",
  }
);

function parseDate(value: string) {
  const date = new Date(
    value.length === 10
      ? `${value}T12:00:00`
      : value
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function startOfToday() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

function daysBetween(
  from: Date,
  to: Date
) {
  const milliseconds =
    to.getTime() -
    from.getTime();

  return Math.ceil(
    milliseconds /
      (1000 * 60 * 60 * 24)
  );
}

function buildAttentionItems(
  deadlines: DashboardDeadlineData[],
  projects: DashboardRecentProjectData[]
) {
  const today = startOfToday();

  const items: AttentionItem[] = [];

  const sortedDeadlines = [...deadlines]
    .map((deadline) => ({
      deadline,
      date: parseDate(deadline.due_at),
    }))
    .filter(
      (
        item
      ): item is {
        deadline: DashboardDeadlineData;
        date: Date;
      } => Boolean(item.date)
    )
    .sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime()
    );

  for (const item of sortedDeadlines) {
    const days = daysBetween(
      today,
      item.date
    );

    if (days < 0) {
      items.push({
        id: `late-${item.deadline.id}`,
        title: "Försenad deadline",
        description:
          `${item.deadline.project_title} · ${item.deadline.title}`,
        href:
          `/dashboard/projekt/${item.deadline.project_id}`,
        tone: "danger",
        icon: AlertTriangle,
      });

      continue;
    }

    if (days <= 2) {
      items.push({
        id: `soon-${item.deadline.id}`,
        title:
          days === 0
            ? "Deadline idag"
            : days === 1
              ? "Deadline imorgon"
              : "Deadline inom 2 dagar",
        description:
          `${item.deadline.project_title} · ${item.deadline.title}`,
        href:
          `/dashboard/projekt/${item.deadline.project_id}`,
        tone: "warning",
        icon: Clock3,
      });
    }
  }

  for (const project of projects) {
    if (
      project.status ===
      "waiting_customer"
    ) {
      items.push({
        id: `waiting-${project.id}`,
        title: "Väntar på kund",
        description:
          `${project.title} · ${project.customer_name}`,
        href:
          `/dashboard/projekt/${project.id}`,
        tone: "info",
        icon: UserRoundCheck,
      });
    }

    if (
      project.status === "paused"
    ) {
      items.push({
        id: `paused-${project.id}`,
        title: "Projekt pausat",
        description:
          `${project.title} · ${project.customer_name}`,
        href:
          `/dashboard/projekt/${project.id}`,
        tone: "warning",
        icon: PauseCircle,
      });
    }

    if (
      !project.deadline &&
      project.status !== "completed" &&
      project.status !== "cancelled"
    ) {
      items.push({
        id: `missing-${project.id}`,
        title: "Projekt saknar deadline",
        description:
          `${project.title} · ${project.customer_name}`,
        href:
          `/dashboard/projekt/${project.id}`,
        tone: "neutral",
        icon: CircleAlert,
      });
    }
  }

  return items.slice(0, 6);
}

function getUpcomingDeadlines(
  deadlines: DashboardDeadlineData[]
) {
  const today = startOfToday();

  return deadlines
    .map((deadline) => ({
      deadline,
      date: parseDate(deadline.due_at),
    }))
    .filter(
      (
        item
      ): item is {
        deadline: DashboardDeadlineData;
        date: Date;
      } => {
        if (!item.date) {
          return false;
        }

        const days =
          daysBetween(
            today,
            item.date
          );

        return (
          days >= 0 &&
          days <= 7
        );
      }
    )
    .sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime()
    )
    .slice(0, 6);
}

export default function DashboardFocusSection({
  overview,
  deadlines,
  projects,
}: DashboardFocusSectionProps) {
  const attentionItems =
    buildAttentionItems(
      deadlines,
      projects
    );

  const upcomingDeadlines =
    getUpcomingDeadlines(
      deadlines
    );

  return (
    <section
      className={styles.grid}
      aria-label="Prioriteringar och kommande deadlines"
    >
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Arbetsfokus
            </span>

            <h2>
              Kräver din uppmärksamhet
            </h2>

            <p>
              Det viktigaste att hantera
              just nu.
            </p>
          </div>

          <Link
            href="/dashboard/projekt"
            className={styles.headerLink}
          >
            Alla projekt

            <ArrowRight
              size={16}
              strokeWidth={1.8}
            />
          </Link>
        </header>

        <div className={styles.statusGrid}>
          {overview.statuses.map(
            (status) => (
              <div
                className={styles.statusBox}
                key={status.id}
              >
                <span
                  className={`${styles.statusDot} ${
                    styles[status.tone]
                  }`}
                />

                <div>
                  <strong>
                    {status.value}
                  </strong>

                  <span>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {attentionItems.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <CheckCircle2
                size={24}
                strokeWidth={1.8}
              />
            </span>

            <div>
              <strong>
                Allt ser lugnt ut
              </strong>

              <p>
                Inga projekt eller deadlines
                kräver extra uppmärksamhet
                just nu.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.attentionList}>
            {attentionItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    href={item.href}
                    className={
                      styles.attentionItem
                    }
                    key={item.id}
                  >
                    <span
                      className={`${styles.attentionIcon} ${
                        styles[item.tone]
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                      />
                    </span>

                    <span
                      className={
                        styles.attentionText
                      }
                    >
                      <strong>
                        {item.title}
                      </strong>

                      <small>
                        {item.description}
                      </small>
                    </span>

                    <ArrowRight
                      className={
                        styles.rowArrow
                      }
                      size={17}
                      strokeWidth={1.7}
                    />
                  </Link>
                );
              }
            )}
          </div>
        )}
      </article>

      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Nästa steg
            </span>

            <h2>
              Kommande 7 dagar
            </h2>

            <p>
              Deadlines och milstolpar
              den närmaste veckan.
            </p>
          </div>

          <Link
            href="/dashboard/kalender"
            className={styles.headerLink}
          >
            Kalender

            <ArrowRight
              size={16}
              strokeWidth={1.8}
            />
          </Link>
        </header>

        {upcomingDeadlines.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <CalendarClock
                size={24}
                strokeWidth={1.8}
              />
            </span>

            <div>
              <strong>
                Inga deadlines nästa vecka
              </strong>

              <p>
                Nya deadlines visas här
                automatiskt när de läggs
                till i projekten.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.upcomingList}>
            {upcomingDeadlines.map(
              ({
                deadline,
                date,
              }) => (
                <Link
                  key={deadline.id}
                  href={`/dashboard/projekt/${deadline.project_id}`}
                  className={
                    styles.upcomingItem
                  }
                >
                  <span
                    className={
                      styles.dateBox
                    }
                  >
                    <strong>
                      {dateFormatter.format(
                        date
                      )}
                    </strong>
                  </span>

                  <span
                    className={
                      styles.upcomingText
                    }
                  >
                    <strong>
                      {deadline.title}
                    </strong>

                    <small>
                      {
                        deadline.project_title
                      }
                    </small>
                  </span>

                  <ArrowRight
                    className={
                      styles.rowArrow
                    }
                    size={17}
                    strokeWidth={1.7}
                  />
                </Link>
              )
            )}
          </div>
        )}
      </article>
    </section>
  );
}