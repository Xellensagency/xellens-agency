"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


function value(
  formData:
    FormData,
  key:
    string
) {
  return String(
    formData.get(key) ??
    ""
  ).trim();
}


async function revalidate(
  projectId:
    string
) {
  revalidatePath(
    `/dashboard/projekt/${projectId}`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/resurser`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/aktivitet`
  );
}


async function logEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  title: string,
  description: string
) {
  const {
    error,
  } =
    await supabase.rpc(
      "vorix_log_project_event",
      {
        p_project_id:
          projectId,

        p_category:
          "project",

        p_event_type:
          eventType,

        p_title:
          title,

        p_description:
          description,

        p_entity_type:
          "project_resource",

        p_entity_id:
          null,

        p_old_value:
          null,

        p_new_value:
          null,

        p_metadata:
          {},
      }
    );


  if (error) {
    console.warn(
      "Aktivitetslogg:",
      error.message
    );
  }
}


export async function addProjectMemberAction(
  formData:
    FormData
) {
  const supabase =
    await createClient();

  const projectId =
    value(
      formData,
      "projectId"
    );

  const profileId =
    value(
      formData,
      "profileId"
    );

  const memberRole =
    value(
      formData,
      "memberRole"
    ) ||
    "Medlem";

  const responsibilities =
    value(
      formData,
      "responsibilities"
    );


  if (
    !projectId ||
    !profileId
  ) {
    return;
  }


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_team_members"
      )
      .upsert(
        {
          project_id:
            projectId,

          profile_id:
            profileId,

          member_role:
            memberRole,

          responsibilities:
            responsibilities ||
            null,
        },
        {
          onConflict:
            "project_id,profile_id",
        }
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  await logEvent(
    supabase as any,
    projectId,
    "project_member_added",
    "Teammedlem uppdaterad",
    memberRole
  );


  await revalidate(
    projectId
  );
}


export async function updateProjectMemberAction(
  formData:
    FormData
) {
  const supabase =
    await createClient();

  const projectId =
    value(
      formData,
      "projectId"
    );

  const memberId =
    value(
      formData,
      "memberId"
    );

  const memberRole =
    value(
      formData,
      "memberRole"
    ) ||
    "Medlem";

  const responsibilities =
    value(
      formData,
      "responsibilities"
    );


  if (
    !projectId ||
    !memberId
  ) {
    return;
  }


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_team_members"
      )
      .update({
        member_role:
          memberRole,

        responsibilities:
          responsibilities ||
          null,
      })
      .eq(
        "id",
        memberId
      )
      .eq(
        "project_id",
        projectId
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  await logEvent(
    supabase as any,
    projectId,
    "project_member_updated",
    "Teammedlem uppdaterad",
    memberRole
  );


  await revalidate(
    projectId
  );
}


export async function removeProjectMemberAction(
  formData:
    FormData
) {
  const supabase =
    await createClient();

  const projectId =
    value(
      formData,
      "projectId"
    );

  const memberId =
    value(
      formData,
      "memberId"
    );


  if (
    !projectId ||
    !memberId
  ) {
    return;
  }


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_team_members"
      )
      .delete()
      .eq(
        "id",
        memberId
      )
      .eq(
        "project_id",
        projectId
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  await logEvent(
    supabase as any,
    projectId,
    "project_member_removed",
    "Teammedlem borttagen",
    "En person togs bort från projektteamet."
  );


  await revalidate(
    projectId
  );
}


export async function updateProjectServiceAssignmentAction(
  formData:
    FormData
) {
  const supabase =
    await createClient();

  const projectId =
    value(
      formData,
      "projectId"
    );

  const serviceId =
    value(
      formData,
      "serviceId"
    );

  const assignedTo =
    value(
      formData,
      "assignedTo"
    );

  const deadline =
    value(
      formData,
      "deadline"
    );


  if (
    !projectId ||
    !serviceId
  ) {
    return;
  }


  const {
    data:
      service,
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_services"
      )
      .update({
        assigned_to:
          assignedTo ||
          null,

        deadline:
          deadline ||
          null,
      })
      .eq(
        "id",
        serviceId
      )
      .eq(
        "project_id",
        projectId
      )
      .select(
        "name"
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      error.message
    );
  }


  await logEvent(
    supabase as any,
    projectId,
    "service_assignment_updated",
    "Tjänsteansvar uppdaterat",
    service?.name ??
    "Projektets tjänst uppdaterades."
  );


  await revalidate(
    projectId
  );
}