import {
  createClient,
} from "@/lib/supabase/server";

import type {
  CustomerDetail,
  CustomerDetailContact,
} from "./customer-detail-types";

export async function getCustomerDetail(
  customerId: string
): Promise<CustomerDetail | null> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await (
    supabase as any
  )
    .from("customers")
    .select(`
      id,
      customer_number,
      customer_type,
      status,
      name,
      organization_number,
      personal_identity_number,
      email,
      phone,
      website,
      address,
      postal_code,
      city,
      country,
      billing_email,
      billing_address,
      billing_postal_code,
      billing_city,
      industry,
      employee_range,
      source,
      description,
      invoice_reference,
      payment_terms,
      notes,
      customer_contacts (
        id,
        full_name,
        job_title,
        email,
        phone,
        is_primary,
        is_active
      )
    `)
    .eq(
      "id",
      customerId
    )
    .single();

  if (error) {
    if (
      error.code === "PGRST116"
    ) {
      return null;
    }

    console.error(
      "Kunde inte hämta kunden:",
      error
    );

    throw new Error(
      error.message ||
      "Kunden kunde inte hämtas."
    );
  }

  const contacts:
  CustomerDetailContact[] =
    Array.isArray(
      data.customer_contacts
    )
      ? data.customer_contacts
          .filter(
            (
              contact:
              Record<string, unknown>
            ) =>
              contact.is_active !== false
          )
          .map(
            (
              contact:
              Record<string, unknown>
            ) => ({
              id:
                String(
                  contact.id ?? ""
                ),

              fullName:
                String(
                  contact.full_name ?? ""
                ),

              jobTitle:
                String(
                  contact.job_title ?? ""
                ),

              email:
                String(
                  contact.email ?? ""
                ),

              phone:
                String(
                  contact.phone ?? ""
                ),

              isPrimary:
                contact.is_primary ===
                true,
            })
          )
      : [];

  return {
    id:
      String(
        data.id ?? ""
      ),

    customerNumber:
      String(
        data.customer_number ?? ""
      ),

    customerType:
      data.customer_type === "private"
        ? "private"
        : "company",

    status:
      data.status ?? "prospect",

    name:
      String(
        data.name ?? ""
      ),

    organizationNumber:
      String(
        data.organization_number ?? ""
      ),

    personalIdentityNumber:
      String(
        data.personal_identity_number ?? ""
      ),

    email:
      String(
        data.email ?? ""
      ),

    phone:
      String(
        data.phone ?? ""
      ),

    website:
      String(
        data.website ?? ""
      ),

    address:
      String(
        data.address ?? ""
      ),

    postalCode:
      String(
        data.postal_code ?? ""
      ),

    city:
      String(
        data.city ?? ""
      ),

    country:
      String(
        data.country ?? "Sverige"
      ),

    billingEmail:
      String(
        data.billing_email ?? ""
      ),

    billingAddress:
      String(
        data.billing_address ?? ""
      ),

    billingPostalCode:
      String(
        data.billing_postal_code ?? ""
      ),

    billingCity:
      String(
        data.billing_city ?? ""
      ),

    industry:
      String(
        data.industry ?? ""
      ),

    employeeRange:
      String(
        data.employee_range ?? ""
      ),

    source:
      String(
        data.source ?? ""
      ),

    description:
      String(
        data.description ?? ""
      ),

    invoiceReference:
      String(
        data.invoice_reference ?? ""
      ),

    paymentTerms:
      Number(
        data.payment_terms ?? 30
      ),

    notes:
      String(
        data.notes ?? ""
      ),

    contacts,
  };
}
