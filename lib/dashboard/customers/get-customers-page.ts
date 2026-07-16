import { createClient } from "@/lib/supabase/server";

import type {
  CustomerListContact,
  CustomerListItem,
  CustomerListStats,
  CustomerListType,
} from "./customer-types";

function normalizeCustomerType(
  value: unknown
): CustomerListType {
  const normalized = String(
    value ?? ""
  ).toLowerCase();

  if (
    normalized === "private" ||
    normalized === "person" ||
    normalized === "individual" ||
    normalized === "private_person"
  ) {
    return "private";
  }

  return "company";
}

function normalizeContact(
  value: unknown
): CustomerListContact | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const contact =
    value as Record<string, unknown>;

  const id = String(
    contact.id ?? ""
  );

  if (!id) {
    return null;
  }

  return {
    id,
    fullName: String(
      contact.full_name ?? ""
    ),
    jobTitle:
      contact.job_title == null
        ? null
        : String(contact.job_title),
    email:
      contact.email == null
        ? null
        : String(contact.email),
    phone:
      contact.phone == null
        ? null
        : String(contact.phone),
    isPrimary:
      contact.is_primary === true,
  };
}

export async function getCustomersPage(): Promise<{
  customers: CustomerListItem[];
  stats: CustomerListStats;
}> {
  const supabase = await createClient();

  const result = await (
    supabase as any
  )
    .from("customers")
    .select(`
      id,
      customer_number,
      name,
      customer_type,
      status,
      email,
      phone,
      customer_contacts (
        id,
        full_name,
        job_title,
        email,
        phone,
        is_primary
      )
    `)
    .order("name", {
      ascending: true,
    })
    .limit(500);

  if (result.error) {
    console.error(
      "Kunde inte hämta kunder:",
      result.error
    );

    throw new Error(
      result.error.message ||
        "Kundregistret kunde inte hämtas."
    );
  }

  const rows = Array.isArray(result.data)
    ? result.data
    : [];

  const customers: CustomerListItem[] =
    rows.map(
      (
        rawRow: Record<string, unknown>
      ) => {
        const rawContacts =
          Array.isArray(
            rawRow.customer_contacts
          )
            ? rawRow.customer_contacts
            : [];

        const contacts = rawContacts
          .map(normalizeContact)
          .filter(
            (
              contact
            ): contact is CustomerListContact =>
              contact !== null
          )
          .sort((first, second) => {
            if (
              first.isPrimary ===
              second.isPrimary
            ) {
              return first.fullName.localeCompare(
                second.fullName,
                "sv"
              );
            }

            return first.isPrimary
              ? -1
              : 1;
          });

        return {
          id: String(rawRow.id ?? ""),
          customerNumber: String(
            rawRow.customer_number ?? ""
          ),
          name:
            String(rawRow.name ?? "") ||
            "Namnlös kund",
          customerType:
            normalizeCustomerType(
              rawRow.customer_type
            ),
          status:
            String(
              rawRow.status ?? "prospect"
            ),
          email:
            rawRow.email == null
              ? null
              : String(rawRow.email),
          phone:
            rawRow.phone == null
              ? null
              : String(rawRow.phone),
          contacts,
        };
      }
    );

  const stats: CustomerListStats = {
    total: customers.length,
    active: customers.filter(
      (customer) =>
        customer.status === "active"
    ).length,
    prospects: customers.filter(
      (customer) =>
        customer.status === "prospect"
    ).length,
    companies: customers.filter(
      (customer) =>
        customer.customerType ===
        "company"
    ).length,
    privateCustomers: customers.filter(
      (customer) =>
        customer.customerType ===
        "private"
    ).length,
  };

  return {
    customers,
    stats,
  };
}
