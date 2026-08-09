"use server";

import {
  headers,
} from "next/headers";

import {
  revalidatePath,
} from "next/cache";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type OfferResponseType =
  | "accepted"
  | "rejected"
  | "changes_requested";


type SubmitOfferResponseInput = {
  token: string;

  responseType:
    OfferResponseType;

  customerName:
    string;

  comment:
    string;

  selectedOptionalItemIds:
    string[];
};


export type SubmitOfferResponseResult = {
  ok: boolean;

  status?:
    OfferResponseType;

  message?: string;

  acceptedTotalIncVat?: number;

  currency?: string;

  error?: string;
};


function isUuid(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}


function numberValue(
  value: unknown
) {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}


export async function submitOfferResponse(
  input: SubmitOfferResponseInput
): Promise<SubmitOfferResponseResult> {

  try {

    const token =
      input.token.trim();


    if (
      !isUuid(token)
    ) {
      return {
        ok: false,

        error:
          "Offertlänken är ogiltig.",
      };
    }


    if (
      ![
        "accepted",
        "rejected",
        "changes_requested",
      ].includes(
        input.responseType
      )
    ) {
      return {
        ok: false,

        error:
          "Ogiltigt svar.",
      };
    }


    const customerName =
      input.customerName
        .trim()
        .slice(
          0,
          150
        );


    const comment =
      input.comment
        .trim()
        .slice(
          0,
          5000
        );


    if (
      customerName.length <
      2
    ) {
      return {
        ok: false,

        error:
          "Ange ditt namn.",
      };
    }


    if (
      input.responseType ===
        "changes_requested" &&
      comment.length <
        2
    ) {
      return {
        ok: false,

        error:
          "Beskriv vad du vill ändra.",
      };
    }


    const selectedOptionalItemIds =
      Array.from(
        new Set(
          input
            .selectedOptionalItemIds
            .filter(
              isUuid
            )
        )
      ).slice(
        0,
        100
      );


    const requestHeaders =
      await headers();


    const forwardedFor =
      requestHeaders.get(
        "x-forwarded-for"
      );


    const ipAddress =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      requestHeaders.get(
        "x-real-ip"
      ) ||
      null;


    const userAgent =
      requestHeaders
        .get(
          "user-agent"
        )
        ?.slice(
          0,
          1000
        ) ||
      null;


    const supabase =
      createAdminClient();


    const {
      data,
      error,
    } =
      await (
        supabase as any
      ).rpc(
        "submit_offer_response",
        {
          p_public_token:
            token,

          p_response_type:
            input.responseType,

          p_customer_name:
            customerName,

          p_comment:
            comment ||
            null,

          p_selected_optional_item_ids:
            input.responseType ===
              "accepted"
              ? selectedOptionalItemIds
              : [],

          p_ip_address:
            ipAddress,

          p_user_agent:
            userAgent,
        }
      );


    if (error) {
      console.error(
        "Kundens offertsvar kunde inte sparas:",
        error
      );

      return {
        ok: false,

        error:
          error.message ||
          "Svaret kunde inte sparas.",
      };
    }


    const result =
      data &&
      typeof data ===
        "object"
        ? data as Record<
            string,
            unknown
          >
        : {};


    const offerId =
      String(
        result.offer_id ??
        ""
      );


    revalidatePath(
      `/offert/${token}`
    );


    if (offerId) {
      revalidatePath(
        `/dashboard/offerter/${offerId}`
      );

      revalidatePath(
        "/dashboard/offerter"
      );
    }


    const responseType =
      String(
        result.status ??
        input.responseType
      ) as OfferResponseType;


    const message =
      responseType ===
        "accepted"
        ? "Tack! Offerten är accepterad och Vorix har fått ditt svar."
        : responseType ===
            "changes_requested"
          ? "Tack! Din ändringsbegäran har skickats till Vorix."
          : "Ditt svar har registrerats. Offerten är avböjd.";


    return {
      ok: true,

      status:
        responseType,

      message,

      acceptedTotalIncVat:
        numberValue(
          result.accepted_total_inc_vat
        ),

      currency:
        String(
          result.currency ??
          "SEK"
        ),
    };

  }
  catch (error) {
    console.error(
      "Oväntat fel vid offertsvar:",
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