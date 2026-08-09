import { createClient } from "@/lib/supabase/server";

import type {
  OfferAddonDraft,
  OfferDiscountDraft,
  OfferDraft,
  OfferServiceDraft,
} from "./create-offer-types";


type UnknownRow =
  Record<string, unknown>;


export type OfferEditData = {
  offerId: string;
  offerNumber: string;
  status: string;
  draft: OfferDraft;
  services: OfferServiceDraft[];
  addons: OfferAddonDraft[];
  discount: OfferDiscountDraft;
};


function asObject(
  value: unknown
): UnknownRow {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRow;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed as UnknownRow;
      }
    }
    catch {
      return {};
    }
  }

  return {};
}


function asArray(
  value: unknown
): unknown[] {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    }
    catch {
      return [];
    }
  }

  return [];
}


function getString(
  row: UnknownRow,
  keys: string[],
  fallback = ""
) {
  for (
    const key
    of keys
  ) {
    const value =
      row[key];

    if (
      value !== null &&
      value !== undefined
    ) {
      return String(
        value
      );
    }
  }

  return fallback;
}


function getNumber(
  row: UnknownRow,
  keys: string[],
  fallback = 0
) {
  for (
    const key
    of keys
  ) {
    const value =
      Number(
        row[key]
      );

    if (
      Number.isFinite(
        value
      )
    ) {
      return value;
    }
  }

  return fallback;
}


function getBoolean(
  row: UnknownRow,
  keys: string[],
  fallback: boolean
) {
  for (
    const key
    of keys
  ) {
    const value =
      row[key];

    if (
      typeof value ===
      "boolean"
    ) {
      return value;
    }
  }

  return fallback;
}


function parseService(
  value: unknown,
  index: number,
  addon = false
): OfferServiceDraft {
  const row =
    asObject(value);

  return {
    id:
      getString(
        row,
        ["id"],
        `${addon ? "addon" : "service"}-${index}`
      ),

    sourceServiceId:
      getString(
        row,
        [
          "sourceServiceId",
          "source_service_id",
        ]
      ) || null,

    sourcePackageId:
      getString(
        row,
        [
          "sourcePackageId",
          "source_package_id",
        ]
      ) || null,

    categoryId:
      getString(
        row,
        [
          "categoryId",
          "category_id",
        ]
      ) || null,

    name:
      getString(
        row,
        [
          "name",
          "service_name",
        ],
        addon
          ? "Tillägg"
          : "Tjänst"
      ),

    description:
      getString(
        row,
        ["description"]
      ),

    pricingModel:
      getString(
        row,
        [
          "pricingModel",
          "pricing_model",
        ],
        "fixed"
      ) === "quantity"
        ? "quantity"
        : "fixed",

    unitCode:
      getString(
        row,
        [
          "unitCode",
          "unit_code",
        ],
        "fixed"
      ),

    quantity:
      Math.max(
        1,
        getNumber(
          row,
          ["quantity"],
          1
        )
      ),

    unitPriceExVat:
      Math.max(
        0,
        getNumber(
          row,
          [
            "unitPriceExVat",
            "unit_price_ex_vat",
          ]
        )
      ),

    discountPercent:
      Math.min(
        100,
        Math.max(
          0,
          getNumber(
            row,
            [
              "discountPercent",
              "discount_percent",
            ]
          )
        )
      ),

    vatRate:
      Math.max(
        0,
        getNumber(
          row,
          [
            "vatRate",
            "vat_rate",
          ],
          25
        )
      ),

    customerVisible:
      getBoolean(
        row,
        [
          "customerVisible",
          "customer_visible",
        ],
        true
      ),

    isOptional:
      getBoolean(
        row,
        [
          "isOptional",
          "is_optional",
        ],
        addon
      ),
  };
}


export async function getOfferEditData(
  offerId: string
): Promise<
  OfferEditData | null
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await (
    supabase as any
  )
    .from("offers")
    .select("*")
    .eq(
      "id",
      offerId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
      "Offerten kunde inte hämtas."
    );
  }

  if (!data) {
    return null;
  }

  const row =
    data as UnknownRow;

  const payload =
    asObject(
      row.payload ??
      row.offer_data ??
      row.data ??
      row.snapshot
    );

  const storedDraft =
    asObject(
      payload.draft ??
      row.draft
    );

  const storedDiscount =
    asObject(
      payload.discount ??
      row.discount
    );

  const serviceRows =
    asArray(
      payload.services ??
      row.services ??
      row.offer_services
    );

  const addonRows =
    asArray(
      payload.addons ??
      row.addons ??
      row.offer_addons
    );


  const draft:
    OfferDraft = {
      customerMode:
        getString(
          storedDraft,
          ["customerMode"],
          row.customer_id
            ? "existing"
            : "new"
        ) === "new"
          ? "new"
          : "existing",

      customerId:
        getString(
          storedDraft,
          ["customerId"]
        ) ||
        getString(
          row,
          ["customer_id"]
        ),

      contactId:
        getString(
          storedDraft,
          ["contactId"]
        ),

      newCustomerType:
        getString(
          storedDraft,
          [
            "newCustomerType",
          ],
          "company"
        ) === "private"
          ? "private"
          : "company",

      newCustomerName:
        getString(
          storedDraft,
          ["newCustomerName"]
        ) ||
        getString(
          row,
          ["customer_name"]
        ),

      newCustomerEmail:
        getString(
          storedDraft,
          ["newCustomerEmail"]
        ) ||
        getString(
          row,
          ["customer_email"]
        ),

      newCustomerPhone:
        getString(
          storedDraft,
          ["newCustomerPhone"]
        ) ||
        getString(
          row,
          ["customer_phone"]
        ),

      existingProjectId:
        getString(
          storedDraft,
          ["existingProjectId"]
        ) ||
        getString(
          row,
          ["project_id"]
        ),

      title:
        getString(
          storedDraft,
          ["title"]
        ) ||
        getString(
          row,
          ["title"]
        ),

      description:
        getString(
          storedDraft,
          ["description"]
        ) ||
        getString(
          row,
          ["description"]
        ),

      categoryId:
        getString(
          storedDraft,
          ["categoryId"]
        ) ||
        getString(
          row,
          ["category_id"]
        ),

      desiredStartDate:
        getString(
          storedDraft,
          ["desiredStartDate"]
        ) ||
        getString(
          row,
          [
            "desired_start_date",
            "start_date",
          ]
        ),

      internalNote:
        getString(
          storedDraft,
          ["internalNote"]
        ) ||
        getString(
          row,
          [
            "internal_note",
            "internal_notes",
          ]
        ),

      validDays:
        getString(
          storedDraft,
          ["validDays"]
        ) ||
        getString(
          row,
          ["valid_days"],
          "30"
        ),

      language:
        getString(
          storedDraft,
          ["language"],
          "sv"
        ) === "en"
          ? "en"
          : "sv",

      currency:
        (
          ["SEK", "EUR", "USD"]
            .includes(
              getString(
                storedDraft,
                ["currency"]
              ) ||
              getString(
                row,
                ["currency"]
              )
            )
        )
          ? (
              getString(
                storedDraft,
                ["currency"]
              ) ||
              getString(
                row,
                ["currency"]
              )
            ) as
              | "SEK"
              | "EUR"
              | "USD"
          : "SEK",

      customerMessage:
        getString(
          storedDraft,
          ["customerMessage"]
        ) ||
        getString(
          row,
          ["customer_message"]
        ),

      termsText:
        getString(
          storedDraft,
          ["termsText"]
        ) ||
        getString(
          row,
          [
            "terms_text",
            "terms",
          ]
        ),

      paymentTerms:
        getString(
          storedDraft,
          ["paymentTerms"]
        ) ||
        getString(
          row,
          ["payment_terms"]
        ),

      includeDetailedPricing:
        getBoolean(
          storedDraft,
          ["includeDetailedPricing"],
          true
        ),

      showVat:
        getBoolean(
          storedDraft,
          ["showVat"],
          true
        ),

      includePdf:
        getBoolean(
          storedDraft,
          ["includePdf"],
          true
        ),

      sendCopyToSelf:
        getBoolean(
          storedDraft,
          ["sendCopyToSelf"],
          true
        ),
    };


  const discount:
    OfferDiscountDraft = {
      mode:
        getString(
          storedDiscount,
          ["mode"],
          "none"
        ) === "percent"
          ? "percent"
          : getString(
                storedDiscount,
                ["mode"]
              ) === "fixed"
            ? "fixed"
            : "none",

      value:
        Math.max(
          0,
          getNumber(
            storedDiscount,
            ["value"]
          )
        ),

      label:
        getString(
          storedDiscount,
          ["label"]
        ),

      code:
        getString(
          storedDiscount,
          ["code"]
        ),
    };


  return {
    offerId:
      String(
        row.id
      ),

    offerNumber:
      getString(
        row,
        [
          "offer_number",
          "quote_number",
          "number",
        ]
      ),

    status:
      getString(
        row,
        ["status"],
        "draft"
      ),

    draft,

    services:
      serviceRows.map(
        (
          item,
          index
        ) =>
          parseService(
            item,
            index
          )
      ),

    addons:
      addonRows.map(
        (
          item,
          index
        ) =>
          parseService(
            item,
            index,
            true
          )
      ),

    discount,
  };
}