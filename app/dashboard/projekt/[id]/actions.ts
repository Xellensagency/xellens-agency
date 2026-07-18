"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

export type DeleteProjectResult = {
  ok: boolean;
  error?: string;
};

export async function deleteProjectAction(
  projectId: string
): Promise<DeleteProjectResult> {
  const cleanedProjectId =
    String(projectId || "").trim();

  if (!cleanedProjectId) {
    return {
      ok: false,
      error:
        "Projektets id saknas.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      ok: false,
      error:
        "Din inloggning kunde inte verifieras.",
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await (
    supabase as any
  )
    .from("profiles")
    .select(
      "role, is_active"
    )
    .eq(
      "id",
      user.id
    )
    .maybeSingle();

  const allowedRoles = [
    "super_admin",
    "admin",
  ];

  if (
    profileError ||
    !profile ||
    profile.is_active !== true ||
    !allowedRoles.includes(
      String(profile.role)
    )
  ) {
    return {
      ok: false,
      error:
        "Du har inte behörighet att ta bort projekt.",
    };
  }

  const {
    error,
  } = await (
    supabase as any
  )
    .from("projects")
    .delete()
    .eq(
      "id",
      cleanedProjectId
    );

  if (error) {
    console.error(
      "Projektet kunde inte tas bort:",
      error
    );

    if (
      error.code === "23503"
    ) {
      return {
        ok: false,
        error:
          "Projektet har kopplade uppgifter som först måste tas bort.",
      };
    }

    return {
      ok: false,
      error:
        error.message ||
        "Projektet kunde inte tas bort.",
    };
  }

  revalidatePath(
    "/dashboard/projekt"
  );

  return {
    ok: true,
  };
}
