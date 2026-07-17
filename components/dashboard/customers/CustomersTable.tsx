"use client";

import Link from "next/link";
import type {
  CSSProperties,
  FormEvent,
} from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  Lightbulb,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type {
  CustomerListItem,
  CustomerListStats,
} from "@/lib/dashboard/customers/customer-types";

import styles from "./CustomersTable.module.css";

type CustomersTableProps = {
  customers: CustomerListItem[];
  stats: CustomerListStats;
  initialSearch: string;
};

const PAGE_SIZE = 8;

const statusLabels: Record<string, string> = {
  prospect: "Prospekt",
  active: "Aktiv",
  former: "Tidigare",
  inactive: "Inaktiv",
};

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

function getPrimaryContact(
  customer: CustomerListItem
) {
  return (
    customer.contacts.find(
      (contact) => contact.isPrimary
    ) ??
    customer.contacts[0] ??
    null
  );
}

function getPercentage(
  value: number,
  total: number
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100
  );
}

export default function CustomersTable({
  customers,
  stats,
  initialSearch,
}: CustomersTableProps) {
  const router = useRouter();

  const [search, setSearch] =
    useState(initialSearch);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    typeFilter,
  ]);

  const statusCounts = useMemo(
    () => ({
      active: customers.filter(
        (customer) =>
          customer.status === "active"
      ).length,

      prospect: customers.filter(
        (customer) =>
          customer.status === "prospect"
      ).length,

      former: customers.filter(
        (customer) =>
          customer.status === "former"
      ).length,

      inactive: customers.filter(
        (customer) =>
          customer.status === "inactive"
      ).length,
    }),
    [customers]
  );

  const latestCustomers = useMemo(
    () =>
      [...customers]
        .sort((first, second) =>
          second.customerNumber.localeCompare(
            first.customerNumber,
            "sv",
            {
              numeric: true,
            }
          )
        )
        .slice(0, 3),
    [customers]
  );

  const filteredCustomers = useMemo(
    () => {
      const cleanSearch =
        search.trim().toLowerCase();

      return customers.filter(
        (customer) => {
          if (
            statusFilter !== "all" &&
            customer.status !== statusFilter
          ) {
            return false;
          }

          if (
            typeFilter !== "all" &&
            customer.customerType !==
              typeFilter
          ) {
            return false;
          }

          if (!cleanSearch) {
            return true;
          }

          const contactValues =
            customer.contacts
              .map((contact) =>
                [
                  contact.fullName,
                  contact.email ?? "",
                  contact.phone ?? "",
                ].join(" ")
              )
              .join(" ");

          const searchable = [
            customer.name,
            customer.customerNumber,
            customer.email ?? "",
            customer.phone ?? "",
            contactValues,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            cleanSearch
          );
        }
      );
    },
    [
      customers,
      search,
      statusFilter,
      typeFilter,
    ]
  );

  const pageCount = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    pageCount
  );

  const visibleCustomers =
    filteredCustomers.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );

  const totalCustomers =
    Math.max(customers.length, 1);

  const activeAngle =
    (statusCounts.active /
      totalCustomers) *
    360;

  const prospectAngle =
    activeAngle +
    (statusCounts.prospect /
      totalCustomers) *
      360;

  const formerAngle =
    prospectAngle +
    (statusCounts.former /
      totalCustomers) *
      360;

  const donutStyle: CSSProperties = {
    background: customers.length
      ? `conic-gradient(
          #3fd4a8 0deg ${activeAngle}deg,
          #f4aa32 ${activeAngle}deg ${prospectAngle}deg,
          #3289f5 ${prospectAngle}deg ${formerAngle}deg,
          #53616d ${formerAngle}deg 360deg
        )`
      : "#24343d",
  };

  function submitSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parameters =
      new URLSearchParams();

    const cleanSearch =
      search.trim();

    if (cleanSearch) {
      parameters.set(
        "search",
        cleanSearch
      );
    }

    router.push(
      `/dashboard/kunder${
        parameters.toString()
          ? `?${parameters.toString()}`
          : ""
      }`
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageToolbar}>
        <div className={styles.customerTabs}>
          {[
            ["all", "Alla kunder"],
            ["active", "Aktiva kunder"],
            ["prospect", "Prospekt"],
            ["former", "Tidigare kunder"],
            ["inactive", "Inaktiva"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                statusFilter === value
                  ? styles.activeCustomerTab
                  : ""
              }
              onClick={() =>
                setStatusFilter(value)
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.importButton}
            disabled
            title="Importfunktionen byggs senare"
          >
            <Download size={17} />
            Importera kunder
          </button>

          <Link
            href="/dashboard/kunder/ny"
            className={styles.createButton}
          >
            <Plus size={18} />
            Skapa ny kund
          </Link>
        </div>
      </div>

      <section className={styles.stats}>
        <article>
          <span className={styles.statIcon}>
            <UsersRound size={22} />
          </span>

          <div>
            <small>Totalt kunder</small>
            <strong>{stats.total}</strong>
            <span>
              Registrerade i CRM
            </span>
          </div>
        </article>

        <article>
          <span className={styles.statIcon}>
            <Building2 size={22} />
          </span>

          <div>
            <small>Aktiva kunder</small>
            <strong>{stats.active}</strong>
            <span>
              Pågående kundrelationer
            </span>
          </div>
        </article>

        <article>
          <span className={styles.statIcon}>
            <FileText size={22} />
          </span>

          <div>
            <small>Prospekt</small>
            <strong>
              {stats.prospects}
            </strong>
            <span>
              Möjliga nya kunder
            </span>
          </div>
        </article>

        <article>
          <span className={styles.statIcon}>
            <CircleDollarSign size={22} />
          </span>

          <div>
            <small>Kundfördelning</small>
            <strong>
              {stats.companies} /{" "}
              {stats.privateCustomers}
            </strong>
            <span>
              Företag / privatpersoner
            </span>
          </div>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.customerCard}>
          <div className={styles.filters}>
            <form
              className={styles.search}
              onSubmit={submitSearch}
            >
              <Search size={18} />

              <input
                type="search"
                value={search}
                placeholder="Sök kund, företag eller kontaktperson..."
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </form>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
              aria-label="Filtrera kundtyp"
            >
              <option value="all">
                Alla kundkategorier
              </option>

              <option value="company">
                Företag
              </option>

              <option value="private">
                Privatpersoner
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Filtrera status"
            >
              <option value="all">
                Alla statusar
              </option>

              <option value="active">
                Aktiva
              </option>

              <option value="prospect">
                Prospekt
              </option>

              <option value="former">
                Tidigare
              </option>

              <option value="inactive">
                Inaktiva
              </option>
            </select>
          </div>

          {visibleCustomers.length === 0 ? (
            <div className={styles.emptyState}>
              <UsersRound size={36} />

              <strong>
                Inga kunder hittades
              </strong>

              <span>
                Skapa den första kunden eller
                ändra sökningen.
              </span>

              <Link href="/dashboard/kunder/ny">
                <Plus size={16} />
                Skapa ny kund
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Kund / företag</th>
                      <th>Kontaktperson</th>
                      <th>E-post</th>
                      <th>Telefon</th>
                      <th>Kundkategori</th>
                      <th>Status</th>
                      <th>Senaste aktivitet</th>
                      <th aria-label="Åtgärder" />
                    </tr>
                  </thead>

                  <tbody>
                    {visibleCustomers.map(
                      (customer) => {
                        const primaryContact =
                          getPrimaryContact(
                            customer
                          );

                        const contactName =
                          customer.customerType ===
                          "private"
                            ? "Kunden själv"
                            : primaryContact?.fullName ||
                              "Ingen kontaktperson";

                        const email =
                          primaryContact?.email ||
                          customer.email ||
                          "Ingen e-post";

                        const phone =
                          primaryContact?.phone ||
                          customer.phone ||
                          "Inget telefonnummer";

                        return (
                          <tr key={customer.id}>
                            <td>
                              <div
                                className={
                                  styles.customer
                                }
                              >
                                <span
                                  className={
                                    styles.avatar
                                  }
                                >
                                  {getInitials(
                                    customer.name
                                  )}
                                </span>

                                <div>
                                  <strong>
                                    {customer.name}
                                  </strong>

                                  <span>
                                    {customer.customerNumber ||
                                      "Kundnummer saknas"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div
                                className={
                                  styles.contact
                                }
                              >
                                <strong>
                                  {contactName}
                                </strong>

                                <span>
                                  {primaryContact?.jobTitle ||
                                    (customer.customerType ===
                                    "private"
                                      ? "Privatkund"
                                      : "Titel saknas")}
                                </span>
                              </div>
                            </td>

                            <td>{email}</td>

                            <td>{phone}</td>

                            <td>
                              <span
                                className={
                                  styles.typeBadge
                                }
                              >
                                {customer.customerType ===
                                "company" ? (
                                  <Building2
                                    size={13}
                                  />
                                ) : (
                                  <UserRound
                                    size={13}
                                  />
                                )}

                                {customer.customerType ===
                                "company"
                                  ? "Företag"
                                  : "Privatperson"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={[
                                  styles.status,
                                  styles[
                                    `status_${customer.status}`
                                  ] ?? "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                <i />

                                {statusLabels[
                                  customer.status
                                ] ||
                                  customer.status}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  styles.activity
                                }
                              >
                                Ingen aktivitet ännu
                              </span>
                            </td>

                            <td>
                              <Link
                                href={`/dashboard/kunder/${customer.id}`}
                                className={
                                  styles.openButton
                                }
                                aria-label={`Öppna ${customer.name}`}
                              >
                                <Eye size={17} />
                              </Link>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.mobileList}>
                {visibleCustomers.map(
                  (customer) => {
                    const primaryContact =
                      getPrimaryContact(
                        customer
                      );

                    return (
                      <article
                        key={customer.id}
                        className={
                          styles.mobileCard
                        }
                      >
                        <div
                          className={
                            styles.mobileHeader
                          }
                        >
                          <span
                            className={
                              styles.avatar
                            }
                          >
                            {getInitials(
                              customer.name
                            )}
                          </span>

                          <div>
                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              {customer.customerNumber ||
                                "Kundnummer saknas"}
                            </span>
                          </div>
                        </div>

                        <dl>
                          <div>
                            <dt>Kundtyp</dt>
                            <dd>
                              {customer.customerType ===
                              "company"
                                ? "Företag"
                                : "Privatperson"}
                            </dd>
                          </div>

                          <div>
                            <dt>Status</dt>
                            <dd>
                              {statusLabels[
                                customer.status
                              ] ||
                                customer.status}
                            </dd>
                          </div>

                          <div>
                            <dt>Kontakt</dt>
                            <dd>
                              {primaryContact?.fullName ||
                                customer.email ||
                                "Ej angivet"}
                            </dd>
                          </div>

                          <div>
                            <dt>Telefon</dt>
                            <dd>
                              {primaryContact?.phone ||
                                customer.phone ||
                                "Ej angivet"}
                            </dd>
                          </div>
                        </dl>

                        <Link
                          href={`/dashboard/kunder/${customer.id}`}
                          className={
                            styles.mobileOpenButton
                          }
                        >
                          Öppna kund
                        </Link>
                      </article>
                    );
                  }
                )}
              </div>
            </>
          )}

          <div className={styles.pagination}>
            <span>
              Visar{" "}
              {filteredCustomers.length === 0
                ? 0
                : (safePage - 1) *
                    PAGE_SIZE +
                  1}
              –
              {Math.min(
                safePage * PAGE_SIZE,
                filteredCustomers.length
              )}{" "}
              av {filteredCustomers.length} kunder
            </span>

            <div>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setPage(
                    Math.max(
                      1,
                      safePage - 1
                    )
                  )
                }
                aria-label="Föregående sida"
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                {safePage} / {pageCount}
              </span>

              <button
                type="button"
                disabled={
                  safePage >= pageCount
                }
                onClick={() =>
                  setPage(
                    Math.min(
                      pageCount,
                      safePage + 1
                    )
                  )
                }
                aria-label="Nästa sida"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.rightRail}>
          <section className={styles.sideCard}>
            <div className={styles.sideHeader}>
              <h3>Kundöversikt</h3>
              <span>Realtid</span>
            </div>

            <div className={styles.overviewContent}>
              <div
                className={styles.donut}
                style={donutStyle}
              >
                <div>
                  <strong>
                    {customers.length}
                  </strong>
                  <span>Totalt</span>
                </div>
              </div>

              <div className={styles.legend}>
                {[
                  {
                    key: "active",
                    label: "Aktiva",
                    value:
                      statusCounts.active,
                  },
                  {
                    key: "prospect",
                    label: "Prospekt",
                    value:
                      statusCounts.prospect,
                  },
                  {
                    key: "former",
                    label: "Tidigare",
                    value:
                      statusCounts.former,
                  },
                  {
                    key: "inactive",
                    label: "Inaktiva",
                    value:
                      statusCounts.inactive,
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <span>
                      <i
                        className={
                          styles[
                            `legend_${item.key}`
                          ]
                        }
                      />

                      {item.label}
                    </span>

                    <strong>
                      {item.value} (
                      {getPercentage(
                        item.value,
                        customers.length
                      )}
                      %)
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.sideCard}>
            <div className={styles.sideHeader}>
              <h3>Nya kunder</h3>
              <span>
                {latestCustomers.length}
              </span>
            </div>

            {latestCustomers.length === 0 ? (
              <p className={styles.sideEmpty}>
                Inga kunder registrerade.
              </p>
            ) : (
              <div className={styles.latestList}>
                {latestCustomers.map(
                  (customer) => (
                    <div key={customer.id}>
                      <span
                        className={
                          styles.smallAvatar
                        }
                      >
                        {getInitials(
                          customer.name
                        )}
                      </span>

                      <div>
                        <strong>
                          {customer.name}
                        </strong>

                        <span>
                          {customer.customerNumber ||
                            "Ny kund"}
                        </span>
                      </div>

                      <em>Ny</em>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          <section className={styles.sideCard}>
            <div className={styles.sideHeader}>
              <h3>Senaste aktiviteter</h3>
            </div>

            <div className={styles.activityEmpty}>
              <FileText size={25} />

              <strong>
                Ingen aktivitet ännu
              </strong>

              <span>
                Kundmöten, offerter och
                projekt visas här när
                kundkortet är färdigt.
              </span>
            </div>
          </section>

          <section className={styles.tipCard}>
            <span>
              <Lightbulb size={23} />
            </span>

            <div>
              <strong>Tips!</strong>

              <p>
                Lägg till fullständiga
                kontakt- och fakturauppgifter
                för att förenkla framtida
                offerter.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

