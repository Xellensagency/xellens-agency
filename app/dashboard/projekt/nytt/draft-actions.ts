"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ProjectDraftPayload,
  SavedProjectDraft,
} from "@/lib/dashboard/projects/project-draft-types";

import {
  createClient,
} from "@/lib/supabase/server";


type SaveProjectDraftInput = {
  draftId:
    string | null;

  title: string;

  customerName:
    string | null;

  currentStep: number;

  payload:
    ProjectDraftPayload;
};


type SaveResult =
  | {
      ok: true;

      draftId: string;

      updatedAt: string;
    }
  | {
      ok: false;

      error: string;
    };


type LoadResult =
  | {
      ok: true;

      draft:
        SavedProjectDraft;
    }
  | {
      ok: false;

      error: string;
    };


async function getUser() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },

    error,
  } =
    await supabase.auth.getUser();

  return {
    supabase,

    user:
      error
        ? null
        : user,
  };
}


export async function saveProjectDraftAction(
  input:
    SaveProjectDraftInput
): Promise<SaveResult> {
  const {
    supabase,
    user,
  } =
    await getUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Din inloggning kunde inte verifieras.",
    };
  }


  const title =
    input.title.trim() ||
    "Nytt projekt";


  const currentStep =
    Math.min(
      5,
      Math.max(
        1,
        Math.round(
          input.currentStep
        )
      )
    );


  if (input.draftId) {
    const {
      data,
      error,
    } =
      await (
        supabase as any
      )
        .from(
          "project_drafts"
        )
        .update({
          title,

          customer_name:
            input.customerName,

          current_step:
            currentStep,

          payload:
            input.payload,
        })
        .eq(
          "id",
          input.draftId
        )
        .eq(
          "user_id",
          user.id
        )
        .select(
          "id, updated_at"
        )
        .maybeSingle();


    if (error) {
      return {
        ok: false,

        error:
          error.message ||
          "Utkastet kunde inte sparas.",
      };
    }


    if (!data) {
      return {
        ok: false,

        error:
          "Utkastet kunde inte hittas.",
      };
    }


    revalidatePath(
      "/dashboard/projekt"
    );


    return {
      ok: true,

      draftId:
        String(
          data.id
        ),

      updatedAt:
        String(
          data.updated_at
        ),
    };
  }


  const {
    data,
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_drafts"
      )
      .insert({
        user_id:
          user.id,

        title,

        customer_name:
          input.customerName,

        current_step:
          currentStep,

        payload:
          input.payload,
      })
      .select(
        "id, updated_at"
      )
      .single();


  if (error) {
    return {
      ok: false,

      error:
        error.message ||
        "Utkastet kunde inte sparas.",
    };
  }


  revalidatePath(
    "/dashboard/projekt"
  );


  return {
    ok: true,

    draftId:
      String(
        data.id
      ),

    updatedAt:
      String(
        data.updated_at
      ),
  };
}


export async function loadProjectDraftAction(
  draftId: string
): Promise<LoadResult> {
  const {
    supabase,
    user,
  } =
    await getUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Din inloggning kunde inte verifieras.",
    };
  }


  const {
    data,
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_drafts"
      )
      .select(`
        id,
        user_id,
        title,
        customer_name,
        current_step,
        payload,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        draftId
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();


  if (error) {
    return {
      ok: false,

      error:
        error.message ||
        "Utkastet kunde inte hämtas.",
    };
  }


  if (!data) {
    return {
      ok: false,

      error:
        "Utkastet finns inte längre.",
    };
  }


  return {
    ok: true,

    draft:
      data as
        SavedProjectDraft,
  };
}


export async function deleteProjectDraftAction(
  draftId: string
) {
  const {
    supabase,
    user,
  } =
    await getUser();


  if (!user) {
    return {
      ok: false,
    };
  }


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_drafts"
      )
      .delete()
      .eq(
        "id",
        draftId
      )
      .eq(
        "user_id",
        user.id
      );


  if (error) {
    return {
      ok: false,

      error:
        error.message,
    };
  }


  revalidatePath(
    "/dashboard/projekt"
  );


  return {
    ok: true,
  };
}