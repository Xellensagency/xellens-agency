"use client";

import Link from "next/link";

import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  FilePlus2,
  FilterX,
  Import,
  ReceiptText,
  Search,
  Send,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import styles from "./InvoiceOverview.module.css";

type InvoiceOverviewProps = {
  data: unknown;
};

type InvoiceStatus =
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;

  invoiceDate: string | null;
  dueDate: string | null;

  status: InvoiceStatus;

  total: number;
  amountPaid: number;
  outstanding: number;

  currency: string;
  sourceType: string;

  isRecurring: boolean;
  recurringProfileId: string | null;
};

type RecurringRow = {
  id: string;
  name: string;
  customerName: string;
  nextInvoiceDate: string | null;
  amount: number;
  currency: string;
  autoSend: boolean;
  active: boolean;
};

type FilterTab =
  | "all"
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "recurring";

type UnknownRecord =
  Record<string, unknown>;

function asRecord(
  value: unknown
): UnknownRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

function asArray(
  value: unknown
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}

function stringValue(
  value: unknown,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

function optionalString(
  value: unknown
) {
  const text =
    stringValue(value).trim();

  return text || null;
}

function numberValue(
  value: unknown
) {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function booleanValue(
  value: unknown
) {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
}

function safeDate(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function formatDate(
  value: string | null
) {
  const date =
    safeDate(value);

  if (!date) {
    return "Ej angivet";
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

function formatMoney(
  value: number,
  currency = "SEK"
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

function resolveStatus(
  rawStatus: unknown,
  total: number,
  amountPaid: number,
  dueDate: string | null
): InvoiceStatus {
  const status =
    stringValue(
      rawStatus,
      "draft"
    )
      .trim()
      .toLowerCase();

  const outstanding =
    Math.max(
      total - amountPaid,
      0
    );

  if (
    [
      "cancelled",
      "canceled",
      "credited",
      "credit",
      "void",
      "makulerad",
    ].includes(status)
  ) {
    return "cancelled";
  }

  if (
    status === "paid" ||
    status === "betald" ||
    (
      total > 0 &&
      outstanding <= 0.01
    )
  ) {
    return "paid";
  }

  const due =
    safeDate(dueDate);

  if (
    due &&
    outstanding > 0
  ) {
    due.setHours(
      23,
      59,
      59,
      999
    );

    if (
      due.getTime() <
      Date.now()
    ) {
      return "overdue";
    }
  }

  if (
    amountPaid > 0 &&
    outstanding > 0
  ) {
    return "partial";
  }

  if (
    [
      "sent",
      "skickad",
      "delivered",
      "reminded",
    ].includes(status)
  ) {
    return "sent";
  }

  return "draft";
}

function normalizeInvoice(
  value: unknown
): InvoiceRow {
  const row =
    asRecord(value);

  const customer =
    asRecord(row.customer);

  const total =
    numberValue(
      row.totalIncVat ??
      row.total_inc_vat ??
      row.totalAmount ??
      row.total_amount ??
      row.total
    );

  const amountPaid =
    numberValue(
      row.amountPaid ??
      row.amount_paid ??
      row.paidAmount ??
      row.paid_amount
    );

  const outstandingFromRow =
    row.outstandingAmount ??
    row.outstanding_amount ??
    row.remainingAmount ??
    row.remaining_amount;

  const outstanding =
    outstandingFromRow !==
      null &&
    outstandingFromRow !==
      undefined
      ? Math.max(
          numberValue(
            outstandingFromRow
          ),
          0
        )
      : Math.max(
          total - amountPaid,
          0
        );

  const dueDate =
    optionalString(
      row.dueDate ??
      row.due_date
    );

  const recurringProfileId =
    optionalString(
      row.recurringProfileId ??
      row.recurring_profile_id
    );

  return {
    id:
      stringValue(row.id),

    invoiceNumber:
      stringValue(
        row.invoiceNumber ??
        row.invoice_number,
        "UTKAST"
      ),

    customerId:
      stringValue(
        row.customerId ??
        row.customer_id ??
        customer.id
      ),

    customerName:
      stringValue(
        row.customerName ??
        row.customer_name ??
        customer.name,
        "Okänd kund"
      ),

    customerEmail:
      optionalString(
        row.customerEmail ??
        row.customer_email ??
        customer.billingEmail ??
        customer.billing_email ??
        customer.email
      ),

    invoiceDate:
      optionalString(
        row.invoiceDate ??
        row.invoice_date
      ),

    dueDate,

    status:
      resolveStatus(
        row.status,
        total,
        amountPaid,
        dueDate
      ),

    total,
    amountPaid,
    outstanding,

    currency:
      stringValue(
        row.currency,
        "SEK"
      ),

    sourceType:
      stringValue(
        row.sourceType ??
        row.source_type,
        "manual"
      ),

    isRecurring:
      booleanValue(
        row.isRecurring ??
        row.is_recurring
      ) ||
      Boolean(
        recurringProfileId
      ),

    recurringProfileId,
  };
}

function normalizeRecurring(
  value: unknown
): RecurringRow {
  const row =
    asRecord(value);

  const customer =
    asRecord(row.customer);

  return {
    id:
      stringValue(row.id),

    name:
      stringValue(
        row.name ??
        row.title,
        "Återkommande faktura"
      ),

    customerName:
      stringValue(
        row.customerName ??
        row.customer_name ??
        customer.name,
        "Okänd kund"
      ),

    nextInvoiceDate:
      optionalString(
        row.nextInvoiceDate ??
        row.next_invoice_date ??
        row.nextRunDate ??
        row.next_run_date
      ),

    amount:
      numberValue(
        row.totalIncVat ??
        row.total_inc_vat ??
        row.amount ??
        row.fixedAmount ??
        row.fixed_amount
      ),

    currency:
      stringValue(
        row.currency,
        "SEK"
      ),

    autoSend:
      booleanValue(
        row.autoSend ??
        row.auto_send
      ),

    active:
      row.isActive === undefined &&
      row.is_active === undefined
        ? true
        : booleanValue(
            row.isActive ??
            row.is_active
          ),
  };
}

const statusLabels:
  Record<
    InvoiceStatus,
    string
  > = {
    draft: "Utkast",
    sent: "Skickad",
    partial: "Delbetald",
    paid: "Betald",
    overdue: "Förfallen",
    cancelled: "Makulerad",
  };

const tabDefinitions: Array<{
  key: FilterTab;
  label: string;
}> = [
  {
    key: "all",
    label: "Alla",
  },
  {
    key: "draft",
    label: "Utkast",
  },
  {
    key: "sent",
    label: "Skickade",
  },
  {
    key: "partial",
    label: "Delbetalda",
  },
  {
    key: "paid",
    label: "Betalda",
  },
  {
    key: "overdue",
    label: "Förfallna",
  },
  {
    key: "recurring",
    label: "Återkommande",
  },
];

export default function InvoiceOverview({
  data,
}: InvoiceOverviewProps) {
  const dataObject =
    asRecord(data);

  const rawInvoices =
    asArray(
      dataObject.invoices ??
      dataObject.rows ??
      dataObject.items
    );

  const rawRecurring =
    asArray(
      dataObject.recurringProfiles ??
      dataObject.recurring_profiles ??
      dataObject.recurring
    );

  const invoices =
    useMemo(
      () =>
        rawInvoices
          .map(normalizeInvoice)
          .filter(
            (invoice) =>
              Boolean(invoice.id)
          ),
      [rawInvoices]
    );

  const recurringProfiles =
    useMemo(
      () => {
        const profiles =
          rawRecurring
            .map(normalizeRecurring)
            .filter(
              (profile) =>
                Boolean(profile.id)
            );

        if (
          profiles.length > 0
        ) {
          return profiles;
        }

        return invoices
          .filter(
            (invoice) =>
              invoice.isRecurring
          )
          .map(
            (invoice) => ({
              id:
                invoice
                  .recurringProfileId ||
                invoice.id,

              name:
                `Månadsfaktura ${invoice.invoiceNumber}`,

              customerName:
                invoice.customerName,

              nextInvoiceDate:
                invoice.dueDate,

              amount:
                invoice.total,

              currency:
                invoice.currency,

              autoSend: false,
              active: true,
            })
          );
      },
      [
        invoices,
        rawRecurring,
      ]
    );

  const [
    activeTab,
    setActiveTab,
  ] = useState<FilterTab>(
    "all"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    customerFilter,
    setCustomerFilter,
  ] = useState("");

  const [
    sourceFilter,
    setSourceFilter,
  ] = useState("");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [
    dateTo,
    setDateTo,
  ] = useState("");

  const customers =
    useMemo(
      () =>
        Array.from(
          new Map(
            invoices.map(
              (invoice) => [
                invoice.customerId ||
                  invoice.customerName,

                {
                  id:
                    invoice.customerId ||
                    invoice.customerName,

                  name:
                    invoice.customerName,
                },
              ]
            )
          ).values()
        ).sort(
          (
            first,
            second
          ) =>
            first.name.localeCompare(
              second.name,
              "sv"
            )
        ),
      [invoices]
    );

  const tabCounts =
    useMemo(
      () => ({
        all:
          invoices.filter(
            (invoice) =>
              invoice.status !==
              "cancelled"
          ).length,

        draft:
          invoices.filter(
            (invoice) =>
              invoice.status ===
              "draft"
          ).length,

        sent:
          invoices.filter(
            (invoice) =>
              invoice.status ===
              "sent"
          ).length,

        partial:
          invoices.filter(
            (invoice) =>
              invoice.status ===
              "partial"
          ).length,

        paid:
          invoices.filter(
            (invoice) =>
              invoice.status ===
              "paid"
          ).length,

        overdue:
          invoices.filter(
            (invoice) =>
              invoice.status ===
              "overdue"
          ).length,

        recurring:
          recurringProfiles.filter(
            (profile) =>
              profile.active
          ).length,
      }),
      [
        invoices,
        recurringProfiles,
      ]
    );

  const filteredInvoices =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return invoices
          .filter(
            (invoice) => {
              if (
                activeTab ===
                "recurring"
              ) {
                return false;
              }

              if (
                activeTab !==
                  "all" &&
                invoice.status !==
                  activeTab
              ) {
                return false;
              }

              if (
                activeTab ===
                  "all" &&
                invoice.status ===
                  "cancelled"
              ) {
                return false;
              }

              if (
                customerFilter &&
                (
                  invoice.customerId ||
                  invoice.customerName
                ) !==
                  customerFilter
              ) {
                return false;
              }

              if (
                sourceFilter &&
                invoice.sourceType !==
                  sourceFilter
              ) {
                return false;
              }

              if (
                normalizedSearch &&
                ![
                  invoice.invoiceNumber,
                  invoice.customerName,
                  invoice.customerEmail ||
                    "",
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              ) {
                return false;
              }

              const invoiceDate =
                safeDate(
                  invoice.invoiceDate
                );

              if (
                dateFrom &&
                invoiceDate
              ) {
                const from =
                  safeDate(dateFrom);

                if (
                  from &&
                  invoiceDate < from
                ) {
                  return false;
                }
              }

              if (
                dateTo &&
                invoiceDate
              ) {
                const to =
                  safeDate(dateTo);

                if (to) {
                  to.setHours(
                    23,
                    59,
                    59,
                    999
                  );

                  if (
                    invoiceDate > to
                  ) {
                    return false;
                  }
                }
              }

              return true;
            }
          )
          .sort(
            (
              first,
              second
            ) => {
              const firstDate =
                safeDate(
                  first.invoiceDate
                )?.getTime() || 0;

              const secondDate =
                safeDate(
                  second.invoiceDate
                )?.getTime() || 0;

              return (
                secondDate -
                firstDate
              );
            }
          );
      },
      [
        activeTab,
        customerFilter,
        dateFrom,
        dateTo,
        invoices,
        search,
        sourceFilter,
      ]
    );

  const summary =
    useMemo(
      () => {
        const relevant =
          invoices.filter(
            (invoice) =>
              invoice.status !==
              "cancelled"
          );

        return {
          total:
            relevant.reduce(
              (
                value,
                invoice
              ) =>
                value +
                invoice.total,
              0
            ),

          paid:
            relevant.reduce(
              (
                value,
                invoice
              ) =>
                value +
                invoice.amountPaid,
              0
            ),

          outstanding:
            relevant.reduce(
              (
                value,
                invoice
              ) =>
                value +
                invoice.outstanding,
              0
            ),

          overdue:
            relevant
              .filter(
                (invoice) =>
                  invoice.status ===
                  "overdue"
              )
              .reduce(
                (
                  value,
                  invoice
                ) =>
                  value +
                  invoice.outstanding,
                0
              ),
        };
      },
      [invoices]
    );

  function clearFilters() {
    setSearch("");
    setCustomerFilter("");
    setSourceFilter("");
    setDateFrom("");
    setDateTo("");
  }

  const filtersActive =
    Boolean(
      search ||
      customerFilter ||
      sourceFilter ||
      dateFrom ||
      dateTo
    );

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            EKONOMI
          </span>

          <h1>Fakturor</h1>

          <p>
            Skapa, följ upp och hantera
            företagets fakturor och
            månadsfakturering.
          </p>
        </div>

        <div className={styles.headingActions}>
          <Link
            href="/dashboard/fakturor/statistik"
            className={styles.secondaryButton}
          >
            <BarChart3 size={18} />
            Statistik
          </Link>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled
            title="Import av gamla fakturor byggs i nästa del"
          >
            <Import size={18} />
            Importera
          </button>

          <Link
            href="/dashboard/fakturor/ny"
            className={styles.primaryButton}
          >
            <FilePlus2 size={18} />
            Skapa faktura
          </Link>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article
          className={[
            styles.summaryCard,
            styles.totalCard,
          ].join(" ")}
        >
          <div>
            <span>
              Totalt fakturerat
            </span>

            <strong>
              {formatMoney(
                summary.total
              )}
            </strong>

            <small>
              {tabCounts.all} fakturor
            </small>
          </div>

          <span className={styles.summaryIcon}>
            <ReceiptText size={22} />
          </span>
        </article>

        <article
          className={[
            styles.summaryCard,
            styles.paidCard,
          ].join(" ")}
        >
          <div>
            <span>Betalt</span>

            <strong>
              {formatMoney(
                summary.paid
              )}
            </strong>

            <small>
              {tabCounts.paid} betalda
            </small>
          </div>

          <span className={styles.summaryIcon}>
            <CheckCircle2 size={22} />
          </span>
        </article>

        <article
          className={[
            styles.summaryCard,
            styles.outstandingCard,
          ].join(" ")}
        >
          <div>
            <span>Utestående</span>

            <strong>
              {formatMoney(
                summary.outstanding
              )}
            </strong>

            <small>
              Väntar på betalning
            </small>
          </div>

          <span className={styles.summaryIcon}>
            <WalletCards size={22} />
          </span>
        </article>

        <article
          className={[
            styles.summaryCard,
            styles.overdueCard,
          ].join(" ")}
        >
          <div>
            <span>Förfallet</span>

            <strong>
              {formatMoney(
                summary.overdue
              )}
            </strong>

            <small>
              {tabCounts.overdue} fakturor
            </small>
          </div>

          <span className={styles.summaryIcon}>
            <CircleAlert size={22} />
          </span>
        </article>
      </section>

      <section className={styles.workspace}>
        <nav className={styles.tabs}>
          {tabDefinitions.map(
            (tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  activeTab ===
                  tab.key
                    ? styles.activeTab
                    : undefined
                }
                onClick={() =>
                  setActiveTab(
                    tab.key
                  )
                }
              >
                {tab.label}

                <span>
                  {
                    tabCounts[
                      tab.key
                    ]
                  }
                </span>
              </button>
            )
          )}
        </nav>

        {activeTab !==
        "recurring" ? (
          <>
            <div className={styles.filters}>
              <label className={styles.searchField}>
                <Search size={17} />

                <input
                  type="search"
                  value={search}
                  placeholder="Sök fakturanummer, kund eller e-post..."
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </label>

              <select
                value={customerFilter}
                onChange={(event) =>
                  setCustomerFilter(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Alla kunder
                </option>

                {customers.map(
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

              <select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Alla typer
                </option>

                <option value="manual">
                  Skapade fakturor
                </option>

                <option value="import">
                  Importerade
                </option>

                <option value="recurring">
                  Automatiska
                </option>
              </select>

              <label className={styles.dateField}>
                <span>Från</span>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) =>
                    setDateFrom(
                      event.target.value
                    )
                  }
                />
              </label>

              <label className={styles.dateField}>
                <span>Till</span>

                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) =>
                    setDateTo(
                      event.target.value
                    )
                  }
                />
              </label>

              <button
                type="button"
                className={styles.clearButton}
                disabled={
                  !filtersActive
                }
                onClick={clearFilters}
              >
                <FilterX size={17} />
                Rensa
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Faktura</th>
                    <th>Kund</th>
                    <th>Fakturadatum</th>
                    <th>Förfallodatum</th>
                    <th>Status</th>
                    <th>Totalt</th>
                    <th>Betalt</th>
                    <th>Kvar</th>
                    <th aria-label="Åtgärder" />
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className={
                          styles.emptyCell
                        }
                      >
                        <div
                          className={
                            styles.emptyState
                          }
                        >
                          <ReceiptText
                            size={31}
                          />

                          <strong>
                            Inga fakturor
                            hittades
                          </strong>

                          <span>
                            Ändra filtreringen
                            eller skapa en ny
                            faktura.
                          </span>

                          <Link href="/dashboard/fakturor/ny">
                            <FilePlus2
                              size={17}
                            />
                            Skapa faktura
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(
                      (invoice) => (
                        <tr
                          key={
                            invoice.id
                          }
                        >
                          <td>
                            <Link
                              href={`/dashboard/fakturor/${invoice.id}`}
                              className={
                                styles.invoiceNumber
                              }
                            >
                              {
                                invoice.invoiceNumber
                              }
                            </Link>

                            <small>
                              {invoice.sourceType ===
                              "import"
                                ? "Importerad"
                                : invoice.isRecurring
                                  ? "Återkommande"
                                  : "Manuell"}
                            </small>
                          </td>

                          <td>
                            <strong>
                              {
                                invoice.customerName
                              }
                            </strong>

                            {invoice.customerEmail && (
                              <small>
                                {
                                  invoice.customerEmail
                                }
                              </small>
                            )}
                          </td>

                          <td>
                            {formatDate(
                              invoice.invoiceDate
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                invoice.status ===
                                "overdue"
                                  ? styles.overdueDate
                                  : undefined
                              }
                            >
                              {formatDate(
                                invoice.dueDate
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={[
                                styles.status,
                                styles[
                                  `status_${invoice.status}`
                                ],
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(" ")}
                            >
                              {
                                statusLabels[
                                  invoice.status
                                ]
                              }
                            </span>
                          </td>

                          <td>
                            <strong>
                              {formatMoney(
                                invoice.total,
                                invoice.currency
                              )}
                            </strong>
                          </td>

                          <td>
                            {formatMoney(
                              invoice.amountPaid,
                              invoice.currency
                            )}
                          </td>

                          <td>
                            <strong
                              className={
                                invoice.outstanding >
                                0
                                  ? styles.remainingAmount
                                  : styles.paidAmount
                              }
                            >
                              {formatMoney(
                                invoice.outstanding,
                                invoice.currency
                              )}
                            </strong>
                          </td>

                          <td>
                            <div
                              className={
                                styles.rowActions
                              }
                            >
                              <Link
                                href={`/dashboard/fakturor/${invoice.id}`}
                                title="Öppna fakturan"
                              >
                                <Eye
                                  size={17}
                                />
                              </Link>

                              <Link
                                href={`/dashboard/fakturor/${invoice.id}/forhandsgranskning`}
                                title="Förhandsgranska"
                              >
                                <ReceiptText
                                  size={17}
                                />
                              </Link>

                              <Link
                                href={`/dashboard/fakturor/${invoice.id}?action=send`}
                                title="Skicka fakturan"
                              >
                                <Send
                                  size={17}
                                />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <footer className={styles.tableFooter}>
              <span>
                Visar{" "}
                {filteredInvoices.length} av{" "}
                {invoices.length} fakturor
              </span>

              <span>
                Totalt i urvalet:{" "}
                <strong>
                  {formatMoney(
                    filteredInvoices.reduce(
                      (
                        total,
                        invoice
                      ) =>
                        total +
                        invoice.total,
                      0
                    )
                  )}
                </strong>
              </span>
            </footer>
          </>
        ) : (
          <div className={styles.recurringContent}>
            <header>
              <div>
                <h2>
                  Återkommande fakturor
                </h2>

                <p>
                  Planerade månadsfakturor
                  och automatiska utskick.
                </p>
              </div>

              <Link href="/dashboard/fakturor/ny">
                <FilePlus2 size={17} />
                Skapa månadsfaktura
              </Link>
            </header>

            {recurringProfiles.length ===
            0 ? (
              <div className={styles.recurringEmpty}>
                <CalendarClock
                  size={34}
                />

                <strong>
                  Inga återkommande fakturor
                </strong>

                <span>
                  Aktivera månadsfakturering
                  när du skapar en faktura.
                </span>
              </div>
            ) : (
              <div className={styles.recurringGrid}>
                {recurringProfiles.map(
                  (profile) => (
                    <article
                      key={profile.id}
                    >
                      <div
                        className={
                          styles.recurringIcon
                        }
                      >
                        <CalendarClock
                          size={21}
                        />
                      </div>

                      <div
                        className={
                          styles.recurringMain
                        }
                      >
                        <div>
                          <strong>
                            {profile.name}
                          </strong>

                          <span>
                            {
                              profile.customerName
                            }
                          </span>
                        </div>

                        <dl>
                          <div>
                            <dt>
                              Nästa faktura
                            </dt>

                            <dd>
                              {formatDate(
                                profile.nextInvoiceDate
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt>Belopp</dt>

                            <dd>
                              {formatMoney(
                                profile.amount,
                                profile.currency
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt>Utskick</dt>

                            <dd>
                              {profile.autoSend
                                ? "Automatiskt"
                                : "Manuellt"}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <span
                        className={
                          profile.active
                            ? styles.activeRecurring
                            : styles.inactiveRecurring
                        }
                      >
                        {profile.active
                          ? "Aktiv"
                          : "Pausad"}
                      </span>
                    </article>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
