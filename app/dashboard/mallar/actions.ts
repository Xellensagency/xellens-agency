"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  CatalogServiceKind,
} from "@/lib/dashboard/catalog/catalog-types";

export type CreateCatalogServiceInput = {
  serviceKind: CatalogServiceKind;
  categoryId: string;
  code: string;
  name: string;
  shortDescription: string;
  description: string;
  pricingModel:
    | "fixed"
    | "quantity";
  unitCode: string;
  quantity: number;
  unitPriceExVat: number;
  vatRate: number;
  customerVisible: boolean;
  isActive: boolean;
};

export type CreateCatalogServiceResult = {
  ok: boolean;
  serviceId?: string;
  error?: string;
};

function cleanOptionalText(
  value: string
) {
  const cleaned = value.trim();

  return cleaned || null;
}

export async function createCatalogServiceAction(
  input: CreateCatalogServiceInput
): Promise<CreateCatalogServiceResult> {
  try {
    const name = input.name.trim();

    if (!name) {
      return {
        ok: false,
        error:
          "Tjänsten måste ha ett namn.",
      };
    }

    if (
      input.serviceKind !==
        "service" &&
      input.serviceKind !== "addon"
    ) {
      return {
        ok: false,
        error:
          "Tjänstetypen är ogiltig.",
      };
    }

    if (
      input.pricingModel !== "fixed" &&
      input.pricingModel !==
        "quantity"
    ) {
      return {
        ok: false,
        error:
          "Prismodellen är ogiltig.",
      };
    }

    if (!input.unitCode.trim()) {
      return {
        ok: false,
        error: "Välj en enhet.",
      };
    }

    if (
      !Number.isFinite(
        input.unitPriceExVat
      ) ||
      input.unitPriceExVat < 0
    ) {
      return {
        ok: false,
        error:
          "Priset måste vara 0 kronor eller högre.",
      };
    }

    if (
      !Number.isFinite(
        input.quantity
      ) ||
      input.quantity <= 0
    ) {
      return {
        ok: false,
        error:
          "Standardantalet måste vara större än 0.",
      };
    }

    if (
      !Number.isFinite(
        input.vatRate
      ) ||
      input.vatRate < 0 ||
      input.vatRate > 100
    ) {
      return {
        ok: false,
        error:
          "Momsen måste vara mellan 0 och 100 procent.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      return {
        ok: false,
        error:
          "Din inloggning kunde inte verifieras.",
      };
    }

    const {
      data: latestRows,
      error: orderError,
    } = await (
      supabase as any
    )
      .from("services")
      .select("sort_order")
      .order("sort_order", {
        ascending: false,
      })
      .limit(1);

    if (orderError) {
      console.error(
        "Sorteringsordningen kunde inte hämtas:",
        orderError
      );
    }

    const currentSortOrder =
      Array.isArray(latestRows) &&
      latestRows.length > 0
        ? Number(
            latestRows[0]
              ?.sort_order ?? 0
          )
        : 0;

    const nextSortOrder =
      Number.isFinite(
        currentSortOrder
      )
        ? currentSortOrder + 10
        : 10;

    const {
      data,
      error,
    } = await (
      supabase as any
    )
      .from("services")
      .insert({
        category_id:
          input.categoryId || null,

        code: cleanOptionalText(
          input.code
        ),

        name,

        short_description:
          cleanOptionalText(
            input.shortDescription
          ),

        description:
          cleanOptionalText(
            input.description
          ),

        pricing_model:
          input.pricingModel,

        default_unit_code:
          input.unitCode,

        default_quantity:
          input.quantity,

        default_unit_price_ex_vat:
          input.unitPriceExVat,

        default_vat_rate:
          input.vatRate,

        customer_visible:
          input.customerVisible,

        service_kind:
          input.serviceKind,

        is_active:
          input.isActive,

        sort_order:
          nextSortOrder,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Tjänsten kunde inte skapas:",
        error
      );

      if (error.code === "23505") {
        return {
          ok: false,
          error:
            "Tjänstekoden används redan. Välj en annan kod.",
        };
      }

      return {
        ok: false,
        error:
          error.message ||
          "Tjänsten kunde inte sparas.",
      };
    }

    revalidatePath(
      "/dashboard/mallar"
    );

    revalidatePath(
      "/dashboard/projekt/nytt"
    );

    revalidatePath(
      "/dashboard/offerter/ny"
    );

    return {
      ok: true,
      serviceId: String(
        data?.id ?? ""
      ),
    };
  } catch (error) {
    console.error(
      "Oväntat fel när tjänsten skapades:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}

export type CreateCatalogPackageItemInput = {
  serviceId: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  isOptional: boolean;
};

export type CreateCatalogPackageInput = {
  code: string;
  name: string;
  shortDescription: string;
  description: string;
  priceMode:
    | "sum_items"
    | "fixed";
  fixedPriceExVat: number;
  discountPercent: number;
  customerVisible: boolean;
  isActive: boolean;
  items: CreateCatalogPackageItemInput[];
};

export type CreateCatalogPackageResult = {
  ok: boolean;
  packageId?: string;
  error?: string;
};

export async function createCatalogPackageAction(
  input: CreateCatalogPackageInput
): Promise<CreateCatalogPackageResult> {
  try {
    if (!input.name.trim()) {
      return {
        ok: false,
        error:
          "Paketet måste ha ett namn.",
      };
    }

    if (input.items.length === 0) {
      return {
        ok: false,
        error:
          "Välj minst en tjänst till paketet.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      return {
        ok: false,
        error:
          "Din inloggning kunde inte verifieras.",
      };
    }

    const {
      data,
      error,
    } = await (
      supabase as any
    ).rpc(
      "create_service_package",
      {
        p_payload: input,
      }
    );

    if (error) {
      console.error(
        "Paketet kunde inte skapas:",
        error
      );

      if (error.code === "23505") {
        return {
          ok: false,
          error:
            "Paketkoden används redan.",
        };
      }

      return {
        ok: false,
        error:
          error.message ||
          "Paketet kunde inte sparas.",
      };
    }

    const result =
      data &&
      typeof data === "object"
        ? (
            data as Record<
              string,
              unknown
            >
          )
        : {};

    const packageId = String(
      result.package_id ?? ""
    );

    if (!packageId) {
      return {
        ok: false,
        error:
          "Databasen returnerade inget paket-ID.",
      };
    }

    revalidatePath(
      "/dashboard/mallar"
    );

    revalidatePath(
      "/dashboard/projekt/nytt"
    );

    revalidatePath(
      "/dashboard/offerter/ny"
    );

    return {
      ok: true,
      packageId,
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel när paketet skapades:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}

export type CreateCatalogCategoryInput = {
  name: string;
  slug: string;
  description: string;
  iconKey: string;
  colorKey: string;
  isActive: boolean;
};

export type CreateCatalogCategoryResult = {
  ok: boolean;
  categoryId?: string;
  error?: string;
};

export async function createCatalogCategoryAction(
  input: CreateCatalogCategoryInput
): Promise<CreateCatalogCategoryResult> {
  try {
    const name = input.name.trim();

    if (!name) {
      return {
        ok: false,
        error: "Kategorin måste ha ett namn.",
      };
    }

    const slug = (
      input.slug.trim() || name
    )
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " och ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return {
        ok: false,
        error: "Kategorins webbadress kunde inte skapas.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        ok: false,
        error: "Din inloggning kunde inte verifieras.",
      };
    }

    const {
      data: latestRows,
      error: orderError,
    } = await (supabase as any)
      .from("service_categories")
      .select("sort_order")
      .order("sort_order", {
        ascending: false,
      })
      .limit(1);

    if (orderError) {
      console.error(
        "Sorteringsordningen kunde inte hämtas:",
        orderError
      );
    }

    const currentSortOrder =
      Array.isArray(latestRows) &&
      latestRows.length > 0
        ? Number(
            latestRows[0]?.sort_order ?? 0
          )
        : 0;

    const nextSortOrder =
      Number.isFinite(currentSortOrder)
        ? currentSortOrder + 10
        : 10;

    const cleanText = (
      value: string
    ) => {
      const cleaned = value.trim();

      return cleaned || null;
    };

    const {
      data,
      error,
    } = await (supabase as any)
      .from("service_categories")
      .insert({
        name,
        slug,
        description:
          cleanText(input.description),
        icon_key:
          cleanText(input.iconKey),
        color_key:
          cleanText(input.colorKey),
        is_active:
          input.isActive,
        sort_order:
          nextSortOrder,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Kategorin kunde inte skapas:",
        error
      );

      if (error.code === "23505") {
        return {
          ok: false,
          error:
            "Det finns redan en kategori med samma namn eller webbadress.",
        };
      }

      return {
        ok: false,
        error:
          error.message ||
          "Kategorin kunde inte sparas.",
      };
    }

    revalidatePath(
      "/dashboard/mallar"
    );

    revalidatePath(
      "/dashboard/mallar/tjanster/ny"
    );

    revalidatePath(
      "/dashboard/projekt/nytt"
    );

    revalidatePath(
      "/dashboard/offerter/ny"
    );

    return {
      ok: true,
      categoryId: String(
        data?.id ?? ""
      ),
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel när kategorin skapades:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}
