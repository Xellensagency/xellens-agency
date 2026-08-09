import { createClient } from "@/lib/supabase/server";


type UnknownRow =
  Record<string, unknown>;


export type OfferDetailStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "answered"
  | "accepted"
  | "declined"
  | "expired"
  | "archived";


export type OfferDetailLine = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
  subtotalExVat: number;
  isOptional: boolean;
  customerVisible: boolean;
  lineType:
    | "service"
    | "addon";
};


export type OfferDetailActivity = {
  id: string;
  label: string;
  description: string;
  occurredAt: string | null;
  tone:
    | "neutral"
    | "success"
    | "warning"
    | "danger";
};


export type OfferDetailData = {
  id: string;
  offerNumber: string;
  title: string;
  description: string;
  status: OfferDetailStatus;

  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  contactName: string;

  projectId: string | null;
  projectTitle: string;

  categoryName: string;
  desiredStartDate: string | null;

  currency: string;
  validDays: number;
  validUntil: string | null;

  customerMessage: string;
  paymentTerms: string;
  termsText: string;

  includeDetailedPricing: boolean;
  showVat: boolean;
  includePdf: boolean;

  lines: OfferDetailLine[];

  subtotalBeforeDiscount: number;
  discountLabel: string;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  totalIncVat: number;

  createdAt: string | null;
  updatedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;

  activity: OfferDetailActivity[];
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
  if (Array.isArray(value)) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    }
    catch {
      return [];
    }
  }

  return [];
}


function stringValue(
  row: UnknownRow,
  keys: string[],
  fallback = ""
) {
  for (const key of keys) {
    const value =
      row[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return fallback;
}


function nullableString(
  row: UnknownRow,
  keys: string[]
) {
  const value =
    stringValue(
      row,
      keys
    );

  return value || null;
}


function numberValue(
  row: UnknownRow,
  keys: string[],
  fallback = 0
) {
  for (const key of keys) {
    const value =
      row[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      const number =
        Number(value);

      if (
        Number.isFinite(number)
      ) {
        return number;
      }
    }
  }

  return fallback;
}


function booleanValue(
  row: UnknownRow,
  keys: string[],
  fallback: boolean
) {
  for (const key of keys) {
    const value =
      row[key];

    if (
      typeof value === "boolean"
    ) {
      return value;
    }

    if (
      value === 1 ||
      value === "1" ||
      value === "true"
    ) {
      return true;
    }

    if (
      value === 0 ||
      value === "0" ||
      value === "false"
    ) {
      return false;
    }
  }

  return fallback;
}


function normalizeStatus(
  value: unknown
): OfferDetailStatus {
  const status =
    String(
      value ?? ""
    )
      .trim()
      .toLowerCase();

  if (
    [
      "accepted",
      "approved",
      "won",
      "godkänd",
      "godkand",
      "vunnen",
    ].includes(status)
  ) {
    return "accepted";
  }

  if (
    [
      "declined",
      "rejected",
      "lost",
      "avböjd",
      "avbojd",
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
      "öppnad",
      "oppnad",
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
      "utgången",
      "utgangen",
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


function parseLine(
  value: unknown,
  index: number,
  lineType:
    | "service"
    | "addon"
): OfferDetailLine {
  const row =
    asObject(value);

  const quantity =
    Math.max(
      0,
      numberValue(
        row,
        [
          "quantity",
          "qty",
        ],
        1
      )
    );

  const unitPrice =
    Math.max(
      0,
      numberValue(
        row,
        [
          "unitPriceExVat",
          "unit_price_ex_vat",
          "price",
          "unit_price",
        ]
      )
    );

  const discount =
    Math.min(
      100,
      Math.max(
        0,
        numberValue(
          row,
          [
            "discountPercent",
            "discount_percent",
          ]
        )
      )
    );

  const subtotal =
    quantity *
    unitPrice *
    (
      1 -
      discount / 100
    );

  return {
    id:
      stringValue(
        row,
        ["id"],
        `${lineType}-${index}`
      ),

    name:
      stringValue(
        row,
        [
          "name",
          "title",
          "service_name",
        ],
        lineType === "addon"
          ? "Tillägg"
          : "Tjänst"
      ),

    description:
      stringValue(
        row,
        [
          "description",
          "short_description",
        ]
      ),

    quantity,

    unitCode:
      stringValue(
        row,
        [
          "unitCode",
          "unit_code",
          "unit",
        ],
        "st"
      ),

    unitPriceExVat:
      unitPrice,

    discountPercent:
      discount,

    vatRate:
      Math.max(
        0,
        numberValue(
          row,
          [
            "vatRate",
            "vat_rate",
          ],
          25
        )
      ),

    subtotalExVat:
      subtotal,

    isOptional:
      booleanValue(
        row,
        [
          "isOptional",
          "is_optional",
        ],
        lineType === "addon"
      ),

    customerVisible:
      booleanValue(
        row,
        [
          "customerVisible",
          "customer_visible",
        ],
        true
      ),

    lineType,
  };
}


export async function getOfferDetail(
  offerId: string
): Promise<
  OfferDetailData | null
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
    console.error(
      "Kunde inte hämta offerten:",
      error
    );

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

  const draft =
    asObject(
      payload.draft ??
      row.draft
    );

  const discount =
    asObject(
      payload.discount ??
      row.discount
    );

  const serviceValues =
    asArray(
      payload.services ??
      row.services ??
      row.offer_services
    );

  const addonValues =
    asArray(
      payload.addons ??
      row.addons ??
      row.offer_addons
    );

  const lines = [
    ...serviceValues.map(
      (
        item,
        index
      ) =>
        parseLine(
          item,
          index,
          "service"
        )
    ),

    ...addonValues.map(
      (
        item,
        index
      ) =>
        parseLine(
          item,
          index,
          "addon"
        )
    ),
  ];


  const customerId =
    nullableString(
      row,
      [
        "customer_id",
        "client_id",
      ]
    ) ||
    nullableString(
      draft,
      [
        "customerId",
        "customer_id",
      ]
    );


  const projectId =
    nullableString(
      row,
      ["project_id"]
    ) ||
    nullableString(
      draft,
      [
        "existingProjectId",
        "projectId",
      ]
    );


  let customerRow:
    UnknownRow = {};

  let projectRow:
    UnknownRow = {};


  if (customerId) {
    const customerResult =
      await (
        supabase as any
      )
        .from("customers")
        .select("*")
        .eq(
          "id",
          customerId
        )
        .maybeSingle();

    if (
      !customerResult.error &&
      customerResult.data
    ) {
      customerRow =
        customerResult.data;
    }
  }


  if (projectId) {
    const projectResult =
      await (
        supabase as any
      )
        .from("projects")
        .select("*")
        .eq(
          "id",
          projectId
        )
        .maybeSingle();

    if (
      !projectResult.error &&
      projectResult.data
    ) {
      projectRow =
        projectResult.data;
    }
  }


  const customerName =
    stringValue(
      row,
      [
        "customer_name",
        "client_name",
      ]
    ) ||
    stringValue(
      customerRow,
      ["name"]
    ) ||
    stringValue(
      draft,
      [
        "newCustomerName",
        "customerName",
      ],
      "Ingen kund vald"
    );


  const servicesSubtotal =
    lines.reduce(
      (
        sum,
        line
      ) =>
        sum +
        line.subtotalExVat,
      0
    );


  const storedSubtotal =
    numberValue(
      row,
      [
        "subtotal_ex_vat",
        "subtotal",
        "amount_ex_vat",
        "total_ex_vat",
      ],
      servicesSubtotal
    );


  const discountAmount =
    numberValue(
      row,
      [
        "discount_amount",
        "discount_total",
      ],
      (() => {
        const mode =
          stringValue(
            discount,
            ["mode"]
          );

        const value =
          numberValue(
            discount,
            ["value"]
          );

        if (
          mode === "percent"
        ) {
          return Math.min(
            storedSubtotal,
            storedSubtotal *
              (
                Math.min(
                  100,
                  value
                ) /
                100
              )
          );
        }

        if (
          mode === "fixed"
        ) {
          return Math.min(
            storedSubtotal,
            value
          );
        }

        return 0;
      })()
    );


  const subtotalAfterDiscount =
    Math.max(
      0,
      numberValue(
        row,
        [
          "subtotal_after_discount",
        ],
        storedSubtotal -
          discountAmount
      )
    );


  const calculatedVat =
    lines.reduce(
      (
        sum,
        line
      ) =>
        sum +
        line.subtotalExVat *
          (
            line.vatRate /
            100
          ),
      0
    );


  const vatAmount =
    numberValue(
      row,
      [
        "vat_amount",
        "tax_amount",
        "moms_amount",
      ],
      calculatedVat
    );


  const totalIncVat =
    numberValue(
      row,
      [
        "total_inc_vat",
        "total_amount",
        "grand_total",
        "total",
      ],
      subtotalAfterDiscount +
        vatAmount
    );


  const createdAt =
    nullableString(
      row,
      ["created_at"]
    );

  const updatedAt =
    nullableString(
      row,
      ["updated_at"]
    );

  const sentAt =
    nullableString(
      row,
      [
        "sent_at",
        "published_at",
      ]
    );

  const viewedAt =
    nullableString(
      row,
      [
        "viewed_at",
        "opened_at",
      ]
    );

  const acceptedAt =
    nullableString(
      row,
      [
        "accepted_at",
        "approved_at",
      ]
    );

  const declinedAt =
    nullableString(
      row,
      [
        "declined_at",
        "rejected_at",
      ]
    );


  const activity:
    OfferDetailActivity[] = [];


  if (createdAt) {
    activity.push({
      id:
        "created",
      label:
        "Offert skapad",
      description:
        "Offerten skapades i Vorix.",
      occurredAt:
        createdAt,
      tone:
        "neutral",
    });
  }


  if (sentAt) {
    activity.push({
      id:
        "sent",
      label:
        "Offert skickad",
      description:
        "Offerten skickades till kunden.",
      occurredAt:
        sentAt,
      tone:
        "neutral",
    });
  }


  if (viewedAt) {
    activity.push({
      id:
        "viewed",
      label:
        "Kunden öppnade offerten",
      description:
        "Offerten har visats av kunden.",
      occurredAt:
        viewedAt,
      tone:
        "warning",
    });
  }


  if (acceptedAt) {
    activity.push({
      id:
        "accepted",
      label:
        "Offerten accepterad",
      description:
        "Kunden accepterade offerten.",
      occurredAt:
        acceptedAt,
      tone:
        "success",
    });
  }


  if (declinedAt) {
    activity.push({
      id:
        "declined",
      label:
        "Offerten avböjd",
      description:
        "Kunden avböjde offerten.",
      occurredAt:
        declinedAt,
      tone:
        "danger",
    });
  }


  activity.sort(
    (
      a,
      b
    ) =>
      new Date(
        b.occurredAt || 0
      ).getTime() -
      new Date(
        a.occurredAt || 0
      ).getTime()
  );


  return {
    id:
      String(row.id),

    offerNumber:
      stringValue(
        row,
        [
          "offer_number",
          "quote_number",
          "number",
          "reference",
        ],
        "Offert"
      ),

    title:
      stringValue(
        row,
        [
          "title",
          "subject",
          "name",
        ]
      ) ||
      stringValue(
        draft,
        ["title"],
        "Offert"
      ),

    description:
      stringValue(
        row,
        ["description"]
      ) ||
      stringValue(
        draft,
        ["description"]
      ),

    status:
      normalizeStatus(
        row.status
      ),

    customerId,

    customerName,

    customerEmail:
      stringValue(
        row,
        [
          "customer_email",
          "email",
        ]
      ) ||
      stringValue(
        customerRow,
        ["email"]
      ) ||
      stringValue(
        draft,
        [
          "newCustomerEmail",
        ]
      ),

    customerPhone:
      stringValue(
        row,
        [
          "customer_phone",
          "phone",
        ]
      ) ||
      stringValue(
        customerRow,
        ["phone"]
      ) ||
      stringValue(
        draft,
        [
          "newCustomerPhone",
        ]
      ),

    contactName:
      stringValue(
        row,
        [
          "contact_name",
        ]
      ),

    projectId,

    projectTitle:
      stringValue(
        row,
        [
          "project_title",
          "project_name",
        ]
      ) ||
      stringValue(
        projectRow,
        ["title"],
        "Fristående offert"
      ),

    categoryName:
      stringValue(
        row,
        [
          "category_name",
        ],
        "Ej angivet"
      ),

    desiredStartDate:
      nullableString(
        row,
        [
          "desired_start_date",
          "start_date",
        ]
      ) ||
      nullableString(
        draft,
        [
          "desiredStartDate",
        ]
      ),

    currency:
      stringValue(
        row,
        ["currency"]
      ) ||
      stringValue(
        draft,
        ["currency"],
        "SEK"
      ),

    validDays:
      Math.max(
        1,
        numberValue(
          row,
          ["valid_days"],
          numberValue(
            draft,
            ["validDays"],
            30
          )
        )
      ),

    validUntil:
      nullableString(
        row,
        [
          "valid_until",
          "expires_at",
          "expiry_date",
        ]
      ),

    customerMessage:
      stringValue(
        row,
        [
          "customer_message",
        ]
      ) ||
      stringValue(
        draft,
        [
          "customerMessage",
        ]
      ),

    paymentTerms:
      stringValue(
        row,
        [
          "payment_terms",
        ]
      ) ||
      stringValue(
        draft,
        [
          "paymentTerms",
        ]
      ),

    termsText:
      stringValue(
        row,
        [
          "terms_text",
          "terms",
        ]
      ) ||
      stringValue(
        draft,
        [
          "termsText",
        ]
      ),

    includeDetailedPricing:
      booleanValue(
        draft,
        [
          "includeDetailedPricing",
        ],
        true
      ),

    showVat:
      booleanValue(
        draft,
        [
          "showVat",
        ],
        true
      ),

    includePdf:
      booleanValue(
        draft,
        [
          "includePdf",
        ],
        true
      ),

    lines,

    subtotalBeforeDiscount:
      storedSubtotal,

    discountLabel:
      stringValue(
        discount,
        ["label"],
        "Rabatt"
      ),

    discountAmount,

    subtotalAfterDiscount,

    vatAmount,

    totalIncVat,

    createdAt,
    updatedAt,
    sentAt,
    viewedAt,
    acceptedAt,
    declinedAt,

    activity,
  };
}