"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  sendOfferEmail,
} from "@/lib/dashboard/offers/send-offer-email";


type SaveOfferInput = {
  offerId: string | null;
  sendNow: boolean;
  payload: Record<string, unknown>;
};


export type SaveOfferResult = {
  ok: boolean;
  offerId?: string;
  offerNumber?: string;
  status?: string;
  error?: string;
};


type UnknownRow =
  Record<string, unknown>;


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

  return {};
}


function asArray(
  value: unknown
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}


function isOptionalLine(
  value: unknown
) {
  const row =
    asObject(value);

  return (
    row.isOptional === true ||
    row.is_optional === true ||
    row.isOptional === "true" ||
    row.is_optional === "true"
  );
}


function numberValue(
  value: unknown,
  fallback = 0
) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
}


function nullableUuid(
  value: unknown
) {
  const text =
    String(
      value ?? ""
    ).trim();

  return text || null;
}


function createOptionalItem(
  lineValue: unknown,
  offerId: string,
  lineType: "service" | "addon",
  position: number
) {
  const line =
    asObject(
      lineValue
    );

  const quantity =
    Math.max(
      0,
      numberValue(
        line.quantity,
        1
      )
    );

  const unitPrice =
    Math.max(
      0,
      numberValue(
        line.unitPriceExVat ??
        line.unit_price_ex_vat
      )
    );

  const discountPercent =
    Math.min(
      100,
      Math.max(
        0,
        numberValue(
          line.discountPercent ??
          line.discount_percent
        )
      )
    );

  const vatRate =
    Math.max(
      0,
      numberValue(
        line.vatRate ??
        line.vat_rate,
        25
      )
    );

  const gross =
    Math.round(
      quantity *
      unitPrice *
      100
    ) / 100;

  const lineDiscount =
    Math.round(
      gross *
      (
        discountPercent /
        100
      ) *
      100
    ) / 100;

  /*
   * Valbara rader påverkas inte
   * av rabatt på grundofferten.
   */

  const subtotal =
    Math.max(
      0,
      Math.round(
        (
          gross -
          lineDiscount
        ) *
        100
      ) / 100
    );

  const vat =
    Math.round(
      subtotal *
      (
        vatRate /
        100
      ) *
      100
    ) / 100;

  const total =
    Math.round(
      (
        subtotal +
        vat
      ) *
      100
    ) / 100;


  return {
    offer_id:
      offerId,

    position,

    line_type:
      lineType,

    source_service_id:
      nullableUuid(
        line.sourceServiceId ??
        line.source_service_id
      ),

    source_package_id:
      nullableUuid(
        line.sourcePackageId ??
        line.source_package_id
      ),

    category_id:
      nullableUuid(
        line.categoryId ??
        line.category_id
      ),

    name:
      String(
        line.name ||
        (
          lineType ===
          "addon"
            ? "Valbart tillägg"
            : "Valbar tjänst"
        )
      ).trim(),

    description:
      String(
        line.description ??
        ""
      ).trim() ||
      null,

    pricing_model:
      line.pricingModel ===
        "quantity" ||
      line.pricing_model ===
        "quantity"
        ? "quantity"
        : "fixed",

    unit_code:
      String(
        line.unitCode ??
        line.unit_code ??
        "fixed"
      ),

    quantity,

    unit_price_ex_vat:
      unitPrice,

    discount_percent:
      discountPercent,

    vat_rate:
      vatRate,

    gross_amount_ex_vat:
      gross,

    line_discount_amount:
      lineDiscount,

    global_discount_amount:
      0,

    subtotal_ex_vat:
      subtotal,

    vat_amount:
      vat,

    total_inc_vat:
      total,

    customer_visible:
      line.customerVisible ===
        false ||
      line.customer_visible ===
        false
        ? false
        : true,

    is_optional:
      true,
  };
}


function getBaseUrl() {
  return (
    process.env
      .NEXT_PUBLIC_CUSTOMER_URL ||
    process.env
      .NEXT_PUBLIC_APP_URL ||
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(
    /\/$/,
    ""
  );
}


export async function saveOfferAction(
  input: SaveOfferInput
): Promise<SaveOfferResult> {

  try {
    const supabase =
      await createClient();


    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser();


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


    const services =
      asArray(
        input.payload.services
      );

    const addons =
      asArray(
        input.payload.addons
      );


    const requiredServices =
      services.filter(
        (
          line
        ) =>
          !isOptionalLine(
            line
          )
      );

    const optionalServices =
      services.filter(
        isOptionalLine
      );


    const requiredAddons =
      addons.filter(
        (
          line
        ) =>
          !isOptionalLine(
            line
          )
      );

    const optionalAddons =
      addons.filter(
        isOptionalLine
      );


    /*
     * save_offer räknar bara
     * grundoffertens obligatoriska rader.
     */

    const payloadForDatabase = {
      ...input.payload,

      services:
        requiredServices,

      addons:
        requiredAddons,
    };


    const {
      data,
      error,
    } =
      await (
        supabase as any
      ).rpc(
        "save_offer",
        {
          p_payload:
            payloadForDatabase,

          p_offer_id:
            input.offerId ||
            null,

          /*
           * Vi markerar ALDRIG
           * skickad här längre.
           *
           * Mejlet måste först
           * lyckas.
           */
          p_send_now:
            false,
        }
      );


    if (error) {
      console.error(
        "Offerten kunde inte sparas:",
        error
      );

      return {
        ok: false,

        error:
          error.message ||
          "Offerten kunde inte sparas.",
      };
    }


    const result =
      data &&
      typeof data ===
        "object"
        ? data as UnknownRow
        : {};


    const offerId =
      String(
        result.offer_id ??
        ""
      );


    const offerNumber =
      String(
        result.offer_number ??
        ""
      );


    if (!offerId) {
      return {
        ok: false,

        error:
          "Databasen returnerade inget offert-ID.",
      };
    }


    /*
     * save_offer har nu sparat
     * de obligatoriska raderna.
     *
     * Lägg tillbaka de valbara
     * utan att de påverkar
     * offertens grundtotal.
     */

    const optionalRows = [
      ...optionalServices.map(
        (
          line,
          index
        ) =>
          createOptionalItem(
            line,
            offerId,
            "service",
            requiredServices.length +
              requiredAddons.length +
              index +
              1
          )
      ),

      ...optionalAddons.map(
        (
          line,
          index
        ) =>
          createOptionalItem(
            line,
            offerId,
            "addon",
            requiredServices.length +
              requiredAddons.length +
              optionalServices.length +
              index +
              1
          )
      ),
    ];


    if (
      optionalRows.length >
      0
    ) {
      const {
        error:
          optionalError,
      } =
        await (
          supabase as any
        )
          .from(
            "offer_items"
          )
          .insert(
            optionalRows
          );


      if (optionalError) {
        console.error(
          "Valbara offertrader kunde inte sparas:",
          optionalError
        );

        return {
          ok: false,

          offerId,
          offerNumber,

          error:
            optionalError.message ||
            "Valbara tillägg kunde inte sparas.",
        };
      }
    }


    /*
     * Vanlig Spara utkast.
     */

    if (!input.sendNow) {
      revalidatePath(
        "/dashboard/offerter"
      );

      revalidatePath(
        `/dashboard/offerter/${offerId}`
      );

      return {
        ok: true,
        offerId,
        offerNumber,
        status: "draft",
      };
    }


    /*
     * RIKTIGT UTSKICK
     */

    const {
      data: offerData,
      error: offerError,
    } =
      await (
        supabase as any
      )
        .from("offers")
        .select(
          [
            "id",
            "offer_number",
            "customer_id",
            "title",
            "recipient_email",
            "total_inc_vat",
            "currency",
            "valid_until",
            "public_token",
            "send_copy_to_self",
          ].join(",")
        )
        .eq(
          "id",
          offerId
        )
        .maybeSingle();


    if (
      offerError ||
      !offerData
    ) {
      return {
        ok: false,
        offerId,
        offerNumber,

        error:
          offerError?.message ||
          "Offerten kunde inte hämtas inför utskick.",
      };
    }


    const offer =
      offerData as UnknownRow;


    const recipientEmail =
      String(
        offer.recipient_email ??
        ""
      ).trim();


    if (!recipientEmail) {
      return {
        ok: false,
        offerId,
        offerNumber,

        error:
          "Kunden saknar e-postadress för offertutskicket.",
      };
    }


    let customerName =
      "Kund";


    if (
      offer.customer_id
    ) {
      const {
        data:
          customerData,
      } =
        await (
          supabase as any
        )
          .from(
            "customers"
          )
          .select(
            "name"
          )
          .eq(
            "id",
            offer.customer_id
          )
          .maybeSingle();


      if (
        customerData?.name
      ) {
        customerName =
          String(
            customerData.name
          );
      }
    }


    const publicToken =
      String(
        offer.public_token ??
        ""
      ).trim();


    if (!publicToken) {
      return {
        ok: false,
        offerId,
        offerNumber,

        error:
          "Offerten saknar publik åtkomsttoken.",
      };
    }


    const shareUrl =
      `${getBaseUrl()}/offert/${publicToken}`;


    const sendCopy =
      offer.send_copy_to_self ===
        true;


    const mail =
      await sendOfferEmail({
        recipientEmail,

        copyToEmail:
          sendCopy
            ? userData.user
                .email ||
              null
            : null,

        customerName,

        offerNumber:
          String(
            offer.offer_number ||
            offerNumber
          ),

        title:
          String(
            offer.title ||
            "Offertförslag"
          ),

        totalIncVat:
          numberValue(
            offer.total_inc_vat
          ),

        currency:
          String(
            offer.currency ||
            "SEK"
          ),

        validUntil:
          offer.valid_until
            ? String(
                offer.valid_until
              )
            : null,

        shareUrl,
      });


    /*
     * Mejlet är nu skickat.
     * Först NU blir offerten
     * status Skickad.
     *
     * offer_sent-eventet triggar
     * även versionshistoriken.
     */

    const {
      data: sentData,
      error: sentError,
    } =
      await (
        supabase as any
      ).rpc(
        "mark_offer_sent",
        {
          p_offer_id:
            offerId,

          p_email_id:
            mail.emailId,

          p_share_url:
            shareUrl,
        }
      );


    if (sentError) {
      console.error(
        "Mejlet skickades men offertstatus kunde inte registreras:",
        sentError
      );

      return {
        ok: false,
        offerId,
        offerNumber,

        error:
          "Mejlet skickades till kunden, men statusen kunde inte registreras. Skicka inte offerten igen innan felet är kontrollerat.",
      };
    }


    const sentResult =
      sentData &&
      typeof sentData ===
        "object"
        ? sentData as UnknownRow
        : {};


    revalidatePath(
      "/dashboard/offerter"
    );

    revalidatePath(
      `/dashboard/offerter/${offerId}`
    );

    revalidatePath(
      `/dashboard/offerter/${offerId}/skickad`
    );


    return {
      ok: true,
      offerId,
      offerNumber,

      status:
        String(
          sentResult.status ??
          "sent"
        ),
    };

  }
  catch (error) {
    console.error(
      "Oväntat fel när offerten hanterades:",
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