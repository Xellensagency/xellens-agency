import {
  createOfferVersionPdf,
} from "@/lib/dashboard/offers/OfferVersionPdf";

import {
  createClient,
} from "@/lib/supabase/server";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


type RouteProps = {
  params: Promise<{
    offerId: string;
    versionNumber: string;
  }>;
};


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
    offerId,
    versionNumber,
  } =
    await params;


  const version =
    Number(
      versionNumber
    );


  if (
    !Number.isInteger(
      version
    ) ||
    version < 1
  ) {
    return new Response(
      "Ogiltig version.",
      {
        status: 400,
      }
    );
  }


  const supabase =
    await createClient();


  const {
    data: userData,
  } =
    await supabase.auth.getUser();


  if (
    !userData.user
  ) {
    return new Response(
      "Ej inloggad.",
      {
        status: 401,
      }
    );
  }


  const {
    data,
    error,
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
        offerId
      )
      .eq(
        "version_number",
        version
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    return new Response(
      "Offertversionen kunde inte hittas.",
      {
        status: 404,
      }
    );
  }


  const snapshot =
    data.snapshot &&
    typeof data.snapshot ===
      "object"
      ? data.snapshot as Record<
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
        data.snapshot,

      versionNumber:
        data.version_number,
    });


  const filename =
    `${safeFileName(
      offerNumber
    )}-version-${version}.pdf`;


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