import { createClient } from "@/lib/supabase/server";

import type {
  OfferCustomerOption,
  OfferListItem,
  OfferListStatus,
  OfferProjectOption,
  OffersPageData,
} from "./offer-types";

type UnknownRow = Record<string, unknown>;

function getString(
  row: UnknownRow,
  keys: string[]
) {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return "";
}

function getNullableString(
  row: UnknownRow,
  keys: string[]
) {
  const value = getString(row, keys);

  return value || null;
}

function getNumber(
  row: UnknownRow,
  keys: string[]
) {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return 0;
}

function normalizeStatus(
  value: unknown
): OfferListStatus {
  const status = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "accepted",
      "approved",
      "won",
      "vunnen",
      "godkand",
      "godkänd",
    ].includes(status)
  ) {
    return "accepted";
  }

  if (
    [
      "declined",
      "rejected",
      "lost",
      "avbojd",
      "avböjd",
    ].includes(status)
  ) {
    return "declined";
  }

  if (
    [
      "answered",
      "replied",
      "responded",
      "besvarad",
    ].includes(status)
  ) {
    return "answered";
  }

  if (
    [
      "viewed",
      "opened",
      "oppnad",
      "öppnad",
    ].includes(status)
  ) {
    return "viewed";
  }

  if (
    [
      "sent",
      "delivered",
      "skickad",
    ].includes(status)
  ) {
    return "sent";
  }

  if (
    [
      "expired",
      "utgangen",
      "utgången",
    ].includes(status)
  ) {
    return "expired";
  }

  if (
    [
      "archived",
      "archive",
      "arkiverad",
    ].includes(status)
  ) {
    return "archived";
  }

  return "draft";
}

export async function getOffersPage(): Promise<OffersPageData> {
  const supabase = await createClient();

  const [
    offersResult,
    customersResult,
    projectsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("offers")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(500),

    (supabase as any)
      .from("customers")
      .select("id, name")
      .order("name", {
        ascending: true,
      })
      .limit(1000),

    (supabase as any)
      .from("projects")
      .select("id, title, customer_id")
      .order("title", {
        ascending: true,
      })
      .limit(1000),
  ]);

  if (offersResult.error) {
    console.error(
      "Kunde inte hämta offerter:",
      offersResult.error
    );

    throw new Error(
      offersResult.error.message ||
        "Offertregistret kunde inte hämtas."
    );
  }

  if (customersResult.error) {
    console.error(
      "Kunde inte hämta offertkunder:",
      customersResult.error
    );
  }

  if (projectsResult.error) {
    console.error(
      "Kunde inte hämta offertprojekt:",
      projectsResult.error
    );
  }

  const customers: OfferCustomerOption[] =
    (
      Array.isArray(customersResult.data)
        ? customersResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id: String(row.id ?? ""),
        name:
          String(row.name ?? "") ||
          "Namnlös kund",
      })
    );

  const projects: OfferProjectOption[] =
    (
      Array.isArray(projectsResult.data)
        ? projectsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id: String(row.id ?? ""),
        title:
          String(row.title ?? "") ||
          "Namnlöst projekt",
        customerId:
          row.customer_id == null
            ? null
            : String(row.customer_id),
      })
    );

  const customerNames = new Map(
    customers.map((customer) => [
      customer.id,
      customer.name,
    ])
  );

  const projectMap = new Map(
    projects.map((project) => [
      project.id,
      project,
    ])
  );

  const rows: UnknownRow[] =
    Array.isArray(offersResult.data)
      ? offersResult.data
      : [];

  const offers: OfferListItem[] =
    rows.map((row, index) => {
      const id = String(
        row.id ?? `offer-${index}`
      );

      const customerId =
        getNullableString(row, [
          "customer_id",
          "client_id",
        ]);

      const projectId =
        getNullableString(row, [
          "project_id",
        ]);

      const project =
        projectId
          ? projectMap.get(projectId)
          : undefined;

      const subtotalExVat =
        getNumber(row, [
          "subtotal_ex_vat",
          "subtotal",
          "amount_ex_vat",
          "total_ex_vat",
        ]);

      const vatAmount =
        getNumber(row, [
          "vat_amount",
          "tax_amount",
          "moms_amount",
        ]);

      const storedTotal =
        getNumber(row, [
          "total_inc_vat",
          "total_amount",
          "grand_total",
          "total",
        ]);

      const totalIncVat =
        storedTotal ||
        subtotalExVat + vatAmount;

      const offerNumber =
        getString(row, [
          "offer_number",
          "quote_number",
          "number",
          "reference",
        ]) ||
        `XA-OFFERT-${String(
          index + 1
        ).padStart(4, "0")}`;

      return {
        id,
        offerNumber,
        customerId,
        customerName:
          getString(row, [
            "customer_name",
            "client_name",
          ]) ||
          (customerId
            ? customerNames.get(customerId)
            : "") ||
          "Ingen kund vald",

        projectId,
        projectTitle:
          getString(row, [
            "project_title",
            "project_name",
          ]) ||
          project?.title ||
          "Fristående offert",

        title:
          getString(row, [
            "title",
            "subject",
            "name",
          ]) ||
          project?.title ||
          "Offert",

        status: normalizeStatus(
          row.status
        ),

        sentAt:
          getNullableString(row, [
            "sent_at",
            "published_at",
            "created_at",
          ]),

        validUntil:
          getNullableString(row, [
            "valid_until",
            "expires_at",
            "expiry_date",
            "due_date",
          ]),

        subtotalExVat,
        vatAmount,
        totalIncVat,

        createdAt:
          getNullableString(row, [
            "created_at",
          ]),
      };
    });

  const stats = {
    total: offers.length,

    drafts: offers.filter(
      (offer) =>
        offer.status === "draft"
    ).length,

    sent: offers.filter(
      (offer) =>
        [
          "sent",
          "viewed",
          "answered",
        ].includes(offer.status)
    ).length,

    accepted: offers.filter(
      (offer) =>
        offer.status === "accepted"
    ).length,

    declined: offers.filter(
      (offer) =>
        offer.status === "declined"
    ).length,

    archived: offers.filter(
      (offer) =>
        offer.status === "archived"
    ).length,
  };

  return {
    offers,
    customers,
    projects,
    stats,
  };
}
