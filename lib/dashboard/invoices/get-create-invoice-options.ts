import { createClient } from "@/lib/supabase/server";

import type {
  InvoiceCatalogKind,
  InvoiceCreateCustomer,
  InvoiceCreateOptions,
  InvoiceCreatePackage,
  InvoiceCreatePackageItem,
  InvoiceCreateProject,
  InvoiceCreateService,
  InvoiceCreateUnit,
} from "./create-invoice-types";

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

function serviceKind(
  value: unknown
): InvoiceCatalogKind {
  return value === "addon"
    ? "addon"
    : "service";
}

export async function getCreateInvoiceOptions(): Promise<InvoiceCreateOptions> {
  const supabase =
    await createClient();

  const [
    customersResult,
    projectsResult,
    servicesResult,
    packagesResult,
    packageItemsResult,
    unitsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("customers")
      .select(`
        id,
        name,
        organization_number,
        email,
        billing_email,
        billing_address,
        postal_code,
        city,
        country
      `)
      .order("name"),

    (supabase as any)
      .from("projects")
      .select(`
        id,
        customer_id,
        title
      `)
      .order("created_at", {
        ascending: false,
      }),

    (supabase as any)
      .from("services")
      .select(`
        id,
        name,
        short_description,
        description,
        service_kind,
        default_unit_code,
        default_unit_price_ex_vat,
        default_vat_rate
      `)
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),

    (supabase as any)
      .from("service_packages")
      .select(`
        id,
        code,
        name,
        short_description,
        description,
        price_mode,
        fixed_price_ex_vat,
        default_discount_percent
      `)
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),

    (supabase as any)
      .from("service_package_items")
      .select(`
        package_id,
        service_id,
        quantity,
        unit_code,
        unit_price_ex_vat,
        discount_percent,
        is_optional,
        sort_order
      `)
      .order("sort_order"),

    (supabase as any)
      .from("service_units")
      .select(`
        code,
        label,
        short_label
      `)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const firstError =
    customersResult.error ||
    projectsResult.error ||
    servicesResult.error ||
    packagesResult.error ||
    packageItemsResult.error ||
    unitsResult.error;

  if (firstError) {
    console.error(
      "Fakturakatalogen kunde inte hämtas:",
      firstError
    );

    throw new Error(
      firstError.message ||
        "Fakturakatalogen kunde inte hämtas."
    );
  }

  const customers: InvoiceCreateCustomer[] =
    (
      Array.isArray(
        customersResult.data
      )
        ? customersResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        name:
          textValue(
            row.name,
            "Namnlös kund"
          ),

        organizationNumber:
          optionalText(
            row.organization_number
          ),

        email:
          optionalText(row.email),

        billingEmail:
          optionalText(
            row.billing_email
          ),

        billingAddress:
          optionalText(
            row.billing_address
          ),

        postalCode:
          optionalText(
            row.postal_code
          ),

        city:
          optionalText(row.city),

        country:
          textValue(
            row.country,
            "Sverige"
          ),
      })
    );

  const projects: InvoiceCreateProject[] =
    (
      Array.isArray(
        projectsResult.data
      )
        ? projectsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        customerId:
          textValue(
            row.customer_id
          ),

        title:
          textValue(
            row.title,
            "Namnlöst projekt"
          ),
      })
    );

  const services: InvoiceCreateService[] =
    (
      Array.isArray(
        servicesResult.data
      )
        ? servicesResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id:
          textValue(row.id),

        name:
          textValue(
            row.name,
            "Namnlös tjänst"
          ),

        description:
          optionalText(
            row.short_description ??
              row.description
          ),

        kind:
          serviceKind(
            row.service_kind
          ),

        unitCode:
          textValue(
            row.default_unit_code,
            "st"
          ),

        unitPriceExVat:
          numberValue(
            row.default_unit_price_ex_vat
          ),

        vatRate:
          numberValue(
            row.default_vat_rate
          ) || 25,
      })
    );

  const serviceMap =
    new Map<
      string,
      InvoiceCreateService
    >(
      services.map(
        (service) => [
          service.id,
          service,
        ]
      )
    );

  const rawPackageItems: UnknownRow[] =
    Array.isArray(
      packageItemsResult.data
    )
      ? packageItemsResult.data
      : [];

  const packages: InvoiceCreatePackage[] =
    (
      Array.isArray(
        packagesResult.data
      )
        ? packagesResult.data
        : []
    ).map(
      (row: UnknownRow) => {
        const packageId =
          textValue(row.id);

        const items: InvoiceCreatePackageItem[] =
          rawPackageItems
            .filter(
              (item) =>
                textValue(
                  item.package_id
                ) === packageId
            )
            .map(
              (item) => {
                const service =
                  serviceMap.get(
                    textValue(
                      item.service_id
                    )
                  );

                return {
                  serviceId:
                    textValue(
                      item.service_id
                    ),

                  serviceName:
                    service?.name ||
                    "Okänd tjänst",

                  quantity:
                    numberValue(
                      item.quantity
                    ) || 1,

                  unitCode:
                    optionalText(
                      item.unit_code
                    ) ||
                    service?.unitCode ||
                    "st",

                  unitPriceExVat:
                    item.unit_price_ex_vat !==
                      null &&
                    item.unit_price_ex_vat !==
                      undefined
                      ? numberValue(
                          item.unit_price_ex_vat
                        )
                      : service
                          ?.unitPriceExVat ||
                        0,

                  discountPercent:
                    numberValue(
                      item.discount_percent
                    ),

                  vatRate:
                    service?.vatRate ||
                    25,

                  isOptional:
                    item.is_optional ===
                    true,

                  sortOrder:
                    numberValue(
                      item.sort_order
                    ),
                };
              }
            )
            .sort(
              (first, second) =>
                first.sortOrder -
                second.sortOrder
            );

        return {
          id:
            packageId,

          code:
            optionalText(row.code),

          name:
            textValue(
              row.name,
              "Namnlöst paket"
            ),

          description:
            optionalText(
              row.short_description ??
                row.description
            ),

          priceMode:
            row.price_mode ===
            "fixed"
              ? "fixed"
              : "sum_items",

          fixedPriceExVat:
            numberValue(
              row.fixed_price_ex_vat
            ),

          defaultDiscountPercent:
            numberValue(
              row.default_discount_percent
            ),

          items,
        };
      }
    );

  const units: InvoiceCreateUnit[] =
    (
      Array.isArray(
        unitsResult.data
      )
        ? unitsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        code:
          textValue(row.code),

        label:
          textValue(
            row.label,
            textValue(row.code)
          ),

        shortLabel:
          textValue(
            row.short_label,
            textValue(row.code)
          ),
      })
    );

  return {
    customers,
    projects,
    services,
    packages,

    units:
      units.length > 0
        ? units
        : [
            {
              code: "st",
              label: "Styck",
              shortLabel: "st",
            },
          ],
  };
}
