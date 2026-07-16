import { createClient } from "@/lib/supabase/server";

import type {
  InvoiceCustomerOption,
  InvoiceDisplayStatus,
  InvoiceListItem,
  InvoiceOverviewData,
} from "./invoice-types";

type UnknownRow =
  Record<string, unknown>;

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
  const valueAsText =
    textValue(value).trim();

  return valueAsText || null;
}

function numberValue(
  value: unknown
) {
  const number =
    Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function resolveInvoiceStatus(
  rawStatus: unknown,
  totalAmount: number,
  amountPaid: number,
  dueDate: string | null
): InvoiceDisplayStatus {
  const status =
    textValue(
      rawStatus,
      "draft"
    ).toLowerCase();

  const outstanding =
    Math.max(
      totalAmount - amountPaid,
      0
    );

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancelled";
  }

  if (
    status === "credited" ||
    status === "credit"
  ) {
    return "credited";
  }

  if (
    totalAmount > 0 &&
    outstanding <= 0
  ) {
    return "paid";
  }

  if (
    amountPaid > 0 &&
    outstanding > 0
  ) {
    return "partially_paid";
  }

  if (
    dueDate &&
    (
      status === "sent" ||
      status === "overdue"
    )
  ) {
    const due =
      new Date(
        `${dueDate}T23:59:59`
      );

    if (
      due.getTime() <
      Date.now()
    ) {
      return "overdue";
    }
  }

  if (status === "paid") {
    return "paid";
  }

  if (status === "sent") {
    return "sent";
  }

  return "draft";
}

export async function getInvoiceOverviewData(): Promise<InvoiceOverviewData> {
  const supabase =
    await createClient();

  const [
    invoicesResult,
    customersResult,
    projectsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("invoices")
      .select("*")
      .order("invoice_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(500),

    (supabase as any)
      .from("customers")
      .select("id, name")
      .order("name", {
        ascending: true,
      }),

    (supabase as any)
      .from("projects")
      .select("id, title"),
  ]);

  const firstError =
    invoicesResult.error ||
    customersResult.error ||
    projectsResult.error;

  if (firstError) {
    console.error(
      "Fakturaöversikten kunde inte hämtas:",
      firstError
    );

    throw new Error(
      firstError.message ||
        "Fakturorna kunde inte hämtas."
    );
  }

  const customerRows: UnknownRow[] =
    Array.isArray(
      customersResult.data
    )
      ? customersResult.data
      : [];

  const projectRows: UnknownRow[] =
    Array.isArray(
      projectsResult.data
    )
      ? projectsResult.data
      : [];

  const invoiceRows: UnknownRow[] =
    Array.isArray(
      invoicesResult.data
    )
      ? invoicesResult.data
      : [];

  const customers: InvoiceCustomerOption[] =
    customerRows.map(
      (row) => ({
        id: textValue(row.id),

        name:
          textValue(row.name) ||
          "Namnlös kund",
      })
    );

  const customerNames =
    new Map<string, string>(
      customers.map(
        (customer) => [
          customer.id,
          customer.name,
        ]
      )
    );

  const projectNames =
    new Map<string, string>(
      projectRows.map(
        (row) => [
          textValue(row.id),
          textValue(
            row.title,
            "Namnlöst projekt"
          ),
        ]
      )
    );

  const invoices: InvoiceListItem[] =
    invoiceRows.map(
      (row) => {
        const totalIncVat =
          numberValue(
            row.total_inc_vat
          );

        const amountPaid =
          numberValue(
            row.amount_paid
          );

        const customerId =
          textValue(
            row.customer_id
          );

        const projectId =
          optionalText(
            row.project_id
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

          customerId,

          customerName:
            customerNames.get(
              customerId
            ) ||
            "Okänd kund",

          projectId,

          projectName:
            projectId
              ? projectNames.get(
                  projectId
                ) || "Okänt projekt"
              : null,

          title:
            textValue(
              row.title,
              "Faktura"
            ),

          description:
            optionalText(
              row.description
            ),

          invoiceDate:
            textValue(
              row.invoice_date
            ),

          dueDate,

          subtotalExVat:
            numberValue(
              row.subtotal_ex_vat
            ),

          vatAmount:
            numberValue(
              row.vat_amount
            ),

          totalIncVat,

          amountPaid,

          outstandingAmount:
            Math.max(
              totalIncVat -
                amountPaid,
              0
            ),

          currency:
            textValue(
              row.currency,
              "SEK"
            ),

          status:
            resolveInvoiceStatus(
              row.status,
              totalIncVat,
              amountPaid,
              dueDate
            ),

          sourceType:
            textValue(
              row.source_type,
              "manual"
            ),

          sentAt:
            optionalText(
              row.sent_at
            ),

          paidAt:
            optionalText(
              row.paid_at
            ),
        };
      }
    );

  const currentYear =
    new Date().getFullYear();

  const invoicesThisYear =
    invoices.filter(
      (invoice) =>
        invoice.invoiceDate
          .startsWith(
            String(currentYear)
          )
    );

  const activeInvoices =
    invoicesThisYear.filter(
      (invoice) =>
        invoice.status !==
          "cancelled" &&
        invoice.status !==
          "credited"
    );

  const paidInvoices =
    activeInvoices.filter(
      (invoice) =>
        invoice.status === "paid"
    );

  const outstandingInvoices =
    activeInvoices.filter(
      (invoice) =>
        invoice.outstandingAmount >
        0
    );

  const overdueInvoices =
    activeInvoices.filter(
      (invoice) =>
        invoice.status ===
        "overdue"
    );

  return {
    invoices,
    customers,
    currentYear,

    summary: {
      totalInvoiced:
        activeInvoices.reduce(
          (total, invoice) =>
            total +
            invoice.totalIncVat,
          0
        ),

      totalInvoicedCount:
        activeInvoices.length,

      totalPaid:
        activeInvoices.reduce(
          (total, invoice) =>
            total +
            invoice.amountPaid,
          0
        ),

      paidCount:
        paidInvoices.length,

      totalOutstanding:
        outstandingInvoices.reduce(
          (total, invoice) =>
            total +
            invoice.outstandingAmount,
          0
        ),

      outstandingCount:
        outstandingInvoices.length,

      totalOverdue:
        overdueInvoices.reduce(
          (total, invoice) =>
            total +
            invoice.outstandingAmount,
          0
        ),

      overdueCount:
        overdueInvoices.length,
    },
  };
}
