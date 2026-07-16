"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  Ellipsis,
  FolderKanban,
  Mail,
  ReceiptText,
  RotateCcw,
  Send,
} from "lucide-react";

import type {
  InvoiceDisplayStatus,
} from "@/lib/dashboard/invoices/invoice-types";

import type {
  InvoiceDetailData,
} from "@/lib/dashboard/invoices/invoice-detail-types";

import styles from "./InvoiceDetail.module.css";

type InvoiceDetailProps = {
  data: InvoiceDetailData;
};

const statusLabels: Record<
  InvoiceDisplayStatus,
  string
> = {
  draft: "Utkast",
  sent: "Skickad",
  paid: "Betald",
  partially_paid: "Delbetald",
  overdue: "Förfallen",
  cancelled: "Makulerad",
  credited: "Krediterad",
};

function money(
  value: number,
  currency = "SEK"
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function dateText(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    )
  );
}

function dateTimeText(
  value: string
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function statusClass(
  status: InvoiceDisplayStatus
) {
  switch (status) {
    case "paid":
      return styles.statusPaid;

    case "sent":
      return styles.statusSent;

    case "partially_paid":
      return styles.statusPartial;

    case "overdue":
      return styles.statusOverdue;

    case "cancelled":
    case "credited":
      return styles.statusCancelled;

    default:
      return styles.statusDraft;
  }
}

export default function InvoiceDetail({
  data,
}: InvoiceDetailProps) {
  const latestPayment =
    data.payments[0] ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard/fakturor">
          <ArrowLeft size={17} />
          Fakturor
        </Link>

        <span>/</span>

        <strong>
          {data.invoice.invoiceNumber}
        </strong>
      </div>

      <header className={styles.heading}>
        <div>
          <div className={styles.titleRow}>
            <h1>
              Faktura{" "}
              {data.invoice.invoiceNumber}
            </h1>

            <span
              className={[
                styles.status,
                statusClass(
                  data.invoice.status
                ),
              ].join(" ")}
            >
              {
                statusLabels[
                  data.invoice.status
                ]
              }
            </span>
          </div>

          <p>
            Skapad{" "}
            {dateText(
              data.invoice.invoiceDate
            )}
            {data.invoice.dueDate
              ? ` · Förfaller ${dateText(
                  data.invoice.dueDate
                )}`
              : ""}
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            disabled
            title="Utskick kopplas i nästa steg"
          >
            <Send size={17} />
            {data.invoice.sentAt
              ? "Skicka igen"
              : "Skicka faktura"}
          </button>

          <Link
            href={`/dashboard/fakturor/${data.invoice.id}/forhandsgranskning`}
            className={styles.previewButton}
          >
            <Eye size={17} />
            Förhandsgranska
          </Link>

          <button
            type="button"
            disabled
            aria-label="Fler åtgärder"
          >
            <Ellipsis size={18} />
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <div className={styles.topGrid}>
            <section className={styles.card}>
              <header>
                <Building2 size={19} />

                <div>
                  <h2>Kund</h2>
                  <p>Fakturamottagare</p>
                </div>
              </header>

              <div className={styles.customer}>
                <strong>
                  {data.customer.name}
                </strong>

                {data.customer.organizationNumber && (
                  <span>
                    Org.nr{" "}
                    {
                      data.customer
                        .organizationNumber
                    }
                  </span>
                )}

                <span>
                  {data.customer.billingEmail ||
                    data.customer.email ||
                    "Ingen e-postadress"}
                </span>

                {data.customer.phone && (
                  <span>
                    {data.customer.phone}
                  </span>
                )}

                <address>
                  {data.customer.billingAddress && (
                    <>
                      {
                        data.customer
                          .billingAddress
                      }
                      <br />
                    </>
                  )}

                  {[
                    data.customer.postalCode,
                    data.customer.city,
                  ]
                    .filter(Boolean)
                    .join(" ")}

                  {(data.customer.postalCode ||
                    data.customer.city) && (
                    <br />
                  )}

                  {data.customer.country}
                </address>

                <Link
                  href="/dashboard/kunder"
                  className={styles.inlineLink}
                >
                  Visa kund
                </Link>
              </div>
            </section>

            <section className={styles.card}>
              <header>
                <FolderKanban size={19} />

                <div>
                  <h2>Projekt</h2>
                  <p>Kopplat projekt</p>
                </div>
              </header>

              <div className={styles.project}>
                {data.project ? (
                  <>
                    <strong>
                      {data.project.title}
                    </strong>

                    <span>
                      {
                        data.project
                          .projectNumber
                      }
                    </span>

                    <Link
                      href="/dashboard/projekt"
                      className={
                        styles.inlineLink
                      }
                    >
                      Visa projekt
                    </Link>
                  </>
                ) : (
                  <span>
                    Fakturan är inte kopplad
                    till något projekt.
                  </span>
                )}
              </div>
            </section>
          </div>

          <section className={styles.card}>
            <header>
              <CalendarDays size={19} />

              <div>
                <h2>Fakturadetaljer</h2>
                <p>
                  Datum, villkor och referenser
                </p>
              </div>
            </header>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Fakturadatum</dt>
                <dd>
                  {dateText(
                    data.invoice.invoiceDate
                  )}
                </dd>
              </div>

              <div>
                <dt>Förfallodatum</dt>
                <dd>
                  {dateText(
                    data.invoice.dueDate
                  )}
                </dd>
              </div>

              <div>
                <dt>Betalningsvillkor</dt>
                <dd>
                  {
                    data.invoice
                      .paymentTermsDays
                  }{" "}
                  dagar
                </dd>
              </div>

              <div>
                <dt>Fakturamejl</dt>
                <dd>
                  {data.invoice
                    .deliveryEmail ||
                    "Ej angiven"}
                </dd>
              </div>

              <div>
                <dt>Er referens</dt>
                <dd>
                  {data.invoice
                    .referenceNumber ||
                    "Ej angiven"}
                </dd>
              </div>

              <div>
                <dt>PO-/ordernummer</dt>
                <dd>
                  {data.invoice.poNumber ||
                    "Ej angivet"}
                </dd>
              </div>

              <div>
                <dt>OCR-nummer</dt>
                <dd>
                  {data.invoice.ocrNumber ||
                    "Skapas vid utskick"}
                </dd>
              </div>

              <div>
                <dt>Källa</dt>
                <dd>
                  {data.invoice.sourceType ===
                  "imported"
                    ? "Importerad faktura"
                    : "Skapad i portalen"}
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.card}>
            <header>
              <ReceiptText size={19} />

              <div>
                <h2>Fakturarader</h2>

                <p>
                  Produkter och tjänster på
                  fakturan.
                </p>
              </div>
            </header>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Beskrivning</th>
                    <th>Antal</th>
                    <th>Pris</th>
                    <th>Rabatt</th>
                    <th>Moms</th>
                    <th>Summa</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className={
                          styles.emptyState
                        }
                      >
                        Fakturan saknar
                        fakturarader.
                      </td>
                    </tr>
                  ) : (
                    data.items.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>
                              {
                                item.description
                              }
                            </strong>
                          </td>

                          <td>
                            {item.quantity}{" "}
                            {item.unitCode}
                          </td>

                          <td>
                            {money(
                              item.unitPriceExVat,
                              data.invoice
                                .currency
                            )}
                          </td>

                          <td>
                            {
                              item.discountPercent
                            }{" "}
                            %
                          </td>

                          <td>
                            {item.vatRate} %
                          </td>

                          <td>
                            <strong>
                              {money(
                                item.subtotalExVat,
                                data.invoice
                                  .currency
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {(data.invoice.description ||
            data.invoice.notes) && (
            <section className={styles.card}>
              <header>
                <Mail size={19} />

                <div>
                  <h2>Meddelande</h2>
                  <p>
                    Information på fakturan
                  </p>
                </div>
              </header>

              <div className={styles.message}>
                {data.invoice.description && (
                  <p>
                    {
                      data.invoice
                        .description
                    }
                  </p>
                )}

                {data.invoice.notes && (
                  <small>
                    Intern anteckning:{" "}
                    {data.invoice.notes}
                  </small>
                )}
              </div>
            </section>
          )}
        </main>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <header>
              <Banknote size={19} />

              <div>
                <h2>
                  Fakturasammanfattning
                </h2>
                <p>Belopp och betalning</p>
              </div>
            </header>

            <dl className={styles.summary}>
              <div>
                <dt>Delsumma</dt>
                <dd>
                  {money(
                    data.invoice
                      .subtotalExVat,
                    data.invoice.currency
                  )}
                </dd>
              </div>

              <div>
                <dt>Moms</dt>
                <dd>
                  {money(
                    data.invoice.vatAmount,
                    data.invoice.currency
                  )}
                </dd>
              </div>

              <div>
                <dt>Betalt</dt>
                <dd>
                  {money(
                    data.invoice.amountPaid,
                    data.invoice.currency
                  )}
                </dd>
              </div>

              <div className={styles.totalRow}>
                <dt>Totalt belopp</dt>
                <dd>
                  {money(
                    data.invoice.totalIncVat,
                    data.invoice.currency
                  )}
                </dd>
              </div>

              <div
                className={
                  styles.outstandingRow
                }
              >
                <dt>Kvar att betala</dt>
                <dd>
                  {money(
                    data.invoice
                      .outstandingAmount,
                    data.invoice.currency
                  )}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className={
                styles.paymentButton
              }
              disabled
              title="Betalningsregistrering byggs i nästa steg"
            >
              <CheckCircle2 size={17} />
              Registrera betalning
            </button>
          </section>

          <section className={styles.card}>
            <header>
              <Banknote size={19} />

              <div>
                <h2>Betalningsinformation</h2>
                <p>Senaste betalningen</p>
              </div>
            </header>

            <dl className={styles.paymentInfo}>
              <div>
                <dt>Betalningsmetod</dt>
                <dd>
                  {latestPayment
                    ?.paymentMethod ||
                    "Ej registrerad"}
                </dd>
              </div>

              <div>
                <dt>Transaktions-ID</dt>
                <dd>
                  {latestPayment
                    ?.externalReference ||
                    "Ej registrerat"}
                </dd>
              </div>

              <div>
                <dt>Betaldatum</dt>
                <dd>
                  {latestPayment?.paidAt
                    ? dateText(
                        latestPayment.paidAt
                      )
                    : dateText(
                        data.invoice.paidAt
                      )}
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.card}>
            <header>
              <RotateCcw size={19} />

              <div>
                <h2>Historik</h2>
                <p>
                  Fakturans aktiviteter
                </p>
              </div>
            </header>

            <div className={styles.timeline}>
              {data.events.length === 0 ? (
                <div
                  className={
                    styles.emptyTimeline
                  }
                >
                  Ingen historik ännu.
                </div>
              ) : (
                data.events.map(
                  (event) => (
                    <article key={event.id}>
                      <span />

                      <div>
                        <strong>
                          {event.title}
                        </strong>

                        {event.description && (
                          <p>
                            {
                              event.description
                            }
                          </p>
                        )}

                        <time>
                          {dateTimeText(
                            event.createdAt
                          )}
                        </time>
                      </div>
                    </article>
                  )
                )
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

