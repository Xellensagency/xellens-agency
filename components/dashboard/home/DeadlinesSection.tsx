import Link from "next/link";
import type { DashboardDeadlineData } from "@/lib/dashboard/dashboard-types";
import styles from "./DeadlinesSection.module.css";

type DeadlineTone =
  | "green"
  | "orange"
  | "blue"
  | "purple";

type DeadlinesSectionProps = {
  deadlines: DashboardDeadlineData[];
};

const dayFormatter = new Intl.DateTimeFormat(
  "sv-SE",
  {
    day: "2-digit",
    timeZone: "Europe/Stockholm",
  }
);

const monthFormatter =
  new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    timeZone: "Europe/Stockholm",
  });

function getStockholmDayValue(date: Date) {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Europe/Stockholm",
    }
  ).formatToParts(date);

  const year = Number(
    parts.find((part) => part.type === "year")
      ?.value
  );

  const month = Number(
    parts.find((part) => part.type === "month")
      ?.value
  );

  const day = Number(
    parts.find((part) => part.type === "day")
      ?.value
  );

  return Date.UTC(year, month - 1, day);
}

function getRemainingDays(dueDate: Date) {
  const today = getStockholmDayValue(
    new Date()
  );

  const deadline =
    getStockholmDayValue(dueDate);

  return Math.max(
    0,
    Math.ceil(
      (deadline - today) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function getRemainingText(days: number) {
  if (days === 0) {
    return "I DAG";
  }

  if (days === 1) {
    return "1 DAG";
  }

  return `${days} DAGAR`;
}

function getDeadlineTone(
  days: number
): DeadlineTone {
  if (days === 0) {
    return "green";
  }

  if (days <= 2) {
    return "orange";
  }

  if (days <= 7) {
    return "blue";
  }

  return "purple";
}

export default function DeadlinesSection({
  deadlines,
}: DeadlinesSectionProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2>Kommande deadlines</h2>

        <Link href="/dashboard/kalender">
          Visa kalender
        </Link>
      </header>

      {deadlines.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>Inga kommande deadlines</strong>
          <span>
            Nya deadlines visas här när de
            läggs till i ett projekt.
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {deadlines.map((deadline) => {
            const dueDate = new Date(
              deadline.due_at
            );

            const remainingDays =
              getRemainingDays(dueDate);

            const tone =
              getDeadlineTone(
                remainingDays
              );

            const month = monthFormatter
              .format(dueDate)
              .replace(".", "")
              .toUpperCase();

            return (
              <div
                className={styles.deadline}
                key={deadline.id}
              >
                <div className={styles.dateBox}>
                  <strong>
                    {dayFormatter.format(
                      dueDate
                    )}
                  </strong>

                  <span>{month}</span>
                </div>

                <div className={styles.details}>
                  <strong>
                    {deadline.project_title}
                  </strong>

                  <span>
                    {deadline.title}
                  </span>
                </div>

                <span
                  className={`${styles.badge} ${
                    styles[tone]
                  }`}
                >
                  {getRemainingText(
                    remainingDays
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
