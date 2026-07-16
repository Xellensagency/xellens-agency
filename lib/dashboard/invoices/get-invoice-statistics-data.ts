import {
  createClient,
} from "@/lib/supabase/server";

import type {
  InvoiceDueSoonItem,
  InvoiceMonthlyStatistic,
  InvoiceStatisticStatus,
  InvoiceStatisticsData,
  InvoiceStatusStatistic,
  InvoiceTopCustomer,
} from "./invoice-statistics-types";

type DatabaseRow =
  Record<string, unknown>;

type NormalizedInvoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string | null;
  total: number;
  amountPaid: number;
  outstanding: number;

  status:
    | InvoiceStatisticStatus
    | "ignored";
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

function textValue(
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

function optionalText(
  value: unknown
) {
  const cleaned =
    textValue(value).trim();

  return cleaned || null;
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

function createDate(
  value: string
) {
  return new Date(
    value.length === 10
      ? `${value}T12:00:00`
      : value
  );
}

function resolveStatus(
  rawStatus: unknown,
  total: number,
  amountPaid: number,
  dueDate: string | null
): InvoiceStatisticStatus | "ignored" {
  const status =
    textValue(
      rawStatus,
      "draft"
    ).toLowerCase();

  const outstanding =
    Math.max(
      total - amountPaid,
      0
    );

  if (
    status === "cancelled" ||
    status === "canceled" ||
    status === "credited" ||
    status === "credit" ||
    status === "void"
  ) {
    return "ignored";
  }

  if (
    status === "paid" ||
    (
      total > 0 &&
      outstanding <= 0.01
    )
  ) {
    return "paid";
  }

  if (
    dueDate &&
    outstanding > 0
  ) {
    const due =
      createDate(dueDate);

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
    status === "sent" ||
    status === "delivered"
  ) {
    return "sent";
  }

  return "outstanding";
}

function percentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current === 0
      ? 0
      : null;
  }

  return (
    (
      current -
      previous
    ) /
    previous
  ) * 100;
}

function totalsForInvoices(
  invoices: NormalizedInvoice[]
) {
  return invoices.reduce(
    (
      totals,
      invoice
    ) => {
      totals.totalInvoiced +=
        invoice.total;

      totals.totalPaid +=
        Math.min(
          invoice.amountPaid,
          invoice.total
        );

      totals.totalOutstanding +=
        invoice.outstanding;

      if (
        invoice.status ===
        "overdue"
      ) {
        totals.totalOverdue +=
          invoice.outstanding;
      }

      return totals;
    },
    {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      totalOverdue: 0,
    }
  );
}

export async function getInvoiceStatisticsData(
  selectedYear?: number
): Promise<InvoiceStatisticsData> {
  const supabase =
    await createClient();

  const [
    invoicesResult,
    customersResult,
  ] = await Promise.all([
    (supabase as any)
      .from("invoices")
      .select(`
        id,
        invoice_number,
        customer_id,
        invoice_date,
        due_date,
        total_inc_vat,
        amount_paid,
        status
      `)
      .order(
        "invoice_date",
        {
          ascending: true,
        }
      )
      .limit(5000),

    (supabase as any)
      .from("customers")
      .select(`
        id,
        name
      `)
      .limit(5000),
  ]);

  const error =
    invoicesResult.error ||
    customersResult.error;

  if (error) {
    console.error(
      "Kunde inte hämta fakturastatistik:",
      error
    );

    throw new Error(
      error.message ||
        "Fakturastatistiken kunde inte hämtas."
    );
  }

  const invoiceRows:
    DatabaseRow[] =
      Array.isArray(
        invoicesResult.data
      )
        ? invoicesResult.data
        : [];

  const customerRows:
    DatabaseRow[] =
      Array.isArray(
        customersResult.data
      )
        ? customersResult.data
        : [];

  const customerNames =
    new Map<string, string>(
      customerRows.map(
        (row) => [
          textValue(row.id),

          textValue(
            row.name,
            "Okänd kund"
          ),
        ]
      )
    );

  const invoices:
    NormalizedInvoice[] =
      invoiceRows
        .map(
          (row) => {
            const total =
              numberValue(
                row.total_inc_vat
              );

            const amountPaid =
              numberValue(
                row.amount_paid
              );

            const invoiceDate =
              textValue(
                row.invoice_date
              );

            const dueDate =
              optionalText(
                row.due_date
              );

            return {
              id:
                textValue(row.id),

              invoiceNumber:
                textValue(
                  row.invoice_number,
                  "Saknar nummer"
                ),

              customerId:
                textValue(
                  row.customer_id
                ),

              invoiceDate,

              dueDate,

              total,

              amountPaid,

              outstanding:
                Math.max(
                  total -
                    amountPaid,
                  0
                ),

              status:
                resolveStatus(
                  row.status,
                  total,
                  amountPaid,
                  dueDate
                ),
            };
          }
        )
        .filter(
          (invoice) =>
            Boolean(
              invoice.invoiceDate
            )
        );

  const currentYear =
    new Date().getFullYear();

  const availableYears =
    Array.from(
      new Set([
        currentYear,

        ...invoices.map(
          (invoice) =>
            createDate(
              invoice.invoiceDate
            ).getFullYear()
        ),
      ])
    ).sort(
      (
        first,
        second
      ) =>
        second - first
    );

  const year =
    selectedYear &&
    availableYears.includes(
      selectedYear
    )
      ? selectedYear
      : currentYear;

  const invoicesForYear =
    invoices.filter(
      (invoice) =>
        invoice.status !==
          "ignored" &&
        createDate(
          invoice.invoiceDate
        ).getFullYear() === year
    );

  const previousInvoices =
    invoices.filter(
      (invoice) =>
        invoice.status !==
          "ignored" &&
        createDate(
          invoice.invoiceDate
        ).getFullYear() ===
          year - 1
    );

  const currentTotals =
    totalsForInvoices(
      invoicesForYear
    );

  const previousTotals =
    totalsForInvoices(
      previousInvoices
    );

  const monthly:
    InvoiceMonthlyStatistic[] =
      monthLabels.map(
        (
          label,
          month
        ) => ({
          month,
          label,

          total:
            invoicesForYear
              .filter(
                (invoice) =>
                  createDate(
                    invoice.invoiceDate
                  ).getMonth() ===
                    month
              )
              .reduce(
                (
                  total,
                  invoice
                ) =>
                  total +
                  invoice.total,
                0
              ),
        })
      );

  const statusDefinitions:
    Array<{
      key:
        InvoiceStatisticStatus;

      label: string;
    }> = [
      {
        key: "paid",
        label: "Betalda",
      },
      {
        key: "sent",
        label: "Skickade",
      },
      {
        key: "outstanding",
        label: "Utestående",
      },
      {
        key: "overdue",
        label: "Förfallna",
      },
    ];

  const totalInvoiceCount =
    invoicesForYear.length;

  const statuses:
    InvoiceStatusStatistic[] =
      statusDefinitions.map(
        (
          definition
        ) => {
          const count =
            invoicesForYear.filter(
              (invoice) =>
                invoice.status ===
                definition.key
            ).length;

          return {
            key:
              definition.key,

            label:
              definition.label,

            count,

            percentage:
              totalInvoiceCount > 0
                ? (
                    count /
                    totalInvoiceCount
                  ) * 100
                : 0,
          };
        }
      );

  const customerTotals =
    new Map<
      string,
      number
    >();

  for (
    const invoice of
    invoicesForYear
  ) {
    customerTotals.set(
      invoice.customerId,

      (
        customerTotals.get(
          invoice.customerId
        ) || 0
      ) + invoice.total
    );
  }

  const topCustomers:
    InvoiceTopCustomer[] =
      Array.from(
        customerTotals.entries()
      )
        .map(
          (
            [
              customerId,
              total,
            ]
          ) => ({
            id:
              customerId,

            name:
              customerNames.get(
                customerId
              ) ||
              "Okänd kund",

            total,
          })
        )
        .sort(
          (
            first,
            second
          ) =>
            second.total -
            first.total
        )
        .slice(0, 5);

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const limitDate =
    new Date(today);

  limitDate.setDate(
    limitDate.getDate() +
      30
  );

  const dueSoon:
    InvoiceDueSoonItem[] =
      invoices
        .filter(
          (invoice) => {
            if (
              invoice.status ===
                "ignored" ||
              invoice.status ===
                "paid" ||
              !invoice.dueDate ||
              invoice.outstanding <= 0
            ) {
              return false;
            }

            const dueDate =
              createDate(
                invoice.dueDate
              );

            return (
              dueDate >= today &&
              dueDate <= limitDate
            );
          }
        )
        .map(
          (invoice) => {
            const dueDate =
              createDate(
                invoice.dueDate!
              );

            const daysLeft =
              Math.ceil(
                (
                  dueDate.getTime() -
                  today.getTime()
                ) /
                  86400000
              );

            return {
              id:
                invoice.id,

              invoiceNumber:
                invoice.invoiceNumber,

              customerName:
                customerNames.get(
                  invoice.customerId
                ) ||
                "Okänd kund",

              dueDate:
                invoice.dueDate!,

              total:
                invoice.total,

              outstanding:
                invoice.outstanding,

              daysLeft,
            };
          }
        )
        .sort(
          (
            first,
            second
          ) =>
            first.daysLeft -
            second.daysLeft
        )
        .slice(0, 5);

  return {
    year,
    availableYears,

    totalInvoiceCount,

    summary: {
      ...currentTotals,

      invoicedChange:
        percentageChange(
          currentTotals
            .totalInvoiced,

          previousTotals
            .totalInvoiced
        ),

      paidChange:
        percentageChange(
          currentTotals
            .totalPaid,

          previousTotals
            .totalPaid
        ),

      outstandingChange:
        percentageChange(
          currentTotals
            .totalOutstanding,

          previousTotals
            .totalOutstanding
        ),

      overdueChange:
        percentageChange(
          currentTotals
            .totalOverdue,

          previousTotals
            .totalOverdue
        ),
    },

    monthly,
    statuses,
    topCustomers,
    dueSoon,
  };
}
