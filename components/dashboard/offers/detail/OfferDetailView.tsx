import Link from "next/link";

import {
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  ReceiptText,
  Send,
  UserRound,
} from "lucide-react";

import type {
  OfferDetailData,
  OfferDetailStatus,
} from "@/lib/dashboard/offers/get-offer-detail";

import OfferResponseCard from "./OfferResponseCard";
import OfferVersionsCard from "./OfferVersionsCard";

import styles from "./OfferDetailView.module.css";


type OfferDetailViewProps = {
  offer:
    OfferDetailData;
};


const statusLabels:
Record<
  OfferDetailStatus,
  string
> = {
  draft:
    "Utkast",

  sent:
    "Skickad",

  viewed:
    "Öppnad",

  answered:
    "Besvarad",

  accepted:
    "Accepterad",

  declined:
    "Avböjd",

  expired:
    "Utgången",

  archived:
    "Arkiverad",
};


function formatCurrency(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "Ej registrerat";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}


function statusClass(
  status:
    OfferDetailStatus
) {
  if (
    status ===
    "accepted"
  ) {
    return styles.statusAccepted;
  }

  if (
    status ===
    "declined"
  ) {
    return styles.statusDeclined;
  }

  if (
    status ===
    "expired"
  ) {
    return styles.statusExpired;
  }

  if (
    status ===
    "viewed" ||
    status ===
    "answered"
  ) {
    return styles.statusViewed;
  }

  if (
    status ===
    "sent"
  ) {
    return styles.statusSent;
  }

  return styles.statusDraft;
}


export default function OfferDetailView({
  offer,
}: OfferDetailViewProps) {
  const visibleLines =
    offer.lines.filter(
      (
        line
      ) =>
        line.customerVisible
    );

  const optionalLines =
    visibleLines.filter(
      (
        line
      ) =>
        line.isOptional
    );

  const baseLines =
    visibleLines.filter(
      (
        line
      ) =>
        !line.isOptional
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
          <Link
            href="/dashboard/offerter"
            className={
              styles.backLink
            }
          >
            <ArrowLeft
              size={16}
            />

            Offerter
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            FÖRSÄLJNING & OFFERTER
          </span>

          <div
            className={
              styles.titleRow
            }
          >
            <h1>
              {offer.offerNumber}
            </h1>

            <span
              className={[
                styles.status,
                statusClass(
                  offer.status
                ),
              ].join(" ")}
            >
              {
                statusLabels[
                  offer.status
                ]
              }
            </span>
          </div>

          <h2>
            {offer.title}
          </h2>

          {offer.description && (
            <p>
              {
                offer.description
              }
            </p>
          )}
        </div>


        <div
          className={
            styles.headerActions
          }
        >
          {offer.status ===
            "draft" && (
            <Link
              href={`/dashboard/offerter/${offer.id}/redigera`}
              className={
                styles.secondaryAction
              }
            >
              <FileText
                size={17}
              />

              Redigera
            </Link>
          )}

          <button
            type="button"
            className={
              styles.primaryAction
            }
            disabled
            title="Riktigt utskick kopplas i nästa steg"
          >
            <Send
              size={17}
            />

            {offer.status ===
            "draft"
              ? "Skicka offert"
              : "Skicka igen"}
          </button>
        </div>
      </header>


      <section
        className={
          styles.stats
        }
      >
        <article>
          <span>
            <ReceiptText
              size={18}
            />
          </span>

          <div>
            <small>
              OFFERTVÄRDE
            </small>

            <strong>
              {formatCurrency(
                offer.totalIncVat,
                offer.currency
              )}
            </strong>

            <p>
              inkl. moms
            </p>
          </div>
        </article>


        <article>
          <span>
            <UserRound
              size={18}
            />
          </span>

          <div>
            <small>
              KUND
            </small>

            <strong>
              {
                offer.customerName
              }
            </strong>

            <p>
              {offer.contactName ||
                offer.customerEmail ||
                "Ingen kontakt angiven"}
            </p>
          </div>
        </article>


        <article>
          <span>
            <CalendarDays
              size={18}
            />
          </span>

          <div>
            <small>
              GILTIGHET
            </small>

            <strong>
              {offer.validUntil
                ? formatDate(
                    offer.validUntil
                  )
                : `${offer.validDays} dagar`}
            </strong>

            <p>
              {offer.status ===
              "draft"
                ? "räknas från utskick"
                : "offertens giltighet"}
            </p>
          </div>
        </article>


        <article>
          <span>
            <Clock3
              size={18}
            />
          </span>

          <div>
            <small>
              SENAST HÄNDELSE
            </small>

            <strong>
              {offer.activity[0]
                ?.label ||
                "Offert skapad"}
            </strong>

            <p>
              {formatDateTime(
                offer.activity[0]
                  ?.occurredAt ||
                  offer.createdAt
              )}
            </p>
          </div>
        </article>
      </section>


      <div
        className={
          styles.layout
        }
      >
        <main
          className={
            styles.main
          }
        >
          <section
            className={
              styles.card
            }
          >
            <header
              className={
                styles.cardHeader
              }
            >
              <div>
                <span>
                  01
                </span>

                <div>
                  <h3>
                    Tjänster &
                    omfattning
                  </h3>

                  <p>
                    Innehållet i
                    grundofferten.
                  </p>
                </div>
              </div>

              <strong>
                {baseLines.length}{" "}
                offertrader
              </strong>
            </header>


            {baseLines.length >
            0 ? (
              <div
                className={
                  styles.lineTable
                }
              >
                <div
                  className={
                    styles.tableHeader
                  }
                >
                  <span>
                    Tjänst
                  </span>

                  <span>
                    Antal
                  </span>

                  <span>
                    Á-pris
                  </span>

                  <span>
                    Belopp
                  </span>
                </div>

                {baseLines.map(
                  (
                    line
                  ) => (
                    <article
                      key={
                        line.id
                      }
                      className={
                        styles.line
                      }
                    >
                      <div>
                        <strong>
                          {
                            line.name
                          }
                        </strong>

                        {line.description && (
                          <p>
                            {
                              line.description
                            }
                          </p>
                        )}

                        <div
                          className={
                            styles.lineMeta
                          }
                        >
                          <span>
                            {line.lineType ===
                            "addon"
                              ? "Tillägg"
                              : "Tjänst"}
                          </span>

                          {line.discountPercent >
                            0 && (
                            <span>
                              {
                                line.discountPercent
                              }
                              % rabatt
                            </span>
                          )}

                          <span>
                            {
                              line.vatRate
                            }
                            % moms
                          </span>
                        </div>
                      </div>

                      <span>
                        {
                          line.quantity
                        }{" "}
                        {
                          line.unitCode
                        }
                      </span>

                      <span>
                        {formatCurrency(
                          line.unitPriceExVat,
                          offer.currency
                        )}
                      </span>

                      <strong>
                        {formatCurrency(
                          line.subtotalExVat,
                          offer.currency
                        )}
                      </strong>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div
                className={
                  styles.emptyState
                }
              >
                <FileText
                  size={24}
                />

                <strong>
                  Inga offertrader
                  kunde läsas
                </strong>

                <p>
                  Offerten finns,
                  men inga sparade
                  tjänster hittades
                  på offertposten.
                </p>
              </div>
            )}
          </section>


          {optionalLines.length >
            0 && (
            <section
              className={
                styles.card
              }
            >
              <header
                className={
                  styles.cardHeader
                }
              >
                <div>
                  <span>
                    02
                  </span>

                  <div>
                    <h3>
                      Valbara
                      tillägg
                    </h3>

                    <p>
                      Tjänster kunden
                      kan välja till.
                    </p>
                  </div>
                </div>

                <strong>
                  {
                    optionalLines.length
                  }{" "}
                  tillägg
                </strong>
              </header>

              <div
                className={
                  styles.optionalList
                }
              >
                {optionalLines.map(
                  (
                    line
                  ) => (
                    <article
                      key={
                        line.id
                      }
                    >
                      <div>
                        <strong>
                          {
                            line.name
                          }
                        </strong>

                        {line.description && (
                          <p>
                            {
                              line.description
                            }
                          </p>
                        )}
                      </div>

                      <strong>
                        +{" "}
                        {formatCurrency(
                          line.subtotalExVat,
                          offer.currency
                        )}
                      </strong>
                    </article>
                  )
                )}
              </div>
            </section>
          )}


          <section
            className={
              styles.card
            }
          >
            <header
              className={
                styles.cardHeader
              }
            >
              <div>
                <span>
                  03
                </span>

                <div>
                  <h3>
                    Meddelande &
                    villkor
                  </h3>

                  <p>
                    Informationen
                    kunden får med
                    offerten.
                  </p>
                </div>
              </div>
            </header>


            <div
              className={
                styles.termsGrid
              }
            >
              <article>
                <Mail
                  size={18}
                />

                <small>
                  MEDDELANDE TILL
                  KUND
                </small>

                <p>
                  {offer.customerMessage ||
                    "Inget särskilt kundmeddelande angivet."}
                </p>
              </article>


              <article>
                <ReceiptText
                  size={18}
                />

                <small>
                  BETALNINGSVILLKOR
                </small>

                <p>
                  {offer.paymentTerms ||
                    "Inga betalningsvillkor angivna."}
                </p>
              </article>


              <article
                className={
                  styles.fullTerm
                }
              >
                <FileText
                  size={18}
                />

                <small>
                  OFFERTVILLKOR
                </small>

                <p>
                  {offer.termsText ||
                    "Inga övriga offertvillkor angivna."}
                </p>
              </article>
            </div>
          </section>
        </main>


        <aside
          className={
            styles.sidebar
          }
        >
          <OfferResponseCard
            offerId={
              offer.id
            }
          />

          <OfferVersionsCard
            offerId={
              offer.id
            }
          />

          <section
            className={
              styles.sideCard
            }
          >
            <header>
              <UserRound
                size={18}
              />

              <div>
                <small>
                  KUND
                </small>

                <h3>
                  Kundinformation
                </h3>
              </div>
            </header>

            <dl>
              <div>
                <dt>
                  Kund
                </dt>

                <dd>
                  {
                    offer.customerName
                  }
                </dd>
              </div>

              <div>
                <dt>
                  E-post
                </dt>

                <dd>
                  {offer.customerEmail ||
                    "Ej angivet"}
                </dd>
              </div>

              <div>
                <dt>
                  Telefon
                </dt>

                <dd>
                  {offer.customerPhone ||
                    "Ej angivet"}
                </dd>
              </div>

              <div>
                <dt>
                  Projekt
                </dt>

                <dd>
                  {
                    offer.projectTitle
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Start
                </dt>

                <dd>
                  {formatDate(
                    offer.desiredStartDate
                  )}
                </dd>
              </div>
            </dl>

            {offer.customerId && (
              <Link
                href={`/dashboard/kunder/${offer.customerId}`}
                className={
                  styles.sideLink
                }
              >
                Öppna kunden

                <ExternalLink
                  size={14}
                />
              </Link>
            )}
          </section>


          <section
            className={
              styles.sideCard
            }
          >
            <header>
              <ReceiptText
                size={18}
              />

              <div>
                <small>
                  EKONOMI
                </small>

                <h3>
                  Prissammanställning
                </h3>
              </div>
            </header>

            <div
              className={
                styles.priceSummary
              }
            >
              <div>
                <span>
                  Delsumma
                </span>

                <strong>
                  {formatCurrency(
                    offer.subtotalBeforeDiscount,
                    offer.currency
                  )}
                </strong>
              </div>

              {offer.discountAmount >
                0 && (
                <div
                  className={
                    styles.discountRow
                  }
                >
                  <span>
                    {offer.discountLabel}
                  </span>

                  <strong>
                    −{" "}
                    {formatCurrency(
                      offer.discountAmount,
                      offer.currency
                    )}
                  </strong>
                </div>
              )}

              <div>
                <span>
                  Moms
                </span>

                <strong>
                  {formatCurrency(
                    offer.vatAmount,
                    offer.currency
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.totalRow
                }
              >
                <span>
                  Totalt
                </span>

                <strong>
                  {formatCurrency(
                    offer.totalIncVat,
                    offer.currency
                  )}
                </strong>
              </div>
            </div>
          </section>


          <section
            className={
              styles.sideCard
            }
          >
            <header>
              <Clock3
                size={18}
              />

              <div>
                <small>
                  HISTORIK
                </small>

                <h3>
                  Aktivitet
                </h3>
              </div>
            </header>

            {offer.activity.length >
            0 ? (
              <div
                className={
                  styles.timeline
                }
              >
                {offer.activity.map(
                  (
                    event
                  ) => (
                    <article
                      key={
                        event.id
                      }
                    >
                      <span
                        className={[
                          styles.timelineDot,
                          event.tone ===
                          "success"
                            ? styles.dotSuccess
                            : event.tone ===
                                "danger"
                              ? styles.dotDanger
                              : event.tone ===
                                  "warning"
                                ? styles.dotWarning
                                : "",
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " "
                          )}
                      />

                      <div>
                        <strong>
                          {
                            event.label
                          }
                        </strong>

                        <p>
                          {
                            event.description
                          }
                        </p>

                        <time>
                          {formatDateTime(
                            event.occurredAt
                          )}
                        </time>
                      </div>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div
                className={
                  styles.miniEmpty
                }
              >
                <CircleAlert
                  size={18}
                />

                Ingen aktivitet
                registrerad ännu.
              </div>
            )}
          </section>


          {offer.status ===
            "accepted" && (
            <section
              className={
                styles.acceptedCard
              }
            >
              <CheckCircle2
                size={22}
              />

              <div>
                <small>
                  ACCEPTERAD
                </small>

                <strong>
                  Redo att bli
                  projekt
                </strong>

                <p>
                  I nästa steg
                  kopplar vi
                  accepterad offert
                  direkt till
                  Projekt.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}