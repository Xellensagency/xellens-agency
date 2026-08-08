"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "@/lib/dashboard/projects/create-project-types";

import {
  createClient,
} from "@/lib/supabase/server";


type CreateProjectPayload = {
  draft:
    ProjectDraft;

  services:
    ProjectServiceDraft[];

  milestones:
    ProjectMilestoneDraft[];

  ownerId:
    string;

  teamMembers:
    ProjectTeamMemberDraft[];

  serviceAssignments:
    ProjectServiceAssignments;
};


type CreateProjectResult =
  | {
      ok: true;

      projectId: string;
    }
  | {
      ok: false;

      error: string;
    };


async function syncProjectWorkspace(
  supabase: any,
  userId: string,
  projectId: string,
  payload:
    CreateProjectPayload
) {
  if (
    payload.milestones.length >
    0
  ) {
    const rows =
      payload.milestones.map(
        (
          milestone
        ) => ({
          id:
            milestone.id,

          project_id:
            projectId,

          title:
            milestone.title,

          description:
            milestone.description ||
            null,

          milestone_type:
            milestone.milestoneType,

          status:
            milestone.status,

          due_date:
            milestone.dueDate,

          due_time:
            milestone.dueTime ||
            null,

          assigned_to:
            milestone.assignedTo,

          reminder_minutes:
            milestone.reminderMinutes,

          customer_visible:
            milestone.customerVisible,

          created_by:
            userId,
        })
      );


    const {
      error,
    } =
      await supabase
        .from(
          "project_milestones"
        )
        .upsert(
          rows,
          {
            onConflict: "id",
          }
        );


    if (error) {
      console.error(
        "Milestones kunde inte synkas:",
        error
      );
    }
  }


  if (
    payload.services.length >
    0
  ) {
    const rows =
      payload.services.map(
        (
          service
        ) => {
          const assignment =
            payload
              .serviceAssignments[
                service.id
              ];

          return {
            id:
              service.id,

            project_id:
              projectId,

            source_service_id:
              service
                .sourceServiceId,

            source_package_id:
              service
                .sourcePackageId,

            category_id:
              service.categoryId,

            name:
              service.name,

            description:
              service.description ||
              null,

            pricing_model:
              service.pricingModel,

            unit_code:
              service.unitCode,

            quantity:
              service.quantity,

            unit_price_ex_vat:
              service
                .unitPriceExVat,

            discount_percent:
              service
                .discountPercent,

            vat_rate:
              service.vatRate,

            customer_visible:
              service
                .customerVisible,

            is_optional:
              service.isOptional,

            assigned_to:
              assignment
                ?.assignedTo ||
              null,

            deadline:
              assignment
                ?.deadline ||
              null,
          };
        }
      );


    const {
      error,
    } =
      await supabase
        .from(
          "project_services"
        )
        .upsert(
          rows,
          {
            onConflict: "id",
          }
        );


    if (error) {
      console.error(
        "Tjänster kunde inte synkas:",
        error
      );
    }
  }


  const teamByProfile =
    new Map<
      string,
      {
        profileId: string;
        memberRole: string;
        responsibilities: string;
      }
    >();


  for (
    const member of
    payload.teamMembers
  ) {
    teamByProfile.set(
      member.profileId,
      member
    );
  }


  if (
    payload.ownerId &&
    !teamByProfile.has(
      payload.ownerId
    )
  ) {
    teamByProfile.set(
      payload.ownerId,
      {
        profileId:
          payload.ownerId,

        memberRole:
          "Projektägare",

        responsibilities:
          "Övergripande projektansvar",
      }
    );
  }


  const teamRows =
    Array.from(
      teamByProfile.values()
    ).map(
      (
        member
      ) => ({
        project_id:
          projectId,

        profile_id:
          member.profileId,

        member_role:
          member.memberRole ||
          "Medlem",

        responsibilities:
          member
            .responsibilities ||
          null,
      })
    );


  if (
    teamRows.length >
    0
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          "project_team_members"
        )
        .upsert(
          teamRows,
          {
            onConflict:
              "project_id,profile_id",
          }
        );


    if (error) {
      console.error(
        "Projektteam kunde inte synkas:",
        error
      );
    }
  }
}


export async function createProjectAction(
  payload:
    CreateProjectPayload
): Promise<CreateProjectResult> {
  try {
    const supabase =
      await createClient();


    const {
      data: {
        user,
      },

      error:
        userError,
    } =
      await supabase.auth.getUser();


    if (
      userError ||
      !user
    ) {
      return {
        ok: false,

        error:
          "Din inloggning kunde inte verifieras. Logga in igen.",
      };
    }


    const rpcResult =
      await (
        supabase as any
      ).rpc(
        "create_project_with_details",
        {
          p_payload:
            payload,
        }
      );


    if (
      rpcResult.error
    ) {
      console.error(
        "create_project_with_details:",
        rpcResult.error
      );

      return {
        ok: false,

        error:
          rpcResult.error
            .message ||
          "Projektet kunde inte skapas.",
      };
    }


    const projectId =
      typeof rpcResult.data ===
        "string"
        ? rpcResult.data
        : String(
            rpcResult.data ??
            ""
          );


    if (!projectId) {
      return {
        ok: false,

        error:
          "Projektet sparades men inget projekt-id returnerades.",
      };
    }


    await syncProjectWorkspace(
      supabase as any,
      user.id,
      projectId,
      payload
    );


    revalidatePath(
      "/dashboard"
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
    };
  }
  catch (error) {
    console.error(
      "Fel när projektet skapades:",
      error
    );

    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel inträffade.",
    };
  }
}