"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  Users,
} from "lucide-react";
import type { ProjectCustomerOption } from "@/lib/dashboard/projects/project-types";
import styles from "./ProjectFilters.module.css";

type ProjectFiltersProps = {
  customers: ProjectCustomerOption[];
};

const tabs = [
  {
    label: "Alla projekt",
    value: "all",
  },
  {
    label: "Pågående",
    value: "ongoing",
  },
  {
    label: "Väntar på kund",
    value: "waiting_customer",
  },
  {
    label: "Klara",
    value: "completed",
  },
  {
    label: "Pausade",
    value: "paused",
  },
  {
    label: "Arkiverade",
    value: "archived",
  },
];

const extraFilters = [
  {
    label: "Planering",
    value: "planning",
  },
  {
    label: "I produktion",
    value: "production",
  },
  {
    label: "Avbrutna",
    value: "cancelled",
  },
];

export default function ProjectFilters({
  customers,
}: ProjectFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStatus =
    searchParams.get("status") || "all";

  const activeCustomer =
    searchParams.get("customer") || "";

  const activeSort =
    searchParams.get("sort") ||
    "updated_desc";

  function updateParameter(
    name: string,
    value: string
  ) {
    const parameters =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      !value ||
      value === "all" ||
      value === "updated_desc"
    ) {
      parameters.delete(name);
    } else {
      parameters.set(name, value);
    }

    parameters.set("page", "1");

    const queryString =
      parameters.toString();

    router.push(
      `${pathname}${
        queryString
          ? `?${queryString}`
          : ""
      }`,
      {
        scroll: false,
      }
    );
  }

  return (
    <section
      className={styles.section}
      aria-label="Projektfilter"
    >
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Projektstatus"
      >
        {tabs.map((tab) => {
          const active =
            activeStatus === tab.value;

          return (
            <button
              type="button"
              key={tab.value}
              className={`${styles.tab} ${
                active
                  ? styles.activeTab
                  : ""
              }`}
              onClick={() =>
                updateParameter(
                  "status",
                  tab.value
                )
              }
              role="tab"
              aria-selected={active}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={styles.controls}>
        <label className={styles.selectBox}>
          <Users
            size={17}
            strokeWidth={1.7}
          />

          <select
            value={activeCustomer}
            onChange={(event) =>
              updateParameter(
                "customer",
                event.target.value
              )
            }
            aria-label="Filtrera efter kund"
          >
            <option value="">
              Alla kunder
            </option>

            {customers.map((customer) => (
              <option
                value={customer.id}
                key={customer.id}
              >
                {customer.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            strokeWidth={1.7}
          />
        </label>

        <details className={styles.filterMenu}>
          <summary>
            <Filter
              size={17}
              strokeWidth={1.7}
            />

            <span>Filter</span>

            <ChevronDown
              size={15}
              strokeWidth={1.7}
            />
          </summary>

          <div className={styles.filterPopover}>
            <span>Ytterligare status</span>

            {extraFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={
                  activeStatus ===
                  filter.value
                    ? styles.selectedFilter
                    : ""
                }
                onClick={(event) => {
                  updateParameter(
                    "status",
                    filter.value
                  );

                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </details>

        <label className={styles.selectBox}>
          <ArrowUpDown
            size={17}
            strokeWidth={1.7}
          />

          <select
            value={activeSort}
            onChange={(event) =>
              updateParameter(
                "sort",
                event.target.value
              )
            }
            aria-label="Sortera projekt"
          >
            <option value="updated_desc">
              Senast uppdaterad
            </option>

            <option value="updated_asc">
              Äldst uppdaterad
            </option>

            <option value="deadline_asc">
              Deadline först
            </option>

            <option value="deadline_desc">
              Deadline sist
            </option>

            <option value="title_asc">
              Projektnamn A–Ö
            </option>

            <option value="title_desc">
              Projektnamn Ö–A
            </option>
          </select>

          <ChevronDown
            size={15}
            strokeWidth={1.7}
          />
        </label>
      </div>
    </section>
  );
}
