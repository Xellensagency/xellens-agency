"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  InvoiceStatisticStatus,
  InvoiceStatisticsData,
} from "@/lib/dashboard/invoices/invoice-statistics-types";

import styles from "./InvoiceStatistics.module.css";

type InvoiceStatisticsProps = {
  data: InvoiceStatisticsData;
};

const statusColors: Record<
  InvoiceStatisticStatus,
  string
> = {
  paid: "#42d6a4",
  sent: "#40b9e9",
  outstanding: "#f2a633",
  overdue: "#ef5961",
};

function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency: "SEK",
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function formatCompactMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
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

function changeText(
  value: number | null
) {
  if (value === null) {
    return "Nytt jämfört med förra året";
  }

  if (Math.abs(value) < 0.05) {
    return "Oförändrat från förra året";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(
    1
  )}% från förra året`;
}

export default function InvoiceStatistics({
  data,
}: InvoiceStatisticsProps) {
  const router =
    useRouter();

  const maximumMonthlyValue =
    Math.max(
      ...data.monthly.map(
        (month) => month.total
      ),
      1
    );

  const chartMaximum =
    Math.max(
      Math.ceil(
        maximumMonthlyValue / 1000
      ) * 1000,
      1000
    );

  const chartPoints =
    data.monthly.map(
      (month, index) => {
        const x =
          48 +
          index *
            (540 / 11);

        const y =
          198 -
          (
            month.total /
            chartMaximum
          ) *
            145;

        return {
          ...month,
          x,
          y,
        };
      }
    );

  const linePoints =
    chartPoints
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");

  const areaPoints =
    `48,198 ${linePoints} 588,198`;

  let accumulatedPercentage = 0;

  const donutSegments =
    data.statuses.map(
      (status) => {
        const start =
          accumulatedPercentage;

        accumulatedPercentage +=
          status.percentage;

        return `${statusColors[status.key]} ${start}% ${accumulatedPercentage}%`;
      }
    );

  const donutBackground =
    data.totalInvoiceCount > 0
      ? `conic-gradient(${donutSegments.join(
          ", "
        )})`
      : "conic-gradient(#203740 0% 100%)";

  const summaryCards = [
    {
      label: "Totalt fakturerat",
      value:
        data.summary.totalInvoiced,
      change:
        data.summary.invoicedChange,
      icon: ReceiptText,
      tone: styles.turquoise,
    },
    {
      label: "Betalda fakturor",
      value:
        data.summary.totalPaid,
      change:
        data.summary.paidChange,
      icon: CheckCircle2,
      tone: styles.green,
    },
    {
      label: "Utestående belopp",
      value:
        data.summary.totalOutstanding,
      change:
        data.summary.outstandingChange,
      icon: WalletCards,
      tone: styles.orange,
    },
    {
      label: "Förfallna belopp",
      value:
        data.summary.totalOverdue,
      change:
        data.summary.overdueChange,
      icon: CircleAlert,
      tone: styles.red,
    },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs}>
        <Link href="/dashboard/fakturor">
          <ArrowLeft size={16} />
          Fakturor
        </Link>

        <span>/</span>

        <strong>Statistik</strong>
      </nav>

      <header className={styles.heading}>
        <div>
          <h1>Fakturastatistik</h1>

          <p>
            Analys och översikt av fakturor
            och betalningar.
          </p>
        </div>

        <div className={styles.headingActions}>
          <select
            value={data.year}
            onChange={(event) =>
              router.push(
                `/dashboard/fakturor/statistik?year=${event.target.value}`
              )
            }
          >
            {data.availableYears.map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            disabled
            title="Rapportexport kopplas senare"
          >
            <Download size={17} />
            Exportera rapport
          </button>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        {summaryCards.map(
          (card) => {
            const Icon =
              card.icon;

            const positive =
              card.change === null ||
              card.change >= 0;

            return (
              <article
                key={card.label}
                className={[
                  styles.summaryCard,
                  card.tone,
                ].join(" ")}
              >
                <div>
                  <span>
                    {card.label}
                  </span>

                  <strong>
                    {formatMoney(
                      card.value
                    )}
                  </strong>

                  <small
                    className={
                      positive
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {positive ? (
                      <TrendingUp
                        size={14}
                      />
                    ) : (
                      <TrendingDown
                        size={14}
                      />
                    )}

                    {changeText(
                      card.change
                    )}
                  </small>
                </div>

                <div className={styles.cardIcon}>
                  <Icon size={21} />
                </div>
              </article>
            );
          }
        )}
      </section>

      <section className={styles.chartsGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>
                Fakturering över tid
              </h2>

              <p>
                Fakturerat belopp per månad
                under {data.year}.
              </p>
            </div>
          </header>

          <div className={styles.lineChart}>
            <svg
              viewBox="0 0 630 245"
              role="img"
              aria-label="Fakturering per månad"
            >
              <defs>
                <linearGradient
                  id="invoiceChartArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#29cabb"
                    stopOpacity="0.3"
                  />

                  <stop
                    offset="100%"
                    stopColor="#29cabb"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map(
                (index) => {
                  const y =
                    53 +
                    index * 36;

                  const value =
                    chartMaximum *
                    (
                      1 -
                      index / 4
                    );

                  return (
                    <g key={index}>
                      <line
                        x1="48"
                        y1={y}
                        x2="588"
                        y2={y}
                        className={
                          styles.gridLine
                        }
                      />

                      <text
                        x="39"
                        y={y + 4}
                        textAnchor="end"
                        className={
                          styles.axisLabel
                        }
                      >
                        {formatCompactMoney(
                          value
                        )}
                      </text>
                    </g>
                  );
                }
              )}

              <polygon
                points={areaPoints}
                fill="url(#invoiceChartArea)"
              />

              <polyline
                points={linePoints}
                className={
                  styles.chartLine
                }
              />

              {chartPoints.map(
                (point) => (
                  <g key={point.month}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      className={
                        styles.chartPoint
                      }
                    />

                    <text
                      x={point.x}
                      y="224"
                      textAnchor="middle"
                      className={
                        styles.monthLabel
                      }
                    >
                      {point.label}
                    </text>
                  </g>
                )
              )}
            </svg>
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>Fakturastatus</h2>

              <p>
                Fördelning av fakturorna
                under {data.year}.
              </p>
            </div>
          </header>

          <div className={styles.statusContent}>
            <div
              className={styles.donut}
              style={{
                background:
                  donutBackground,
              }}
            >
              <div>
                <strong>
                  {data.totalInvoiceCount}
                </strong>

                <span>Totalt</span>
              </div>
            </div>

            <div className={styles.statusLegend}>
              {data.statuses.map(
                (status) => (
                  <div key={status.key}>
                    <span
                      style={{
                        background:
                          statusColors[
                            status.key
                          ],
                      }}
                    />

                    <strong>
                      {status.label}
                    </strong>

                    <em>
                      {status.count} (
                      {status.percentage.toFixed(
                        0
                      )}
                      %)
                    </em>
                  </div>
                )
              )}
            </div>
          </div>
        </article>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>
                Topp 5 kunder
              </h2>

              <p>
                Fakturerat belopp under{" "}
                {data.year}.
              </p>
            </div>
          </header>

          <div className={styles.customerList}>
            {data.topCustomers.length ===
            0 ? (
              <div className={styles.emptyState}>
                Inga kunder att visa ännu.
              </div>
            ) : (
              data.topCustomers.map(
                (customer, index) => (
                  <div key={customer.id}>
                    <span>
                      {index + 1}.
                    </span>

                    <strong>
                      {customer.name}
                    </strong>

                    <em>
                      {formatMoney(
                        customer.total
                      )}
                    </em>
                  </div>
                )
              )
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>
                Fakturor förfaller inom 30
                dagar
              </h2>

              <p>
                Fakturor som snart behöver
                följas upp.
              </p>
            </div>
          </header>

          <div className={styles.dueTable}>
            <div className={styles.dueHeader}>
              <span>Fakturanr</span>
              <span>Kund</span>
              <span>Förfallodatum</span>
              <span>Belopp</span>
            </div>

            {data.dueSoon.length === 0 ? (
              <div className={styles.emptyState}>
                Inga fakturor förfaller inom
                30 dagar.
              </div>
            ) : (
              data.dueSoon.map(
                (invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/fakturor/${invoice.id}`}
                    className={styles.dueRow}
                  >
                    <strong>
                      {
                        invoice.invoiceNumber
                      }
                    </strong>

                    <span>
                      {
                        invoice.customerName
                      }
                    </span>

                    <time>
                      {formatDate(
                        invoice.dueDate
                      )}

                      <small>
                        {invoice.daysLeft === 0
                          ? "Förfaller idag"
                          : `${invoice.daysLeft} dagar kvar`}
                      </small>
                    </time>

                    <em>
                      {formatMoney(
                        invoice.outstanding
                      )}
                    </em>
                  </Link>
                )
              )
            )}
          </div>

          <footer className={styles.panelFooter}>
            <Link href="/dashboard/fakturor">
              Visa alla fakturor
            </Link>
          </footer>
        </article>
      </section>
    </div>
  );
}
