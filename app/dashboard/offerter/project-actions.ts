"use server";

import {
  randomUUID,
} from "crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  createProjectAction,
} from "@/app/dashboard/projekt/nytt/actions";

import {
  getCreateProjectOptions,
} from "@/lib/dashboard/projects/get-create-project-options";

import type {
  ProjectDraft,
  ProjectServiceDraft,
} from "@/lib/dashboard/projects/create-project-types";

import {
  createClient,
} from "@/lib/supabase/server";


type UnknownRow =
  Record<string, unknown>;


export type CreateProjectFromOfferResult =
  | {
      ok: true;
      projectId: string;
      existing: boolean;
      message: string;
    }
  | {
      ok: false;
      error: string;
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

  return {};
}


function asArray(
  value: unknown
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
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


function nullableText(
  value: unknown
) {
  const result =
    textValue(value).trim();

  return result || null;
}


function numberValue(
  value: unknown,
  fallback = 0
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}


function booleanValue(
  value: unknown,
  fallback = false
) {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === "true"
  ) {
    return true;
  }

  if (
    value === "false"
  ) {
    return false;
  }

  return fallback;
}


function isUuid(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}


function lineSubtotal(
  item: UnknownRow
) {
  const stored =
    numberValue(
      item.subtotal_ex_vat
    );

  if (stored > 0) {
    return stored;
  }

  const quantity =
    Math.max(
      0,
      numberValue(
        item.quantity,
        1
      )
    );

  const price =
    Math.max(
      0,
      numberValue(
        item.unit_price_ex_vat
      )
    );

  const discount =
    Math.min(
      100,
      Math.max(
        0,
        numberValue(
          item.discount_percent
        )
      )
    );

  return (
    quantity *
    price *
    (
      1 -
      discount / 100
    )
  );
}


export async function createProjectFromAcceptedOfferAction(
  offerId: string
): Promise<CreateProjectFromOfferResult> {

  try {

    if (
      !isUuid(
        offerId
      )
    ) {
      return {
        ok: false,
        error:
          "Ogiltigt offert-ID.",
      };
    }


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
            "project_id",
            "customer_id",
            "contact_id",
            "category_id",
            "title",
            "description",
            "desired_start_date",
            "status",
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

        error:
          offerError?.message ||
          "Offerten kunde inte hittas.",
      };
    }


    const offer =
      offerData as UnknownRow;


    /*
     * Har projekt redan skapats?
     * Skapa aldrig en dubblett.
     */

    const existingProjectId =
      nullableText(
        offer.project_id
      );


    if (
      existingProjectId
    ) {
      return {
        ok: true,

        projectId:
          existingProjectId,

        existing:
          true,

        message:
          "Offerten är redan kopplad till ett projekt.",
      };
    }


    if (
      textValue(
        offer.status
      ) !==
      "accepted"
    ) {
      return {
        ok: false,

        error:
          "Endast accepterade offerter kan bli projekt.",
      };
    }


    if (
      !nullableText(
        offer.customer_id
      )
    ) {
      return {
        ok: false,

        error:
          "Offerten saknar kundkoppling.",
      };
    }


    /*
     * Hämta exakt det accepterade
     * kundsvaret.
     */

    const {
      data: responseData,
      error: responseError,
    } =
      await (
        supabase as any
      )
        .from(
          "offer_responses"
        )
        .select(
          [
            "id",
            "version_id",
            "version_number",
            "response_type",
            "selected_optional_item_ids",
            "selected_optional_items",
            "accepted_total_inc_vat",
            "currency",
          ].join(",")
        )
        .eq(
          "offer_id",
          offerId
        )
        .eq(
          "response_type",
          "accepted"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();


    if (
      responseError ||
      !responseData
    ) {
      return {
        ok: false,

        error:
          responseError?.message ||
          "Det accepterade kundsvaret kunde inte hittas.",
      };
    }


    const response =
      responseData as UnknownRow;


    const versionId =
      nullableText(
        response.version_id
      );


    if (!versionId) {
      return {
        ok: false,

        error:
          "Det accepterade svaret saknar offertversion.",
      };
    }


    /*
     * Hämta den LÅSTA version
     * som kunden faktiskt accepterade.
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
          "id, version_number, snapshot"
        )
        .eq(
          "id",
          versionId
        )
        .eq(
          "offer_id",
          offerId
        )
        .maybeSingle();


    if (
      versionError ||
      !versionData
    ) {
      return {
        ok: false,

        error:
          versionError?.message ||
          "Den accepterade offertversionen kunde inte hittas.",
      };
    }


    const snapshot =
      asObject(
        versionData.snapshot
      );


    const snapshotOffer =
      asObject(
        snapshot.offer
      );


    const items =
      asArray(
        snapshot.items
      ).map(
        asObject
      );


    /*
     * Vilka valbara tillägg
     * valde kunden?
     */

    const selectedIds =
      new Set<string>();


    for (
      const value of
      asArray(
        response.selected_optional_item_ids
      )
    ) {
      const id =
        textValue(
          value
        );

      if (id) {
        selectedIds.add(id);
      }
    }


    for (
      const value of
      asArray(
        response.selected_optional_items
      )
    ) {
      const item =
        asObject(value);

      const id =
        textValue(
          item.id
        );

      if (id) {
        selectedIds.add(id);
      }
    }


    /*
     * Projektet får:
     *
     * - alla obligatoriska rader
     * - endast valbara rader som
     *   kunden faktiskt accepterade
     */

    const acceptedItems =
      items.filter(
        (
          item
        ) => {

          const optional =
            booleanValue(
              item.is_optional
            );


          if (!optional) {
            return true;
          }


          return selectedIds.has(
            textValue(
              item.id
            )
          );
        }
      );


    /*
     * Projektalternativ:
     * kategorier + team.
     */

    const options =
      await getCreateProjectOptions();


    const categoryIds =
      new Set<string>();


    const offerCategory =
      nullableText(
        offer.category_id ??
        snapshotOffer.category_id
      );


    if (
      offerCategory
    ) {
      categoryIds.add(
        offerCategory
      );
    }


    for (
      const item of
      acceptedItems
    ) {
      const categoryId =
        nullableText(
          item.category_id
        );

      if (
        categoryId
      ) {
        categoryIds.add(
          categoryId
        );
      }
    }


    /*
     * Äldre/testofferter kan sakna
     * kategori.
     *
     * Försök då använda Övrigt /
     * General innan första kategori.
     */

    if (
      categoryIds.size ===
      0
    ) {
      const fallback =
        options.categories.find(
          (
            category
          ) => {
            const slug =
              category.slug
                .toLowerCase();

            return (
              slug.includes(
                "ovr"
              ) ||
              slug.includes(
                "other"
              ) ||
              slug.includes(
                "general"
              )
            );
          }
        ) ??
        options.categories[0];


      if (
        fallback
      ) {
        categoryIds.add(
          fallback.id
        );
      }
    }


    if (
      categoryIds.size ===
      0
    ) {
      return {
        ok: false,

        error:
          "Det finns ingen projektkategori att använda.",
      };
    }


    /*
     * Samma standardägare som
     * vanliga projektguiden.
     */

    const ownerId =
      options.team_members.find(
        (
          member
        ) =>
          member.role ===
          "super_admin"
      )?.id ??
      options.team_members[0]?.id ??
      "";


    if (!ownerId) {
      return {
        ok: false,

        error:
          "Ingen projektägare kunde väljas.",
      };
    }


    const projectServices:
      ProjectServiceDraft[] =
        acceptedItems.map(
          (
            item
          ) => {

            const storedId =
              textValue(
                item.id
              );


            return {
              id:
                isUuid(
                  storedId
                )
                  ? storedId
                  : randomUUID(),

              sourceServiceId:
                nullableText(
                  item.source_service_id
                ),

              sourcePackageId:
                nullableText(
                  item.source_package_id
                ),

              categoryId:
                nullableText(
                  item.category_id
                ),

              name:
                textValue(
                  item.name,
                  "Tjänst"
                ),

              description:
                textValue(
                  item.description
                ),

              pricingModel:
                textValue(
                  item.pricing_model
                ) ===
                "quantity"
                  ? "quantity"
                  : "fixed",

              unitCode:
                textValue(
                  item.unit_code,
                  "fixed"
                ),

              quantity:
                Math.max(
                  0,
                  numberValue(
                    item.quantity,
                    1
                  )
                ),

              unitPriceExVat:
                Math.max(
                  0,
                  numberValue(
                    item.unit_price_ex_vat
                  )
                ),

              discountPercent:
                Math.min(
                  100,
                  Math.max(
                    0,
                    numberValue(
                      item.discount_percent
                    )
                  )
                ),

              vatRate:
                Math.max(
                  0,
                  numberValue(
                    item.vat_rate,
                    25
                  )
                ),

              customerVisible:
                booleanValue(
                  item.customer_visible,
                  true
                ),

              /*
               * Kunden har accepterat
               * tillägget. I projektet
               * är det därför inte längre
               * "valbart".
               */
              isOptional:
                false,
            };
          }
        );


    const budgetExVat =
      acceptedItems.reduce(
        (
          total,
          item
        ) =>
          total +
          lineSubtotal(
            item
          ),
        0
      );


    const offerNumber =
      textValue(
        offer.offer_number,
        "offerten"
      );


    const description =
      textValue(
        offer.description ??
        snapshotOffer.description
      ).trim() ||
      `Projekt skapat från accepterad offert ${offerNumber}.`;


    const projectDraft:
      ProjectDraft = {

        title:
          textValue(
            offer.title ??
            snapshotOffer.title,
            `Projekt ${offerNumber}`
          ),

        customerId:
          textValue(
            offer.customer_id
          ),

        contactId:
          textValue(
            offer.contact_id
          ),

        categoryIds:
          Array.from(
            categoryIds
          ),

        description,

        startDate:
          textValue(
            offer.desired_start_date ??
            snapshotOffer.desired_start_date
          ),

        endDate:
          "",

        budgetExVat:
          budgetExVat >
          0
            ? budgetExVat.toFixed(
                2
              )
            : "",

        priority:
          "normal",

        status:
          "planning",

        /*
         * Vi låter admin granska
         * projektet innan kunden
         * ser projektportalen.
         */
        customerVisibility:
          "hidden",
      };


    const projectResult =
      await createProjectAction({
        draft:
          projectDraft,

        services:
          projectServices,

        milestones:
          [],

        ownerId,

        teamMembers:
          [],

        serviceAssignments:
          {},
      });


    if (
      !projectResult.ok
    ) {
      return {
        ok: false,

        error:
          projectResult.error,
      };
    }


    const projectId =
      projectResult.projectId;


    /*
     * Länka projektet tillbaka
     * till offerten.
     */

    const {
      error: linkError,
    } =
      await (
        supabase as any
      )
        .from("offers")
        .update({
          project_id:
            projectId,
        })
        .eq(
          "id",
          offerId
        )
        .is(
          "project_id",
          null
        );


    if (
      linkError
    ) {
      console.error(
        "Projektet skapades men kunde inte länkas till offerten:",
        linkError
      );
    }


    /*
     * Aktivitet på offerten.
     */

    await (
      supabase as any
    )
      .from(
        "offer_events"
      )
      .insert({
        offer_id:
          offerId,

        event_type:
          "project_created",

        event_title:
          "Projekt skapat",

        description:
          "Ett projekt skapades från den accepterade offerten.",

        metadata: {
          project_id:
            projectId,

          version_id:
            versionId,

          version_number:
            numberValue(
              response.version_number
            ),

          accepted_total_inc_vat:
            numberValue(
              response.accepted_total_inc_vat
            ),

          transferred_services:
            projectServices.length,
        },

        actor_id:
          userData.user.id,
      });


    revalidatePath(
      "/dashboard"
    );

    revalidatePath(
      "/dashboard/offerter"
    );

    revalidatePath(
      `/dashboard/offerter/${offerId}`
    );

    revalidatePath(
      "/dashboard/projekt"
    );

    revalidatePath(
      `/dashboard/projekt/${projectId}`
    );


    return {
      ok: true,

      projectId,

      existing:
        false,

      message:
        "Projektet skapades från den accepterade offerten.",
    };
  }
  catch (error) {
    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "Projektet kunde inte skapas.",
    };
  }
}