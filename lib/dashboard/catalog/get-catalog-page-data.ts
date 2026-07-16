import { createClient } from "@/lib/supabase/server";

import type {
  CatalogCategory,
  CatalogPackage,
  CatalogPageData,
  CatalogService,
  CatalogServiceKind,
  CatalogUnit,
} from "./catalog-types";

type UnknownRow =
  Record<string, unknown>;

function numberValue(
  value: unknown,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function normalizeServiceKind(
  value: unknown
): CatalogServiceKind {
  return value === "addon"
    ? "addon"
    : "service";
}

export async function getCatalogPageData(): Promise<CatalogPageData> {
  const supabase =
    await createClient();

  const [
    categoriesResult,
    unitsResult,
    servicesResult,
    packagesResult,
    packageItemsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("service_categories")
      .select(`
        id,
        name,
        slug,
        description,
        icon_key,
        color_key,
        sort_order,
        is_active
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

    (supabase as any)
      .from("service_units")
      .select(`
        code,
        label,
        short_label,
        sort_order,
        is_active
      `)
      .order("sort_order", {
        ascending: true,
      }),

    (supabase as any)
      .from("services")
      .select(`
        id,
        category_id,
        code,
        name,
        short_description,
        description,
        pricing_model,
        default_unit_code,
        default_quantity,
        default_unit_price_ex_vat,
        default_vat_rate,
        customer_visible,
        service_kind,
        is_active,
        sort_order
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

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
        default_discount_percent,
        customer_visible,
        is_active,
        sort_order
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

    (supabase as any)
      .from("service_package_items")
      .select("package_id"),
  ]);

  const errors = [
    categoriesResult.error,
    unitsResult.error,
    servicesResult.error,
    packagesResult.error,
    packageItemsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error(
      "Katalogen kunde inte hämtas:",
      errors
    );

    throw new Error(
      errors[0]?.message ||
        "Mallar och paket kunde inte hämtas."
    );
  }

  const categoryRows: UnknownRow[] =
    Array.isArray(
      categoriesResult.data
    )
      ? categoriesResult.data
      : [];

  const categories: CatalogCategory[] =
    categoryRows.map((row) => ({
      id: String(row.id ?? ""),
      name:
        String(row.name ?? "") ||
        "Namnlös kategori",
      slug: String(row.slug ?? ""),
      description:
        row.description == null
          ? null
          : String(row.description),
      iconKey:
        row.icon_key == null
          ? null
          : String(row.icon_key),
      colorKey:
        row.color_key == null
          ? null
          : String(row.color_key),
      sortOrder: numberValue(
        row.sort_order
      ),
      isActive:
        row.is_active !== false,
    }));

  const units: CatalogUnit[] =
    (
      Array.isArray(unitsResult.data)
        ? unitsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        code: String(row.code ?? ""),
        label:
          String(row.label ?? "") ||
          "Enhet",
        shortLabel:
          String(
            row.short_label ?? ""
          ) || "st",
        sortOrder: numberValue(
          row.sort_order
        ),
        isActive:
          row.is_active !== false,
      })
    );

  const categoryNames = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  const services: CatalogService[] =
    (
      Array.isArray(
        servicesResult.data
      )
        ? servicesResult.data
        : []
    ).map(
      (row: UnknownRow) => {
        const categoryId =
          row.category_id == null
            ? null
            : String(row.category_id);

        return {
          id: String(row.id ?? ""),
          categoryId,
          categoryName:
            categoryId
              ? categoryNames.get(
                  categoryId
                ) ?? null
              : null,
          code:
            row.code == null
              ? null
              : String(row.code),
          name:
            String(row.name ?? "") ||
            "Namnlös tjänst",
          shortDescription:
            row.short_description == null
              ? null
              : String(
                  row.short_description
                ),
          description:
            row.description == null
              ? null
              : String(row.description),
          pricingModel:
            row.pricing_model ===
            "quantity"
              ? "quantity"
              : "fixed",
          unitCode:
            String(
              row.default_unit_code ??
                "fixed"
            ),
          quantity: numberValue(
            row.default_quantity,
            1
          ),
          unitPriceExVat:
            numberValue(
              row.default_unit_price_ex_vat
            ),
          vatRate: numberValue(
            row.default_vat_rate,
            25
          ),
          customerVisible:
            row.customer_visible !== false,
          serviceKind:
            normalizeServiceKind(
              row.service_kind
            ),
          isActive:
            row.is_active !== false,
          sortOrder: numberValue(
            row.sort_order
          ),
        };
      }
    );

  const packageItemCounts =
    new Map<string, number>();

  for (
    const row of Array.isArray(
      packageItemsResult.data
    )
      ? packageItemsResult.data
      : []
  ) {
    const packageId = String(
      row.package_id ?? ""
    );

    if (!packageId) {
      continue;
    }

    packageItemCounts.set(
      packageId,
      (packageItemCounts.get(
        packageId
      ) ?? 0) + 1
    );
  }

  const packages: CatalogPackage[] =
    (
      Array.isArray(
        packagesResult.data
      )
        ? packagesResult.data
        : []
    ).map(
      (row: UnknownRow) => {
        const id = String(
          row.id ?? ""
        );

        return {
          id,
          code:
            row.code == null
              ? null
              : String(row.code),
          name:
            String(row.name ?? "") ||
            "Namnlöst paket",
          shortDescription:
            row.short_description == null
              ? null
              : String(
                  row.short_description
                ),
          description:
            row.description == null
              ? null
              : String(row.description),
          priceMode:
            row.price_mode === "fixed"
              ? "fixed"
              : "sum_items",
          fixedPriceExVat:
            row.fixed_price_ex_vat ==
            null
              ? null
              : numberValue(
                  row.fixed_price_ex_vat
                ),
          discountPercent:
            numberValue(
              row.default_discount_percent
            ),
          customerVisible:
            row.customer_visible !== false,
          isActive:
            row.is_active !== false,
          sortOrder: numberValue(
            row.sort_order
          ),
          itemCount:
            packageItemCounts.get(id) ??
            0,
        };
      }
    );

  const standardServices =
    services.filter(
      (service) =>
        service.serviceKind ===
        "service"
    );

  const addons = services.filter(
    (service) =>
      service.serviceKind === "addon"
  );

  return {
    categories,
    units,
    services,
    packages,
    stats: {
      services:
        standardServices.length,
      addons: addons.length,
      packages: packages.length,
      categories:
        categories.length,
      inactive:
        services.filter(
          (service) =>
            !service.isActive
        ).length +
        packages.filter(
          (item) => !item.isActive
        ).length,
    },
  };
}
