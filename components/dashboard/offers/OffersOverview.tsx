"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Download,
  Eye,
  FileCheck2,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";

import type {
  OfferListItem,
  OfferListStatus,
  OffersPageData,
} from "@/lib/dashboard/offers/offer-types";

import styles from "./OffersOverview.module.css";

type OffersOverviewProps = {
  data: OffersPageData;
  initialSearch: string;
};

const PAGE_SIZE = 10;

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

const statusLabels: Record<
  OfferListStatus,
  string
> = {
  draft: "Utkast",
  sent: "Skickad",
  viewed: "Öppnad",
  answered: "Besvarad",
  accepted: "Vunnen",
  declined: "Avböjd",
  expired: "Utgången",
  archived: "Arkiverad",
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function matchesStatusGroup(
  offer: OfferListItem,
  filter: string
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "sent") {
    return [
      "sent",
      "viewed",
    ].includes(offer.status);
  }

  if (filter === "answered") {
    return offer.status === "answered";
  }

  if (filter === "accepted") {
    return offer.status === "accepted";
  }

  if (filter === "declined") {
    return offer.status === "declined";
  }

  if (filter === "archived") {
    return offer.status === "archived";
  }

  if (filter === "draft") {
    return offer.status === "draft";
  }

  return offer.status === filter;
}

export default function OffersOverview({
  data,
  initialSearch,
}: OffersOverviewProps) {
  const [search, setSearch] =
    useState(initialSearch);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    customerFilter,
    setCustomerFilter,
  ] = useState("all");

  const [
    projectFilter,
    setProjectFilter,
  ] = useState("all");

  const [minimumAmount, setMinimumAmount] =
    useState("");

  const [maximumAmount, setMaximumAmount] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("newest");

  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    customerFilter,
    projectFilter,
    minimumAmount,
    maximumAmount,
    sortOrder,
  ]);

  const answeredCount =
    data.offers.filter(
      (offer) =>
        offer.status === "answered"
    ).length;

  const sentCount =
    data.offers.filter((offer) =>
      [
        "sent",
        "viewed",
      ].includes(offer.status)
    ).length;

  const filteredOffers = useMemo(() => {
    const cleanSearch =
      search.trim().toLowerCase();

    const minimum = Number(
      minimumAmount || 0
    );

    const maximum = maximumAmount
      ? Number(maximumAmount)
      : Number.POSITIVE_INFINITY;

    const filtered = data.offers.filter(
      (offer) => {
        if (
          !matchesStatusGroup(
            offer,
            statusFilter
          )
        ) {
          return false;
        }

        if (
          customerFilter !== "all" &&
          offer.customerId !==
            customerFilter
        ) {
          return false;
        }

        if (
          projectFilter !== "all" &&
          offer.projectId !== projectFilter
        ) {
          return false;
        }

        if (
          offer.totalIncVat < minimum ||
          offer.totalIncVat > maximum
        ) {
          return false;
        }

        if (!cleanSearch) {
          return true;
        }

        const searchable = [
          offer.offerNumber,
          offer.customerName,
          offer.projectTitle,
          offer.title,
          statusLabels[offer.status],
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(
          cleanSearch
        );
      }
    );

    return [...filtered].sort(
      (first, second) => {
        if (sortOrder === "oldest") {
          return (
            new Date(
              first.sentAt ??
                first.createdAt ??
                0
            ).getTime() -
            new Date(
              second.sentAt ??
                second.createdAt ??
                0
            ).getTime()
          );
        }

        if (sortOrder === "amount_high") {
          return (
            second.totalIncVat -
            first.totalIncVat
          );
        }

        if (sortOrder === "amount_low") {
          return (
            first.totalIncVat -
            second.totalIncVat
          );
        }

        return (
          new Date(
            second.sentAt ??
              second.createdAt ??
              0
          ).getTime() -
          new Date(
            first.sentAt ??
              first.createdAt ??
              0
          ).getTime()
        );
      }
    );
  }, [
    data.offers,
    search,
    statusFilter,
    customerFilter,
    projectFilter,
    minimumAmount,
    maximumAmount,
    sortOrder,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      filteredOffers.length / PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    pageCount
  );

  const visibleOffers =
    filteredOffers.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCustomerFilter("all");
    setProjectFilter("all");
    setMinimumAmount("");
    setMaximumAmount("");
    setSortOrder("newest");
    setPage(1);
  }

  const statCards = [
    {
      label: "Skickade",
      value: sentCount,
      subtitle: "Aktiva offerter",
      icon: Send,
      className: styles.statSent,
    },
    {
      label: "Besvarade",
      value: answeredCount,
      subtitle: "Kunden har svarat",
      icon: FileCheck2,
      className:
        styles.statAnswered,
    },
    {
      label: "Vunna",
      value: data.stats.accepted,
      subtitle: "Accepterade offerter",
      icon: CheckCircle2,
      className:
        styles.statAccepted,
    },
    {
      label: "Avböjda",
      value: data.stats.declined,
      subtitle: "Ej accepterade",
      icon: CircleX,
      className:
        styles.statDeclined,
    },
    {
      label: "Arkiverade",
      value: data.stats.archived,
      subtitle: "Totalt arkiverade",
      icon: Archive,
      className:
        styles.statArchived,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>
            Offerter / Översikt
          </span>

          <p>
            {data.stats.total} offerter finns
            registrerade.
          </p>
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.exportButton}
            disabled
            title="Exportfunktionen byggs senare"
          >
            <Download size={17} />
            Exportera
          </button>

          <Link
            href="/dashboard/offerter/ny"
            className={styles.createButton}
          >
            <Plus size={18} />
            Skapa ny offert
          </Link>
        </div>
      </div>

      <section className={styles.stats}>
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className={card.className}
            >
              <span className={styles.statIcon}>
                <Icon size={23} />
              </span>

              <div>
                <small>{card.label}</small>
                <strong>{card.value}</strong>
                <span>
                  {card.subtitle}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.offersCard}>
          <header className={styles.cardHeader}>
            <div>
              <h2>Alla offerter</h2>

              <p>
                Sök och följ upp företagets
                offerter.
              </p>
            </div>

            <form
              className={styles.search}
              onSubmit={handleSearch}
            >
              <Search size={17} />

              <input
                type="search"
                value={search}
                placeholder="Sök offert..."
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </form>
          </header>

          <div className={styles.statusTabs}>
            {[
              ["all", "Alla"],
              ["draft", "Utkast"],
              ["sent", "Skickade"],
              ["answered", "Besvarade"],
              ["accepted", "Vunna"],
              ["declined", "Avböjda"],
              ["archived", "Arkiverade"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  statusFilter === value
                    ? styles.activeTab
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

          {visibleOffers.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={38} />

              <strong>
                Inga offerter hittades
              </strong>

              <span>
                Skapa den första offerten
                eller ändra dina filter.
              </span>

              <Link href="/dashboard/offerter/ny">
                <Plus size={16} />
                Skapa ny offert
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Offertnummer</th>
                      <th>Kund</th>
                      <th>Projekt / typ</th>
                      <th>Skickad</th>
                      <th>Giltig t.o.m.</th>
                      <th>Belopp</th>
                      <th>Status</th>
                      <th>Åtgärder</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleOffers.map(
                      (offer) => (
                        <tr key={offer.id}>
                          <td>
                            <strong
                              className={
                                styles.offerNumber
                              }
                            >
                              {offer.offerNumber}
                            </strong>
                          </td>

                          <td>
                            <div
                              className={
                                styles.customerCell
                              }
                            >
                              <strong>
                                {offer.customerName}
                              </strong>

                              <span>
                                {offer.customerId
                                  ? "Registrerad kund"
                                  : "Fristående kund"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div
                              className={
                                styles.projectCell
                              }
                            >
                              <strong>
                                {offer.projectTitle}
                              </strong>

                              <span>
                                {offer.title}
                              </span>
                            </div>
                          </td>

                          <td>
                            {formatDate(
                              offer.sentAt
                            )}
                          </td>

                          <td>
                            {formatDate(
                              offer.validUntil
                            )}
                          </td>

                          <td>
                            <strong
                              className={
                                styles.amount
                              }
                            >
                              {currencyFormatter.format(
                                offer.totalIncVat
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={[
                                styles.status,
                                styles[
                                  `status_${offer.status}`
                                ] ?? "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {statusLabels[
                                offer.status
                              ]}
                            </span>
                          </td>

                          <td>
                            <div
                              className={
                                styles.rowActions
                              }
                            >
                              <button
                                type="button"
                                disabled
                                title="Offertdetaljen byggs senare"
                                aria-label="Visa offert"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                type="button"
                                disabled
                                title="Redigering byggs senare"
                                aria-label="Redigera offert"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                disabled
                                title="Fler åtgärder byggs senare"
                                aria-label="Fler åtgärder"
                              >
                                <MoreHorizontal
                                  size={16}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.mobileList}>
                {visibleOffers.map(
                  (offer) => (
                    <article
                      key={offer.id}
                      className={
                        styles.mobileCard
                      }
                    >
                      <div
                        className={
                          styles.mobileHeader
                        }
                      >
                        <div>
                          <strong>
                            {offer.offerNumber}
                          </strong>

                          <span>
                            {offer.customerName}
                          </span>
                        </div>

                        <span
                          className={[
                            styles.status,
                            styles[
                              `status_${offer.status}`
                            ] ?? "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {
                            statusLabels[
                              offer.status
                            ]
                          }
                        </span>
                      </div>

                      <dl>
                        <div>
                          <dt>Projekt</dt>
                          <dd>
                            {offer.projectTitle}
                          </dd>
                        </div>

                        <div>
                          <dt>Belopp</dt>
                          <dd>
                            {currencyFormatter.format(
                              offer.totalIncVat
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>Skickad</dt>
                          <dd>
                            {formatDate(
                              offer.sentAt
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>Giltig till</dt>
                          <dd>
                            {formatDate(
                              offer.validUntil
                            )}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  )
                )}
              </div>
            </>
          )}

          <footer className={styles.pagination}>
            <span>
              Visar{" "}
              {filteredOffers.length === 0
                ? 0
                : (safePage - 1) *
                    PAGE_SIZE +
                  1}
              –
              {Math.min(
                safePage * PAGE_SIZE,
                filteredOffers.length
              )}{" "}
              av {filteredOffers.length}
              offerter
            </span>

            <div>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setPage(
                    Math.max(
                      safePage - 1,
                      1
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
                      safePage + 1,
                      pageCount
                    )
                  )
                }
                aria-label="Nästa sida"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </section>

        <aside className={styles.filterCard}>
          <div className={styles.filterHeader}>
            <SlidersHorizontal size={19} />

            <div>
              <h2>Filter</h2>
              <p>Förfina offertlistan</p>
            </div>
          </div>

          <label className={styles.field}>
            <span>Status</span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Alla statusar
              </option>
              <option value="draft">
                Utkast
              </option>
              <option value="sent">
                Skickade
              </option>
              <option value="answered">
                Besvarade
              </option>
              <option value="accepted">
                Vunna
              </option>
              <option value="declined">
                Avböjda
              </option>
              <option value="archived">
                Arkiverade
              </option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Kund</span>

            <select
              value={customerFilter}
              onChange={(event) =>
                setCustomerFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Alla kunder
              </option>

              {data.customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label className={styles.field}>
            <span>Projekt / typ</span>

            <select
              value={projectFilter}
              onChange={(event) =>
                setProjectFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Alla projekt
              </option>

              {data.projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.title}
                  </option>
                )
              )}
            </select>
          </label>

          <div className={styles.amountFields}>
            <label className={styles.field}>
              <span>Belopp från</span>

              <input
                type="number"
                min="0"
                value={minimumAmount}
                placeholder="0"
                onChange={(event) =>
                  setMinimumAmount(
                    event.target.value
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Belopp till</span>

              <input
                type="number"
                min="0"
                value={maximumAmount}
                placeholder="Valfritt"
                onChange={(event) =>
                  setMaximumAmount(
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Sortera efter</span>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value
                )
              }
            >
              <option value="newest">
                Senast skapad
              </option>
              <option value="oldest">
                Äldst först
              </option>
              <option value="amount_high">
                Högst belopp
              </option>
              <option value="amount_low">
                Lägst belopp
              </option>
            </select>
          </label>

          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setPage(1)}
          >
            <SlidersHorizontal size={16} />
            Filtrera
          </button>

          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Rensa filter
          </button>
        </aside>
      </div>
    </div>
  );
}
