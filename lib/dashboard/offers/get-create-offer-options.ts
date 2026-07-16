import { createClient } from "@/lib/supabase/server";
import { getCreateProjectOptions } from "@/lib/dashboard/projects/get-create-project-options";

import type {
  CreateOfferCustomer,
  CreateOfferOptions,
  CreateOfferProject,
} from "./create-offer-types";

type UnknownRow = Record<string, unknown>;

function normalizeCustomerType(
  value: unknown
): "company" | "private" {
  const normalized = String(
    value ?? ""
  ).toLowerCase();

  if (
    [
      "private",
      "person",
      "individual",
      "private_person",
    ].includes(normalized)
  ) {
    return "private";
  }

  return "company";
}

export async function getCreateOfferOptions(): Promise<CreateOfferOptions> {
  const supabase = await createClient();

  const [
    projectOptions,
    projectsResult,
  ] = await Promise.all([
    getCreateProjectOptions(),

    (supabase as any)
      .from("projects")
      .select(`
        id,
        title,
        description,
        customer_id,
        category_id
      `)
      .order("title", {
        ascending: true,
      }),
  ]);

  if (projectsResult.error) {
    console.error(
      "Kunde inte hämta offertprojekt:",
      projectsResult.error
    );
  }

  const customers: CreateOfferCustomer[] =
    projectOptions.customers.map(
      (customer) => ({
        id: customer.id,
        name: customer.name,
        customerNumber:
          customer.customer_number,
        customerType:
          normalizeCustomerType(
            customer.customer_type
          ),
        email: customer.email,
        phone: customer.phone,
        contacts: customer.contacts.map(
          (contact) => ({
            id: contact.id,
            fullName:
              contact.full_name,
            jobTitle:
              contact.job_title,
            email: contact.email,
            phone: contact.phone,
            isPrimary:
              contact.is_primary,
          })
        ),
      })
    );

  const projectRows: UnknownRow[] =
    Array.isArray(projectsResult.data)
      ? projectsResult.data
      : [];

  const projects: CreateOfferProject[] =
    projectRows.map((row) => ({
      id: String(row.id ?? ""),
      title:
        String(row.title ?? "") ||
        "Namnlöst projekt",
      description:
        row.description == null
          ? null
          : String(row.description),
      customerId:
        row.customer_id == null
          ? null
          : String(row.customer_id),
      categoryId:
        row.category_id == null
          ? null
          : String(row.category_id),
    }));

  return {
    customers,
    projects,

    categories:
      projectOptions.categories.map(
        (category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })
      ),

    units: projectOptions.units,
    services: projectOptions.services,
    packages: projectOptions.packages,
  };
}
