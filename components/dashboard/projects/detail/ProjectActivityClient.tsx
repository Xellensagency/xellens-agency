"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Files,
  ListChecks,
  Palette,
  ReceiptText,
  Search,
  Send,
  UploadCloud,
} from "lucide-react";

import styles from "./ProjectActivityClient.module.css";


export type ProjectActivityItem = {
  id: string;

  category:
    | "project"
    | "task"
    | "file"
    | "design"
    | "offer"
    | "invoice";

  type: string;

  title: string;

  description:
    string | null;

  actor:
    string | null;

  timestamp: string;
};


type Props = {
  items:
    ProjectActivityItem[];
};


const filters = [
  {
    key: "all",
    label: "All aktivitet",
  },
  {
    key: "project",
    label: "Projekt",
  },
  {
    key: "task",
    label: "Uppgifter",
  },
  {
    key: "design",
    label: "Design",
  },
  {
    key: "file",
    label: "Filer",
  },
  {
    key: "offer",
    label: "Offerter",
  },
  {
    key: "invoice",
    label: "Fakturor",
  },
];


const categoryLabels:
Record<string, string> = {
  project:
    "Projekt",

  task:
    "Uppgift",

  file:
    "Fil",

  design:
    "Design",

  offer:
    "Offert",

  invoice:
    "Faktura",
};


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}


function getIcon(
  item:
    ProjectActivityItem
) {
  if (
    item.type ===
    "project_created"
  ) {
    return BriefcaseBusiness;
  }

  if (
    item.type ===
    "task_done"
  ) {
    return CheckCircle2;
  }

  if (
    item.category ===
    "task"
  ) {
    return ListChecks;
  }

  if (
    item.category ===
    "file"
  ) {
    return UploadCloud;
  }

  if (
    item.type ===
    "design_published"
  ) {
    return Send;
  }

  if (
    item.category ===
    "design"
  ) {
    return Palette;
  }

  if (
    item.category ===
    "offer"
  ) {
    return FileText;
  }

  if (
    item.type ===
    "invoice_paid"
  ) {
    return CircleDollarSign;
  }

  if (
    item.category ===
    "invoice"
  ) {
    return ReceiptText;
  }

  return Activity;
}


export default function ProjectActivityClient({
  items,
}: Props) {
  const [
    filter,
    setFilter,
  ] =
    useState("all");

  const [
    search,
    setSearch,
  ] =
    useState("");


  const visibleItems =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return items.filter(
          (item) => {
            if (
              filter !==
                "all" &&
              item.category !==
                filter
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            return [
              item.title,
              item.description,
              item.actor,
              categoryLabels[
                item.category
              ],
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);
          }
        );
      },
      [
        items,
        filter,
        search,
      ]
    );


  const today =
    new Date();

  const sevenDaysAgo =
    new Date();

  sevenDaysAgo.setDate(
    today.getDate() -
    7
  );


  const lastSevenDays =
    items.filter(
      (item) =>
        new Date(
          item.timestamp
        ) >=
        sevenDaysAgo
    ).length;


  const designCount =
    items.filter(
      (item) =>
        item.category ===
        "design"
    ).length;


  const economyCount =
    items.filter(
      (item) =>
        item.category ===
          "offer" ||
        item.category ===
          "invoice"
    ).length;


  return (
    <div className={styles.workspace}>
      <section className={styles.stats}>
        <article>
          <span>
            <Activity size={20} />
          </span>

          <div>
            <small>
              Totalt
            </small>

            <strong>
              {items.length}
            </strong>

            <p>
              händelser
            </p>
          </div>
        </article>

        <article>
          <span>
            <Activity size={20} />
          </span>

          <div>
            <small>
              Senaste 7 dagarna
            </small>

            <strong>
              {lastSevenDays}
            </strong>

            <p>
              händelser
            </p>
          </div>
        </article>

        <article>
          <span>
            <Palette size={20} />
          </span>

          <div>
            <small>
              Design
            </small>

            <strong>
              {designCount}
            </strong>

            <p>
              aktiviteter
            </p>
          </div>
        </article>

        <article>
          <span>
            <CircleDollarSign
              size={20}
            />
          </span>

          <div>
            <small>
              Ekonomi
            </small>

            <strong>
              {economyCount}
            </strong>

            <p>
              aktiviteter
            </p>
          </div>
        </article>
      </section>


      <section className={styles.toolbar}>
        <div>
          <span>
            Projekthistorik
          </span>

          <h2>
            Aktivitet
          </h2>

          <p>
            Följ vad som har hänt i
            projektet och när det hände.
          </p>
        </div>

        <label className={styles.search}>
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Sök i aktivitet..."
          />
        </label>
      </section>


      <section className={styles.activityCard}>
        <div className={styles.filters}>
          {filters.map(
            (item) => {
              const count =
                item.key === "all"
                  ? items.length
                  : items.filter(
                      (activity) =>
                        activity.category ===
                        item.key
                    ).length;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={
                    filter ===
                    item.key
                      ? styles.activeFilter
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      item.key
                    )
                  }
                >
                  {item.label}

                  <span>
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>


        {visibleItems.length === 0 ? (
          <div className={styles.empty}>
            <span>
              <Activity
                size={28}
              />
            </span>

            <h3>
              Ingen aktivitet hittades
            </h3>

            <p>
              Det finns inga händelser
              som matchar filtret eller
              sökningen.
            </p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {visibleItems.map(
              (
                item,
                index
              ) => {
                const Icon =
                  getIcon(item);

                return (
                  <article
                    key={item.id}
                    className={
                      styles.timelineItem
                    }
                  >
                    <div className={styles.timelineRail}>
                      <span
                        className={`${styles.icon} ${
                          styles[
                            `category_${item.category}`
                          ]
                        }`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.8}
                        />
                      </span>

                      {index <
                        visibleItems.length -
                          1 && (
                        <i />
                      )}
                    </div>

                    <div className={styles.event}>
                      <div className={styles.eventTop}>
                        <div>
                          <span
                            className={
                              styles.category
                            }
                          >
                            {
                              categoryLabels[
                                item.category
                              ]
                            }
                          </span>

                          <h3>
                            {item.title}
                          </h3>
                        </div>

                        <time>
                          {formatDate(
                            item.timestamp
                          )}
                        </time>
                      </div>

                      {item.description && (
                        <p>
                          {
                            item.description
                          }
                        </p>
                      )}

                      {item.actor && (
                        <div
                          className={
                            styles.actor
                          }
                        >
                          <span>
                            {item.actor
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map(
                                (part) =>
                                  part[0]
                              )
                              .join("")
                              .toUpperCase()}
                          </span>

                          <small>
                            Utförd av
                          </small>

                          <strong>
                            {item.actor}
                          </strong>
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}