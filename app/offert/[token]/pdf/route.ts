import {
  createOfferVersionPdf,
} from "@/lib/dashboard/offers/OfferVersionPdf";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


type RouteProps = {
  params: Promise<{
    token: string;
  }>;
};


function isUuid(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}


function safeFileName(
  value: string
) {
  return (
    value
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "offert"
  );
}


export async function GET(
  _request: Request,
  {
    params,
  }: RouteProps
) {

  const {
    token,
  } =
    await params;


  if (
    !isUuid(
      token
    )
  ) {
    return new Response(
      "Offerten kunde inte hittas.",
      {
        status: 404,
      }
    );
  }


  const supabase =
    createAdminClient();


  const {
    data: offerData,
  } =
    await (
      supabase as any
    )
      .from("offers")
      .select(
        "id"
      )
      .eq(
        "public_token",
        token
      )
      .maybeSingle();


  if (
    !offerData
  ) {
    return new Response(
      "Offerten kunde inte hittas.",
      {
        status: 404,
      }
    );
  }


  /*
   * Kunden får alltid PDF för
   * den senaste SKICKADE versionen,
   * aldrig ett oskickat utkast.
   */

  const {
    data: versionData,
    error: versionError,
  } =
    await (
      supabase as any
    )
      .from(
        "offer_versions"
      )
      .select(
        "version_number, snapshot"
      )
      .eq(
        "offer_id",
        offerData.id
      )
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (
    versionError ||
    !versionData
  ) {
    return new Response(
      "Ingen skickad offertversion finns.",
      {
        status: 404,
      }
    );
  }


  const snapshot =
    versionData.snapshot &&
    typeof versionData.snapshot ===
      "object"
      ? versionData.snapshot as Record<
          string,
          unknown
        >
      : {};


  const offer =
    snapshot.offer &&
    typeof snapshot.offer ===
      "object"
      ? snapshot.offer as Record<
          string,
          unknown
        >
      : {};


  const offerNumber =
    String(
      offer.offer_number ??
      "offert"
    );


  const pdf =
    await createOfferVersionPdf({
      snapshot:
        versionData.snapshot,

      versionNumber:
        versionData.version_number,
    });


  const filename =
    `${safeFileName(
      offerNumber
    )}-version-${versionData.version_number}.pdf`;


  return new Response(
    new Uint8Array(
      pdf
    ),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "private, no-store",
      },
    }
  );
}