"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


export type UpdateProjectState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;
};


export const initialUpdateProjectState:
UpdateProjectState = {
  status: "idle",
  message: "",
};


const allowedStatuses =
  new Set([
    "planning",
    "ongoing",
    "waiting_customer",
    "production",
    "paused",
    "completed",
    "cancelled",
    "archived",
  ]);


const allowedPriorities =
  new Set([
    "low",
    "normal",
    "high",
    "urgent",
  ]);


const allowedVisibility =
  new Set([
    "hidden",
    "immediate",
    "after_approval",
  ]);


function text(
  value:
    FormDataEntryValue |
    null
) {
  return String(
    value ?? ""
  ).trim();
}


export async function updateProjectAction(
  _previousState:
    UpdateProjectState,

  formData:
    FormData
): Promise<UpdateProjectState> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error:
      authError,
  } =
    await supabase.auth.getUser();


  if (
    authError ||
    !user
  ) {
    return {
      status: "error",
      message:
        "Du är inte längre inloggad.",
    };
  }


  const projectId =
    text(
      formData.get(
        "projectId"
      )
    );

  const title =
    text(
      formData.get(
        "title"
      )
    );

  const customerId =
    text(
      formData.get(
        "customerId"
      )
    );

  const ownerId =
    text(
      formData.get(
        "ownerId"
      )
    );

  const description =
    text(
      formData.get(
        "description"
      )
    );

  const status =
    text(
      formData.get(
        "status"
      )
    );

  const priority =
    text(
      formData.get(
        "priority"
      )
    );

  const customerVisibility =
    text(
      formData.get(
        "customerVisibility"
      )
    );

  const startDate =
    text(
      formData.get(
        "startDate"
      )
    );

  const endDate =
    text(
      formData.get(
        "endDate"
      )
    );

  const deadline =
    text(
      formData.get(
        "deadline"
      )
    );


  const progressRaw =
    Number(
      text(
        formData.get(
          "progress"
        )
      )
    );


  const budgetRaw =
    Number(
      text(
        formData.get(
          "budgetExVat"
        )
      ) || "0"
    );


  if (
    !projectId
  ) {
    return {
      status: "error",
      message:
        "Projekt-ID saknas.",
    };
  }


  if (!title) {
    return {
      status: "error",
      message:
        "Projektet måste ha ett namn.",
    };
  }


  if (
    !allowedStatuses.has(
      status
    )
  ) {
    return {
      status: "error",
      message:
        "Ogiltig projektstatus.",
    };
  }


  if (
    !allowedPriorities.has(
      priority
    )
  ) {
    return {
      status: "error",
      message:
        "Ogiltig prioritet.",
    };
  }


  if (
    !allowedVisibility.has(
      customerVisibility
    )
  ) {
    return {
      status: "error",
      message:
        "Ogiltig kundsynlighet.",
    };
  }


  const progress =
    Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(
          progressRaw
        )
          ? Math.round(
              progressRaw
            )
          : 0
      )
    );


  const budget =
    Number.isFinite(
      budgetRaw
    )
      ? Math.max(
          budgetRaw,
          0
        )
      : 0;


  if (
    startDate &&
    endDate &&
    endDate < startDate
  ) {
    return {
      status: "error",
      message:
        "Slutdatum kan inte ligga före startdatum.",
    };
  }


  const {
    error:
      updateError,
  } =
    await (
      supabase as any
    )
      .from("projects")
      .update({
        title,

        customer_id:
          customerId ||
          null,

        owner_id:
          ownerId ||
          null,

        description:
          description ||
          null,

        status,

        priority,

        progress,

        customer_visibility:
          customerVisibility,

        budget_ex_vat:
          budget,

        start_date:
          startDate ||
          null,

        end_date:
          endDate ||
          null,

        deadline:
          deadline ||
          null,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        projectId
      );


  if (
    updateError
  ) {
    console.error(
      "Projektet kunde inte uppdateras:",
      updateError
    );

    return {
      status: "error",
      message:
        updateError.message ||
        "Projektet kunde inte sparas.",
    };
  }


  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/projekt"
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/redigera`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/aktivitet`
  );

  revalidatePath(
    `/dashboard/projekt/${projectId}/ekonomi`
  );


  return {
    status: "success",
    message:
      "Projektet är uppdaterat.",
  };
}