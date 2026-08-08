"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done";


type TaskPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";


type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
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
    data: profile,
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

  const allowed =
    profile?.is_active === true &&
    [
      "super_admin",
      "admin",
      "staff",
    ].includes(
      String(
        profile.role
      )
    );

  return {
    supabase,
    user:
      allowed
        ? user
        : null,
  };
}


export async function createProjectTaskAction(
  input: CreateTaskInput
) {
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

  const title =
    input.title.trim();

  if (!title) {
    return {
      ok: false,
      error:
        "Ange ett namn på uppgiften.",
    };
  }

  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_tasks"
      )
      .insert({
        project_id:
          input.projectId,

        title,

        description:
          input.description
            ?.trim() ||
          null,

        status:
          input.status ??
          "todo",

        priority:
          input.priority ??
          "normal",

        due_date:
          input.dueDate ||
          null,

        assignee_id:
          input.assigneeId ||
          null,

        created_by:
          user.id,
      });

  if (error) {
    console.error(
      "create project task:",
      error
    );

    return {
      ok: false,
      error:
        error.message ||
        "Uppgiften kunde inte skapas.",
    };
  }

  revalidatePath(
    `/dashboard/projekt/${input.projectId}/uppgifter`
  );

  return {
    ok: true,
  };
}


export async function updateProjectTaskStatusAction(
  projectId: string,
  taskId: string,
  status: TaskStatus
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

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
        "project_tasks"
      )
      .update({
        status,
      })
      .eq(
        "id",
        taskId
      )
      .eq(
        "project_id",
        projectId
      );

  if (error) {
    return {
      ok: false,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/uppgifter`
  );

  return {
    ok: true,
  };
}


export async function deleteProjectTaskAction(
  projectId: string,
  taskId: string
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

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
        "project_tasks"
      )
      .delete()
      .eq(
        "id",
        taskId
      )
      .eq(
        "project_id",
        projectId
      );

  if (error) {
    return {
      ok: false,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/uppgifter`
  );

  return {
    ok: true,
  };
}


export async function addChecklistItemAction(
  projectId: string,
  taskId: string,
  title: string
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

  if (!user) {
    return {
      ok: false,
    };
  }

  const cleanTitle =
    title.trim();

  if (!cleanTitle) {
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
        "project_task_checklist_items"
      )
      .insert({
        task_id:
          taskId,

        title:
          cleanTitle,

        created_by:
          user.id,
      });

  if (error) {
    return {
      ok: false,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/uppgifter`
  );

  return {
    ok: true,
  };
}


export async function toggleChecklistItemAction(
  projectId: string,
  itemId: string,
  completed: boolean
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

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
        "project_task_checklist_items"
      )
      .update({
        is_completed:
          completed,
      })
      .eq(
        "id",
        itemId
      );

  if (error) {
    return {
      ok: false,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/uppgifter`
  );

  return {
    ok: true,
  };
}