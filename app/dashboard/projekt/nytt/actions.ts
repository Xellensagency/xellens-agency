"use server";

import { revalidatePath } from "next/cache";

import type {
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "@/lib/dashboard/projects/create-project-types";

import { createClient } from "@/lib/supabase/server";

type CreateProjectPayload = {
  draft: ProjectDraft;
  services: ProjectServiceDraft[];
  milestones: ProjectMilestoneDraft[];
  ownerId: string;
  teamMembers: ProjectTeamMemberDraft[];
  serviceAssignments: ProjectServiceAssignments;
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

export async function createProjectAction(
  payload: CreateProjectPayload
): Promise<CreateProjectResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        ok: false,
        error:
          "Din inloggning kunde inte verifieras. Logga in igen.",
      };
    }

    const rpcResult = await (
      supabase as any
    ).rpc(
      "create_project_with_details",
      {
        p_payload: payload,
      }
    );

    if (rpcResult.error) {
      console.error(
        "create_project_with_details:",
        rpcResult.error
      );

      return {
        ok: false,
        error:
          rpcResult.error.message ||
          "Projektet kunde inte skapas.",
      };
    }

    const projectId =
      typeof rpcResult.data === "string"
        ? rpcResult.data
        : String(rpcResult.data ?? "");

    if (!projectId) {
      return {
        ok: false,
        error:
          "Projektet sparades men inget projekt-id returnerades.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projekt");

    return {
      ok: true,
      projectId,
    };
  } catch (error) {
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
