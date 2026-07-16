"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

export async function saveOfferAction(
  input: SaveOfferInput
): Promise<SaveOfferResult> {
  try {
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

    const { data, error } = await (
      supabase as any
    ).rpc("save_offer", {
      p_payload: input.payload,
      p_offer_id:
        input.offerId || null,
      p_send_now: input.sendNow,
    });

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
      typeof data === "object"
        ? (data as Record<
            string,
            unknown
          >)
        : {};

    const offerId = String(
      result.offer_id ?? ""
    );

    const offerNumber = String(
      result.offer_number ?? ""
    );

    if (!offerId) {
      return {
        ok: false,
        error:
          "Databasen returnerade inget offert-ID.",
      };
    }

    revalidatePath(
      "/dashboard/offerter"
    );

    return {
      ok: true,
      offerId,
      offerNumber,
      status: String(
        result.status ?? ""
      ),
    };
  } catch (error) {
    console.error(
      "Oväntat fel när offerten sparades:",
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
