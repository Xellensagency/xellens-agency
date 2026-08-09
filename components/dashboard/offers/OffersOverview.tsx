"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Search,
  Send,
  Trophy,
} from "lucide-react";

import type {
  OfferListItem,
  OfferListStatus,
  OffersPageData,
} from "@/lib/dashboard/offers/offer-types";

import styles from "./OffersOverview.module.css";


type Props = {
  data: OffersPageData;
  initialSearch: string;
};


const PAGE_SIZE = 8;


const currency =
  new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }
  );


const statusLabels:
Record<
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
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


function getStatusClass(
  status:
    OfferListStatus
) {
  switch (status) {
    case "accepted":
      return styles.statusAccepted;

    case "declined":
      return styles.statusDeclined;

    case "expired":
      return styles.statusExpired;

    case "archived":
      return styles.statusArchived;

    case "sent":
    case "viewed":
    case "answered":
      return styles.statusActive;

    default:
      return styles.statusDraft;
  }
}


function isActiveOffer(
  offer: OfferListItem
) {
  return [
    "sent",
    "viewed",
    "answered",
  ].includes(
    offer.status
  );
}


export default function OffersOverview({
  data,
  initialSearch,
}: Props) {
  const [
    search,
    setSearch,
  ] =
    useState(
      initialSearch
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    customerFilter,
    setCustomerFilter,
  ] =
    useState("all");

  const [
    projectFilter,
    setProjectFilter,
  ] =
    useState("all");

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState("newest");

  const [
    page,
    setPage,
  ] =
    useState(1);


  useEffect(() => {
    setSearch(
      initialSearch
    );
  }, [
    initialSearch,
  ]);


  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    customerFilter,
    projectFilter,
    sortOrder,
  ]);


  const drafts =
    data.offers.filter(
      (offer) =>
        offer.status ===
        "draft"
    );


  const activeOffers =
    data.offers.filter(
      isActiveOffer
    );


  const waiting =
    data.offers.filter(
      (offer) =>
        [
          "sent",
          "viewed",
        ].includes(
          offer.status
        )
    );


  const won =
    data.offers.filter(
      (offer) =>
        offer.status ===
        "accepted"
    );


  const wonValue =
    won.reduce(
      (
        total,
        offer
      ) =>
        total +
        offer.totalIncVat,
      0
    );


  const attention =
    useMemo(() => {
      const items: {
        id: string;
        type: "viewed" | "expiry";
        title: string;
        subtitle: string;
      }[] = [];

      const now =
        Date.now();

      for (
        const offer of
        data.offers
      ) {
        if (
          offer.status ===
          "viewed"
        ) {
          items.push({
            id:
              `viewed-${offer.id}`,

            type:
              "viewed",

            title:
              `${offer.offerNumber} har öppnats`,

            subtitle:
              `${offer.customerName} har sett offerten men ännu inte svarat.`,
          });
        }

        if (
          !isActiveOffer(
            offer
          ) ||
          !offer.validUntil
        ) {
          continue;
        }

        const deadline =
          new Date(
            offer.validUntil
          ).getTime();

        const days =
          Math.ceil(
            (
              deadline -
              now
            ) /
            86400000
          );

        if (
          days >= 0 &&
          days <= 7
        ) {
          items.push({
            id:
              `expiry-${offer.id}`,

            type:
              "expiry",

            title:
              days === 0
                ? `${offer.offerNumber} går ut idag`
                : `${offer.offerNumber} går ut om ${days} dagar`,

            subtitle:
              `${offer.customerName} · ${currency.format(
                offer.totalIncVat
              )}`,
          });
        }
      }

      return items.slice(
        0,
        4
      );
    }, [
      data.offers,
    ]);


  const filtered =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLowerCase();

      const result =
        data.offers.filter(
          (offer) => {
            if (
              statusFilter !==
                "all" &&
              offer.status !==
                statusFilter
            ) {
              return false;
            }

            if (
              customerFilter !==
                "all" &&
              offer.customerId !==
                customerFilter
            ) {
              return false;
            }

            if (
              projectFilter !==
                "all" &&
              offer.projectId !==
                projectFilter
            ) {
              return false;
            }

            if (!needle) {
              return true;
            }

            return [
              offer.offerNumber,
              offer.customerName,
              offer.projectTitle,
              offer.title,
              statusLabels[
                offer.status
              ],
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                needle
              );
          }
        );


      return [
        ...result,
      ].sort(
        (
          first,
          second
        ) => {
          if (
            sortOrder ===
            "oldest"
          ) {
            return (
              new Date(
                first.createdAt ??
                0
              ).getTime() -
              new Date(
                second.createdAt ??
                0
              ).getTime()
            );
          }

          if (
            sortOrder ===
            "amount_high"
          ) {
            return (
              second.totalIncVat -
              first.totalIncVat
            );
          }

          if (
            sortOrder ===
            "amount_low"
          ) {
            return (
              first.totalIncVat -
              second.totalIncVat
            );
          }

          return (
            new Date(
              second.createdAt ??
              0
            ).getTime() -
            new Date(
              first.createdAt ??
              0
            ).getTime()
          );
        }
      );
    }, [
      customerFilter,
      data.offers,
      projectFilter,
      search,
      sortOrder,
      statusFilter,
    ]);


  const pageCount =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
        PAGE_SIZE
      )
    );


  const safePage =
    Math.min(
      page,
      pageCount
    );


  const visible =
    filtered.slice(
      (
        safePage -
        1
      ) *
        PAGE_SIZE,
      safePage *
        PAGE_SIZE
    );


  return (
    <div
      className={
        styles.page
      }
    >
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            FÖRSÄLJNING & OFFERTER
          </span>

          <h1>
            Offerter
          </h1>

          <p>
            Skapa, skicka och följ
            affären från första
            offert till accepterat
            projekt.
          </p>
        </div>


        <Link
          href="/dashboard/offerter/ny"
          className={
            styles.primaryAction
          }
        >
          <Plus
            size={17}
          />

          Ny offert
        </Link>
      </header>


      <section
        className={
          styles.stats
        }
      >
        <article>
          <span
            className={
              styles.statIcon
            }
          >
            <FileText
              size={20}
            />
          </span>

          <div>
            <small>
              Utkast
            </small>

            <strong>
              {drafts.length}
            </strong>

            <p>
              offerter som inte
              skickats
            </p>
          </div>
        </article>


        <article>
          <span
            className={
              styles.statIcon
            }
          >
            <Send
              size={20}
            />
          </span>

          <div>
            <small>
              Aktiva offerter
            </small>

            <strong>
              {activeOffers.length}
            </strong>

            <p>
              skickade eller
              besvarade
            </p>
          </div>
        </article>


        <article>
          <span
            className={
              styles.statIcon
            }
          >
            <Clock3
              size={20}
            />
          </span>

          <div>
            <small>
              Väntar på svar
            </small>

            <strong>
              {waiting.length}
            </strong>

            <p>
              hos kund just nu
            </p>
          </div>
        </article>


        <article>
          <span
            className={
              styles.statIcon
            }
          >
            <Trophy
              size={20}
            />
          </span>

          <div>
            <small>
              Vunna
            </small>

            <strong>
              {won.length}
            </strong>

            <p>
              {currency.format(
                wonValue
              )}
              {" "}i totalt värde
            </p>
          </div>
        </article>
      </section>


      <section
        className={
          styles.focus
        }
      >
        <header>
          <div>
            <span>
              UPPFÖLJNING
            </span>

            <h2>
              Kräver din
              uppmärksamhet
            </h2>

            <p>
              Offerter som kan
              behöva följas upp.
            </p>
          </div>

          <strong>
            {attention.length}
          </strong>
        </header>


        {attention.length >
          0 ? (
          <div
            className={
              styles.attentionList
            }
          >
            {attention.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className={
                    styles.attentionItem
                  }
                >
                  <span>
                    {item.type ===
                    "expiry" ? (
                      <Clock3
                        size={17}
                      />
                    ) : (
                      <AlertCircle
                        size={17}
                      />
                    )}
                  </span>

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <p>
                      {
                        item.subtitle
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div
            className={
              styles.allGood
            }
          >
            <CheckCircle2
              size={19}
            />

            <div>
              <strong>
                Inget akut att
                följa upp
              </strong>

              <p>
                Det finns inga
                öppnade eller snart
                utgående offerter
                som kräver åtgärd.
              </p>
            </div>
          </div>
        )}
      </section>


      <section
        className={
          styles.offersPanel
        }
      >
        <header
          className={
            styles.panelHeader
          }
        >
          <div>
            <span>
              REGISTER
            </span>

            <h2>
              Alla offerter
            </h2>

            <p>
              {data.stats.total}
              {" "}offerter finns
              registrerade.
            </p>
          </div>

          <strong>
            {filtered.length}
            <small>
              {" "}visas
            </small>
          </strong>
        </header>


        <div
          className={
            styles.filters
          }
        >
          <label
            className={
              styles.search
            }
          >
            <Search
              size={17}
            />

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Sök offert, kund eller projekt..."
            />
          </label>


          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
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

            <option value="viewed">
              Öppnade
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

            <option value="expired">
              Utgångna
            </option>

            <option value="archived">
              Arkiverade
            </option>
          </select>


          <select
            value={
              customerFilter
            }
            onChange={(
              event
            ) =>
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
                  key={
                    customer.id
                  }
                  value={
                    customer.id
                  }
                >
                  {
                    customer.name
                  }
                </option>
              )
            )}
          </select>


          <select
            value={
              projectFilter
            }
            onChange={(
              event
            ) =>
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
                  key={
                    project.id
                  }
                  value={
                    project.id
                  }
                >
                  {
                    project.title
                  }
                </option>
              )
            )}
          </select>


          <select
            value={
              sortOrder
            }
            onChange={(
              event
            ) =>
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
        </div>


        {visible.length ===
          0 ? (
          <div
            className={
              styles.empty
            }
          >
            <FileText
              size={31}
            />

            <h3>
              Inga offerter
              hittades
            </h3>

            <p>
              Ändra filtreringen
              eller skapa din första
              offert.
            </p>

            <Link
              href="/dashboard/offerter/ny"
            >
              <Plus
                size={16}
              />

              Ny offert
            </Link>
          </div>
        ) : (
          <>
            <div
              className={
                styles.tableWrap
              }
            >
              <table>
                <thead>
                  <tr>
                    <th>
                      Offert
                    </th>

                    <th>
                      Kund
                    </th>

                    <th>
                      Belopp
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Skickad
                    </th>

                    <th>
                      Giltig t.o.m.
                    </th>

                    <th />
                  </tr>
                </thead>

                <tbody>
                  {visible.map(
                    (offer) => (
                      <tr
                        key={
                          offer.id
                        }
                      >
                        <td>
                          <div
                            className={
                              styles.offerCell
                            }
                          >
                            <strong>
                              {
                                offer.offerNumber
                              }
                            </strong>

                            <span>
                              {
                                offer.title
                              }
                            </span>

                            <small>
                              {
                                offer.projectTitle
                              }
                            </small>
                          </div>
                        </td>

                        <td>
                          <strong
                            className={
                              styles.customer
                            }
                          >
                            {
                              offer.customerName
                            }
                          </strong>
                        </td>

                        <td>
                          <div
                            className={
                              styles.amount
                            }
                          >
                            <strong>
                              {currency.format(
                                offer.totalIncVat
                              )}
                            </strong>

                            <small>
                              {currency.format(
                                offer.subtotalExVat
                              )}
                              {" "}exkl. moms
                            </small>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`${styles.status} ${getStatusClass(
                              offer.status
                            )}`}
                          >
                            {
                              statusLabels[
                                offer.status
                              ]
                            }
                          </span>
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
                          <Link
                            href={`/dashboard/offerter/${offer.id}`}
                            className={
                              styles.open
                            }
                          >
                            Öppna

                            <ArrowUpRight
                              size={15}
                            />
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>


            <div
              className={
                styles.mobileList
              }
            >
              {visible.map(
                (offer) => (
                  <article
                    key={
                      offer.id
                    }
                  >
                    <header>
                      <div>
                        <strong>
                          {
                            offer.offerNumber
                          }
                        </strong>

                        <span>
                          {
                            offer.customerName
                          }
                        </span>
                      </div>

                      <span
                        className={`${styles.status} ${getStatusClass(
                          offer.status
                        )}`}
                      >
                        {
                          statusLabels[
                            offer.status
                          ]
                        }
                      </span>
                    </header>

                    <h3>
                      {
                        offer.title
                      }
                    </h3>

                    <p>
                      {
                        offer.projectTitle
                      }
                    </p>

                    <div
                      className={
                        styles.mobileMeta
                      }
                    >
                      <span>
                        <small>
                          Belopp
                        </small>

                        <strong>
                          {currency.format(
                            offer.totalIncVat
                          )}
                        </strong>
                      </span>

                      <span>
                        <small>
                          Giltig till
                        </small>

                        <strong>
                          {formatDate(
                            offer.validUntil
                          )}
                        </strong>
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/offerter/${offer.id}`}
                    >
                      Öppna offert

                      <ArrowUpRight
                        size={15}
                      />
                    </Link>
                  </article>
                )
              )}
            </div>


            <footer
              className={
                styles.pagination
              }
            >
              <span>
                Visar{" "}
                {filtered.length ===
                0
                  ? 0
                  : (
                      safePage -
                      1
                    ) *
                      PAGE_SIZE +
                    1}
                –
                {Math.min(
                  safePage *
                    PAGE_SIZE,
                  filtered.length
                )}
                {" "}av{" "}
                {filtered.length}
              </span>

              <div>
                <button
                  type="button"
                  disabled={
                    safePage <= 1
                  }
                  onClick={() =>
                    setPage(
                      safePage -
                      1
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <strong>
                  {safePage}
                  {" / "}
                  {pageCount}
                </strong>

                <button
                  type="button"
                  disabled={
                    safePage >=
                    pageCount
                  }
                  onClick={() =>
                    setPage(
                      safePage +
                      1
                    )
                  }
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}