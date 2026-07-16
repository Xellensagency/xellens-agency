import {
  createClient,
} from "@/lib/supabase/server";

import type {
  OfferSentData,
} from "./offer-sent-types";

type UnknownRow =
  Record<string, unknown>;

function asRow(
  value: unknown
): UnknownRow {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRow;
  }

  return {};
}

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
  const valueText =
    textValue(value).trim();

  return valueText || null;
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

export async function getOfferSentData(
  offerId: string
): Promise<OfferSentData | null> {
  const supabase =
    await createClient();

  const {
    data: offerData,
    error: offerError,
  } = await (
    supabase as any
  )
    .from("offers")
    .select("*")
    .eq("id", offerId)
    .maybeSingle();

  if (
    offerError ||
    !offerData
  ) {
    console.error(
      "Den skickade offerten kunde inte hämtas:",
      offerError
    );

    return null;
  }

  const offer =
    asRow(offerData);

  const customerSnapshot =
    asRow(
      offer.customer_snapshot ??
      offer.customerSnapshot
    );

  const customerId =
    optionalText(
      offer.customer_id ??
      offer.customerId
    );

  let customer: UnknownRow = {};

  if (customerId) {
    const {
      data: customerData,
    } = await (
      supabase as any
    )
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .maybeSingle();

    customer =
      asRow(customerData);
  }

  const subtotalExVat =
    numberValue(
      offer.subtotal_ex_vat ??
      offer.subtotalExVat ??
      offer.subtotal_after_discount ??
      offer.subtotal
    );

  const vatAmount =
    numberValue(
      offer.vat_amount ??
      offer.vatAmount
    );

  const storedTotal =
    numberValue(
      offer.total_inc_vat ??
      offer.totalIncVat ??
      offer.total_amount ??
      offer.total
    );

  const totalIncVat =
    storedTotal ||
    subtotalExVat +
      vatAmount;

  const publicToken =
    optionalText(
      offer.public_token ??
      offer.publicToken ??
      offer.share_token ??
      offer.shareToken
    );

  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const baseUrl =
    configuredBaseUrl.replace(
      /\/$/,
      ""
    );

  const savedShareUrl =
    optionalText(
      offer.public_url ??
      offer.publicUrl ??
      offer.share_url ??
      offer.shareUrl
    );

  const shareUrl =
    savedShareUrl ||
    `${baseUrl}/offert/${
      publicToken || offerId
    }`;

  return {
    id:
      textValue(offer.id),

    offerNumber:
      textValue(
        offer.offer_number ??
        offer.offerNumber,
        "Offert"
      ),

    title:
      textValue(
        offer.title,
        "Offertförslag"
      ),

    status:
      textValue(
        offer.status,
        "sent"
      ),

    customerName:
      textValue(
        customerSnapshot.name ??
        customerSnapshot.company_name ??
        customer.name ??
        customer.company_name,
        "Kund"
      ),

    customerEmail:
      optionalText(
        customerSnapshot.email ??
        customerSnapshot.billing_email ??
        customer.email ??
        customer.billing_email
      ),

    validUntil:
      optionalText(
        offer.valid_until ??
        offer.validUntil ??
        offer.valid_to ??
        offer.expires_at
      ),

    sentAt:
      optionalText(
        offer.sent_at ??
        offer.sentAt ??
        offer.updated_at ??
        offer.created_at
      ),

    subtotalExVat,
    vatAmount,
    totalIncVat,

    currency:
      textValue(
        offer.currency,
        "SEK"
      ),

    shareUrl,
  };
}
