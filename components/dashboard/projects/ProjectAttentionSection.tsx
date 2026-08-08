import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  PauseCircle,
  UserRoundCheck,
} from "lucide-react";

import type {
  ProjectListItem,
} from "@/lib/dashboard/projects/project-types";

import styles from "./ProjectAttentionSection.module.css";

type Props = {
  projects: ProjectListItem[];
};

type Tone =
  | "danger"
  | "warning"
  | "info"
  | "neutral";

type AttentionItem = {
  id: string;
  title: string;
  description: string;
  action: string;
  href: string;
  tone: Tone;
  icon:
    | typeof AlertTriangle
    | typeof CalendarClock
    | typeof CircleAlert
    | typeof PauseCircle
    | typeof UserRoundCheck;
};

function getDaysUntil(
  value: string
) {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const deadline =
    new Date(
      `${value}T12:00:00`
    );

  deadline.setHours(
    0,
    0,
    0,
    0
  );

  return Math.round(
    (
      deadline.getTime() -
      today.getTime()
    ) /
      86400000
  );
}

function getAttentionItem(
  project: ProjectListItem
): AttentionItem | null {
  const finished =
    project.status === "completed" ||
    project.status === "cancelled" ||
    project.status === "archived";

  if (
    project.deadline &&
    !finished
  ) {
    const days =
      getDaysUntil(
        project.deadline
      );

    if (days < 0) {
      return {
        id: `overdue-${project.id}`,
        title: "Deadline har passerat",
        description:
          `${project.title} · ${project.customer_name}`,
        action: "Öppna projekt",
        href:
          `/dashboard/projekt/${project.id}`,
        tone: "danger",
        icon: AlertTriangle,
      };
    }

    if (days <= 3) {
      return {
        id: `deadline-${project.id}`,
        title:
          days === 0
            ? "Deadline idag"
            : days === 1
              ? "Deadline imorgon"
              : `Deadline om ${days} dagar`,
        description:
          `${project.title} · ${project.customer_name}`,
        action: "Kontrollera",
        href:
          `/dashboard/projekt/${project.id}`,
        tone: "warning",
        icon: CalendarClock,
      };
    }
  }

  if (
    project.status ===
    "waiting_customer"
  ) {
    return {
      id: `waiting-${project.id}`,
      title: "Väntar på kund",
      description:
        `${project.title} · ${project.customer_name}`,
      action: "Följ upp",
      href:
        `/dashboard/projekt/${project.id}`,
      tone: "info",
      icon: UserRoundCheck,
    };
  }

  if (
    project.status === "paused"
  ) {
    return {
      id: `paused-${project.id}`,
      title: "Projekt pausat",
      description:
        `${project.title} · ${project.customer_name}`,
      action: "Granska",
      href:
        `/dashboard/projekt/${project.id}`,
      tone: "warning",
      icon: PauseCircle,
    };
  }

  if (
    !project.deadline &&
    !finished
  ) {
    return {
      id: `missing-${project.id}`,
      title: "Projekt saknar deadline",
      description:
        `${project.title} · ${project.customer_name}`,
      action: "Sätt deadline",
      href:
        `/dashboard/projekt/${project.id}`,
      tone: "neutral",
      icon: CircleAlert,
    };
  }

  return null;
}

export default function ProjectAttentionSection({
  projects,
}: Props) {
  const items =
    projects
      .map(getAttentionItem)
      .filter(
        (
          item
        ): item is AttentionItem =>
          item !== null
      )
      .slice(0, 4);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Projektfokus
          </span>

          <h2>
            Kräver uppmärksamhet
          </h2>

          <p>
            Projekt i aktuell vy som kan
            behöva en åtgärd.
          </p>
        </div>

        <span className={styles.counter}>
          {items.length}
        </span>
      </header>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <CheckCircle2
              size={23}
              strokeWidth={1.8}
            />
          </span>

          <div>
            <strong>
              Allt ser bra ut
            </strong>

            <p>
              Inga projekt i den aktuella
              vyn behöver extra
              uppmärksamhet.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => {
            const Icon =
              item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={styles.item}
              >
                <span
                  className={`${styles.icon} ${
                    styles[item.tone]
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                  />
                </span>

                <span className={styles.text}>
                  <strong>
                    {item.title}
                  </strong>

                  <small>
                    {item.description}
                  </small>
                </span>

                <span className={styles.action}>
                  {item.action}

                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}