"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


export type MilestoneInput = {
  title: string;

  description: string;

  milestoneType:
    | "delivery"
    | "feedback"
    | "meeting"
    | "task"
    | "other";

  status:
    | "pending"
    | "in_progress";

  dueDate: string;

  dueTime: string;

  assignedTo:
    string | null;

  reminderMinutes:
    number;

  customerVisible:
    boolean;
};


type ActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;

      error: string;
    };


async function getInternalUser() {
  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return {
      supabase,
      user: null,
    };
  }


  const {
    data:
      profile,
  } =
    await (
      supabase as any
    )
      .from("profiles")
      .select(
        "id, role, is_active"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (
    !profile ||
    !profile.is_active ||
    ![
      "super_admin",
      "admin",
      "staff",
    ].includes(
      profile.role
    )
  ) {
    return {
      supabase,
      user: null,
    };
  }


  return {
    supabase,
    user,
  };
}


async function logActivity(
  supabase: any,
  projectId: string,
  eventType: string,
  title: string,
  description:
    string | null,
  entityId:
    string | null
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
          "project_milestone",

        p_entity_id:
          entityId,

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
      "Aktiviteten kunde inte loggas:",
      error.message
    );
  }
}


function revalidate(
  projectId: string
) {
  revalidatePath(
    `/dashboard/projekt/${projectId}`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/tidsplan`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/aktivitet`
  );
}


export async function createMilestoneAction(
  projectId: string,
  input:
    MilestoneInput
): Promise<ActionResult> {
  const {
    supabase,
    user,
  } =
    await getInternalUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Du saknar behörighet.",
    };
  }


  if (
    !input.title.trim() ||
    !input.dueDate
  ) {
    return {
      ok: false,

      error:
        "Titel och datum måste anges.",
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
        "project_milestones"
      )
      .insert({
        project_id:
          projectId,

        title:
          input.title.trim(),

        description:
          input.description
            .trim() ||
          null,

        milestone_type:
          input.milestoneType,

        status:
          input.status,

        due_date:
          input.dueDate,

        due_time:
          input.dueTime ||
          null,

        assigned_to:
          input.assignedTo,

        reminder_minutes:
          Math.max(
            0,
            input.reminderMinutes
          ),

        customer_visible:
          input.customerVisible,

        created_by:
          user.id,
      })
      .select(
        "id"
      )
      .single();


  if (error) {
    return {
      ok: false,

      error:
        error.message,
    };
  }


  await logActivity(
    supabase as any,
    projectId,
    "milestone_created",
    "Milstolpe skapad",
    input.title.trim(),
    String(
      data.id
    )
  );


  revalidate(
    projectId
  );


  return {
    ok: true,
  };
}


export async function updateMilestoneAction(
  projectId: string,
  milestoneId: string,
  input:
    MilestoneInput
): Promise<ActionResult> {
  const {
    supabase,
    user,
  } =
    await getInternalUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Du saknar behörighet.",
    };
  }


  if (
    !input.title.trim() ||
    !input.dueDate
  ) {
    return {
      ok: false,

      error:
        "Titel och datum måste anges.",
    };
  }


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_milestones"
      )
      .update({
        title:
          input.title.trim(),

        description:
          input.description
            .trim() ||
          null,

        milestone_type:
          input.milestoneType,

        status:
          input.status,

        due_date:
          input.dueDate,

        due_time:
          input.dueTime ||
          null,

        assigned_to:
          input.assignedTo,

        reminder_minutes:
          Math.max(
            0,
            input.reminderMinutes
          ),

        customer_visible:
          input.customerVisible,
      })
      .eq(
        "id",
        milestoneId
      )
      .eq(
        "project_id",
        projectId
      );


  if (error) {
    return {
      ok: false,

      error:
        error.message,
    };
  }


  await logActivity(
    supabase as any,
    projectId,
    "milestone_updated",
    "Milstolpe uppdaterad",
    input.title.trim(),
    milestoneId
  );


  revalidate(
    projectId
  );


  return {
    ok: true,
  };
}


export async function toggleMilestoneCompletedAction(
  projectId: string,
  milestoneId: string,
  completed:
    boolean
): Promise<ActionResult> {
  const {
    supabase,
    user,
  } =
    await getInternalUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Du saknar behörighet.",
    };
  }


  const {
    data:
      milestone,
  } =
    await (
      supabase as any
    )
      .from(
        "project_milestones"
      )
      .select(
        "title"
      )
      .eq(
        "id",
        milestoneId
      )
      .eq(
        "project_id",
        projectId
      )
      .maybeSingle();


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_milestones"
      )
      .update({
        completed_at:
          completed
            ? new Date()
                .toISOString()
            : null,
      })
      .eq(
        "id",
        milestoneId
      )
      .eq(
        "project_id",
        projectId
      );


  if (error) {
    return {
      ok: false,

      error:
        error.message,
    };
  }


  await logActivity(
    supabase as any,
    projectId,
    completed
      ? "milestone_completed"
      : "milestone_reopened",

    completed
      ? "Milstolpe slutförd"
      : "Milstolpe återöppnad",

    milestone?.title ??
    null,

    milestoneId
  );


  revalidate(
    projectId
  );


  return {
    ok: true,
  };
}


export async function deleteMilestoneAction(
  projectId: string,
  milestoneId: string
): Promise<ActionResult> {
  const {
    supabase,
    user,
  } =
    await getInternalUser();


  if (!user) {
    return {
      ok: false,

      error:
        "Du saknar behörighet.",
    };
  }


  const {
    data:
      milestone,
  } =
    await (
      supabase as any
    )
      .from(
        "project_milestones"
      )
      .select(
        "title"
      )
      .eq(
        "id",
        milestoneId
      )
      .eq(
        "project_id",
        projectId
      )
      .maybeSingle();


  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_milestones"
      )
      .delete()
      .eq(
        "id",
        milestoneId
      )
      .eq(
        "project_id",
        projectId
      );


  if (error) {
    return {
      ok: false,

      error:
        error.message,
    };
  }


  await logActivity(
    supabase as any,
    projectId,
    "milestone_deleted",
    "Milstolpe borttagen",
    milestone?.title ??
    null,
    milestoneId
  );


  revalidate(
    projectId
  );


  return {
    ok: true,
  };
}