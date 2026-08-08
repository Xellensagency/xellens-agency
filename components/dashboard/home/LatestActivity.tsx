import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  UserRound,
} from "lucide-react";

import type {
  DashboardActivityItem,
} from "@/lib/dashboard/get-dashboard-activity";

import styles from "./LatestActivity.module.css";

type Props = {
  activities:
    DashboardActivityItem[];
};

const dateFormatter =
  new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Europe/Stockholm",
    }
  );

export default function LatestActivity({
  activities,
}: Props) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Händelser
          </span>

          <h2>
            Senaste aktivitet
          </h2>

          <p>
            Det senaste som hänt
            i Vorix.
          </p>
        </div>
      </header>

      {activities.length === 0 ? (
        <div className={styles.empty}>
          <strong>
            Ingen aktivitet ännu
          </strong>

          <span>
            Händelser visas här
            automatiskt.
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {activities.map(
            (activity) => {
              const Icon =
                activity.type ===
                "customer"
                  ? UserRound
                  : activity.type ===
                      "invoice"
                    ? FileText
                    : BriefcaseBusiness;

              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className={
                    styles.row
                  }
                >
                  <span
                    className={`${styles.icon} ${
                      styles[
                        activity.tone
                      ]
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                    />
                  </span>

                  <span
                    className={
                      styles.text
                    }
                  >
                    <strong>
                      {
                        activity.title
                      }
                    </strong>

                    <small>
                      {
                        activity.description
                      }
                    </small>
                  </span>

                  <time>
                    {dateFormatter.format(
                      new Date(
                        activity.createdAt
                      )
                    )}
                  </time>

                  <ArrowRight
                    className={
                      styles.arrow
                    }
                    size={16}
                  />
                </Link>
              );
            }
          )}
        </div>
      )}
    </article>
  );
}