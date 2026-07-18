import {
  getCompanySettings,
} from "@/lib/dashboard/settings/get-company-settings";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  InvoiceDisplayStatus,
} from "./invoice-types";

import type {
  InvoiceDetailCustomer,
  InvoiceDetailData,
  InvoiceDetailEvent,
  InvoiceDetailItem,
  InvoiceDetailPayment,
  InvoiceDetailProject,
} from "./invoice-detail-types";

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

function normalizeStatus(
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
    status !== "draft"
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

export async function getInvoiceDetailData(
  invoiceId: string
): Promise<InvoiceDetailData | null> {
  const supabase =
    await createClient();

  const invoiceResult =
    await (supabase as any)
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

  if (invoiceResult.error) {
    console.error(
      "Fakturan kunde inte hämtas:",
      invoiceResult.error
    );

    throw new Error(
      invoiceResult.error.message
    );
  }

  if (!invoiceResult.data) {
    return null;
  }

  const invoiceRow =
    invoiceResult.data as UnknownRow;

  const rawCompanySnapshot =
    invoiceRow.company_snapshot;

  const companySnapshot:
    UnknownRow | null =
      rawCompanySnapshot &&
      typeof rawCompanySnapshot ===
        "object" &&
      !Array.isArray(
        rawCompanySnapshot
      )
        ? rawCompanySnapshot as
            UnknownRow
        : null;

  const currentCompanySettings =
    companySnapshot
      ? null
      : await getCompanySettings();

  const company = {
    name:
      textValue(
        companySnapshot
          ?.company_name ??
        currentCompanySettings
          ?.companyName,
        "Xellens Agency"
      ),

    legalName:
      optionalText(
        companySnapshot
          ?.legal_name ??
        currentCompanySettings
          ?.legalName
      ),

    organizationNumber:
      optionalText(
        companySnapshot
          ?.organization_number ??
        currentCompanySettings
          ?.organizationNumber
      ),

    vatNumber:
      optionalText(
        companySnapshot
          ?.vat_number ??
        currentCompanySettings
          ?.vatNumber
      ),

    approvedForFTax:
      companySnapshot
        ?.approved_for_f_tax ===
        true ||
      currentCompanySettings
        ?.approvedForFTax ===
        true,

    address:
      optionalText(
        companySnapshot
          ?.address ??
        currentCompanySettings
          ?.address
      ),

    postalCode:
      optionalText(
        companySnapshot
          ?.postal_code ??
        currentCompanySettings
          ?.postalCode
      ),

    city:
      optionalText(
        companySnapshot
          ?.city ??
        currentCompanySettings
          ?.city
      ),

    country:
      textValue(
        companySnapshot
          ?.country ??
        currentCompanySettings
          ?.country,
        "Sverige"
      ),

    phone:
      optionalText(
        companySnapshot
          ?.phone ??
        currentCompanySettings
          ?.phone
      ),

    email:
      optionalText(
        companySnapshot
          ?.email ??
        currentCompanySettings
          ?.email
      ),

    website:
      optionalText(
        companySnapshot
          ?.website ??
        currentCompanySettings
          ?.website
      ),

    bankName:
      optionalText(
        companySnapshot
          ?.bank_name ??
        currentCompanySettings
          ?.bankName
      ),

    bankgiro:
      optionalText(
        companySnapshot
          ?.bankgiro ??
        currentCompanySettings
          ?.bankgiro
      ),

    plusgiro:
      optionalText(
        companySnapshot
          ?.plusgiro ??
        currentCompanySettings
          ?.plusgiro
      ),

    swishNumber:
      optionalText(
        companySnapshot
          ?.swish_number ??
        currentCompanySettings
          ?.swishNumber
      ),

    clearingNumber:
      optionalText(
        companySnapshot
          ?.clearing_number ??
        currentCompanySettings
          ?.clearingNumber
      ),

    accountNumber:
      optionalText(
        companySnapshot
          ?.account_number ??
        currentCompanySettings
          ?.accountNumber
      ),

    iban:
      optionalText(
        companySnapshot
          ?.iban ??
        currentCompanySettings
          ?.iban
      ),

    bicSwift:
      optionalText(
        companySnapshot
          ?.bic_swift ??
        currentCompanySettings
          ?.bicSwift
      ),

    paymentTermsDays:
      numberValue(
        companySnapshot
          ?.default_payment_terms ??
        currentCompanySettings
          ?.defaultPaymentTerms ??
        30
      ),

    defaultVatRate:
      numberValue(
        companySnapshot
          ?.default_vat_rate ??
        currentCompanySettings
          ?.defaultVatRate ??
        25
      ),

    lateInterestPercent:
      numberValue(
        companySnapshot
          ?.late_interest_percent ??
        currentCompanySettings
          ?.lateInterestPercent ??
        8
      ),

    reminderFee:
      numberValue(
        companySnapshot
          ?.reminder_fee ??
        currentCompanySettings
          ?.reminderFee ??
        60
      ),

    invoicePrefix:
      textValue(
        companySnapshot
          ?.invoice_prefix ??
        currentCompanySettings
          ?.invoicePrefix,
        "F"
      ),

    invoiceFooterText:
      optionalText(
        companySnapshot
          ?.invoice_footer_text ??
        currentCompanySettings
          ?.invoiceFooterText
      ),

    logoUrl:
      optionalText(
        companySnapshot
          ?.logo_url ??
        currentCompanySettings
          ?.logoUrl
      ),

    logoDarkUrl:
      optionalText(
        companySnapshot
          ?.logo_dark_url ??
        currentCompanySettings
          ?.logoDarkUrl
      ),

    primaryColor:
      textValue(
        companySnapshot
          ?.primary_color ??
        currentCompanySettings
          ?.primaryColor,
        "#07366F"
      ),

    emailSenderName:
      textValue(
        companySnapshot
          ?.email_sender_name ??
        currentCompanySettings
          ?.emailSenderName,
        "Xellens Agency"
      ),
  };

  const customerId =
    textValue(
      invoiceRow.customer_id
    );

  const projectId =
    optionalText(
      invoiceRow.project_id
    );

  const [
    customerResult,
    projectResult,
    itemsResult,
    paymentsResult,
    eventsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .maybeSingle(),

    projectId
      ? (supabase as any)
          .from("projects")
          .select(`
            id,
            project_number,
            title
          `)
          .eq("id", projectId)
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    (supabase as any)
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("sort_order", {
        ascending: true,
      }),

    (supabase as any)
      .from("payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", {
        ascending: false,
      }),

    (supabase as any)
      .from("invoice_events")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  const firstError =
    customerResult.error ||
    projectResult.error ||
    itemsResult.error ||
    paymentsResult.error ||
    eventsResult.error;

  if (firstError) {
    console.error(
      "Fakturadetaljer kunde inte hämtas:",
      firstError
    );

    throw new Error(
      firstError.message ||
        "Fakturadetaljerna kunde inte hämtas."
    );
  }

  if (!customerResult.data) {
    throw new Error(
      "Kunden som tillhör fakturan kunde inte hittas."
    );
  }

  const customerRow =
    customerResult.data as UnknownRow;

  const projectRow =
    projectResult.data as
      | UnknownRow
      | null;

  const totalIncVat =
    numberValue(
      invoiceRow.total_inc_vat
    );

  const amountPaid =
    numberValue(
      invoiceRow.amount_paid
    );

  const dueDate =
    optionalText(
      invoiceRow.due_date
    );

  const customer: InvoiceDetailCustomer = {
    id:
      textValue(customerRow.id),

    name:
      textValue(
        customerRow.name,
        "Namnlös kund"
      ),

    organizationNumber:
      optionalText(
        customerRow.organization_number
      ),

    contactPerson:
      optionalText(
        customerRow.contact_person
      ),

    email:
      optionalText(
        customerRow.email
      ),

    phone:
      optionalText(
        customerRow.phone
      ),

    billingEmail:
      optionalText(
        customerRow.billing_email
      ),

    billingAddress:
      optionalText(
        customerRow.billing_address
      ),

    postalCode:
      optionalText(
        customerRow.postal_code
      ),

    city:
      optionalText(
        customerRow.city
      ),

    country:
      textValue(
        customerRow.country,
        "Sverige"
      ),
  };

  const project: InvoiceDetailProject | null =
    projectRow
      ? {
          id:
            textValue(projectRow.id),

          projectNumber:
            textValue(
              projectRow.project_number
            ),

          title:
            textValue(
              projectRow.title,
              "Namnlöst projekt"
            ),
        }
      : null;

  const items: InvoiceDetailItem[] =
    (
      Array.isArray(itemsResult.data)
        ? itemsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        description:
          textValue(
            row.description,
            "Fakturarad"
          ),

        quantity:
          numberValue(
            row.quantity
          ),

        unitCode:
          textValue(
            row.unit_code,
            "st"
          ),

        unitPriceExVat:
          numberValue(
            row.unit_price_ex_vat
          ),

        discountPercent:
          numberValue(
            row.discount_percent
          ),

        vatRate:
          numberValue(
            row.vat_rate
          ),

        subtotalExVat:
          numberValue(
            row.line_subtotal_ex_vat
          ),

        vatAmount:
          numberValue(
            row.line_vat_amount
          ),

        totalIncVat:
          numberValue(
            row.line_total_inc_vat
          ),
      })
    );

  const payments: InvoiceDetailPayment[] =
    (
      Array.isArray(paymentsResult.data)
        ? paymentsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        amount:
          numberValue(
            row.amount
          ),

        currency:
          textValue(
            row.currency,
            "SEK"
          ),

        status:
          textValue(
            row.status,
            "pending"
          ),

        paymentMethod:
          optionalText(
            row.payment_method
          ),

        externalReference:
          optionalText(
            row.external_reference
          ),

        paidAt:
          optionalText(
            row.paid_at
          ),

        notes:
          optionalText(
            row.notes
          ),

        createdAt:
          textValue(
            row.created_at
          ),
      })
    );

  const events: InvoiceDetailEvent[] =
    (
      Array.isArray(eventsResult.data)
        ? eventsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        eventType:
          textValue(
            row.event_type
          ),

        title:
          textValue(
            row.title,
            "Fakturahändelse"
          ),

        description:
          optionalText(
            row.description
          ),

        createdAt:
          textValue(
            row.created_at
          ),
      })
    );

  return {
    invoice: {
      id:
        textValue(invoiceRow.id),

      invoiceNumber:
        textValue(
          invoiceRow.invoice_number,
          "Saknar nummer"
        ),

      title:
        textValue(
          invoiceRow.title,
          "Faktura"
        ),

      description:
        optionalText(
          invoiceRow.description
        ),

      status:
        normalizeStatus(
          invoiceRow.status,
          totalIncVat,
          amountPaid,
          dueDate
        ),

      invoiceDate:
        textValue(
          invoiceRow.invoice_date
        ),

      dueDate,

      subtotalExVat:
        numberValue(
          invoiceRow.subtotal_ex_vat
        ),

      vatAmount:
        numberValue(
          invoiceRow.vat_amount
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
          invoiceRow.currency,
          "SEK"
        ),

      referenceNumber:
        optionalText(
          invoiceRow.reference_number
        ),

      poNumber:
        optionalText(
          invoiceRow.po_number
        ),

      ocrNumber:
        optionalText(
          invoiceRow.ocr_number
        ),

      paymentTermsDays:
        numberValue(
          invoiceRow.payment_terms_days
        ),

      deliveryEmail:
        optionalText(
          invoiceRow.delivery_email
        ),

      sourceType:
        textValue(
          invoiceRow.source_type,
          "manual"
        ),

      notes:
        optionalText(
          invoiceRow.notes
        ),

      internalNotes:
        optionalText(
          invoiceRow.internal_notes
        ),

      sentAt:
        optionalText(
          invoiceRow.sent_at
        ),

      paidAt:
        optionalText(
          invoiceRow.paid_at
        ),

      createdAt:
        textValue(
          invoiceRow.created_at
        ),
    },

    company,
    customer,
    project,
    items,
    payments,
    events,
  };
}

