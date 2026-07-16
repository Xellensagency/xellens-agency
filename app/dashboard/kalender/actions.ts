"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  CalendarEventType,
} from "@/lib/dashboard/calendar/calendar-types";

export type CreateCalendarEventInput = {
  title: string;
  eventType: CalendarEventType;
  description: string;

  customerId: string;
  projectId: string;

  startAt: string;
  endAt: string;

  locationType:
    | "none"
    | "physical"
    | "online"
    | "meeting_room";

  locationName: string;
  meetingUrl: string;

  reminderMinutes: number[];
};

export type CreateCalendarEventResult = {
  ok: boolean;
  eventId?: string;
  error?: string;
};

const eventColors: Record<
  CalendarEventType,
  string
> = {
  meeting: "blue",
  customer_meeting: "teal",
  workshop: "purple",
  deadline: "red",
  follow_up: "orange",
  internal: "slate",
};

function cleanOptionalText(
  value: string
) {
  const cleaned = value.trim();

  return cleaned || null;
}

export async function createCalendarEventAction(
  input: CreateCalendarEventInput
): Promise<CreateCalendarEventResult> {
  try {
    const title =
      input.title.trim();

    if (!title) {
      return {
        ok: false,
        error:
          "Händelsen måste ha en titel.",
      };
    }

    const startAt =
      new Date(input.startAt);

    const endAt =
      new Date(input.endAt);

    if (
      Number.isNaN(
        startAt.getTime()
      ) ||
      Number.isNaN(
        endAt.getTime()
      )
    ) {
      return {
        ok: false,
        error:
          "Datum eller tid är ogiltig.",
      };
    }

    if (
      endAt.getTime() <=
      startAt.getTime()
    ) {
      return {
        ok: false,
        error:
          "Sluttiden måste vara efter starttiden.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

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

    const reminderMinutes =
      input.reminderMinutes
        .map((value) =>
          Math.max(
            Math.round(value),
            0
          )
        )
        .filter(
          (value, index, values) =>
            values.indexOf(value) ===
            index
        );

    const {
      data,
      error,
    } = await (
      supabase as any
    )
      .from("calendar_events")
      .insert({
        title,

        event_type:
          input.eventType,

        description:
          cleanOptionalText(
            input.description
          ),

        customer_id:
          input.customerId || null,

        project_id:
          input.projectId || null,

        owner_id:
          userData.user.id,

        start_at:
          startAt.toISOString(),

        end_at:
          endAt.toISOString(),

        all_day: false,

        location_type:
          input.locationType,

        location_name:
          cleanOptionalText(
            input.locationName
          ),

        meeting_url:
          cleanOptionalText(
            input.meetingUrl
          ),

        color_key:
          eventColors[
            input.eventType
          ],

        status: "scheduled",

        reminder_minutes:
          reminderMinutes.length > 0
            ? reminderMinutes
            : [60],

        created_by:
          userData.user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Kalenderhändelsen kunde inte skapas:",
        error
      );

      return {
        ok: false,
        error:
          error.message ||
          "Händelsen kunde inte sparas.",
      };
    }

    revalidatePath(
      "/dashboard/kalender"
    );

    return {
      ok: true,
      eventId: String(
        data?.id ?? ""
      ),
    };
  }
  catch (error) {
    console.error(
      "Oväntat kalenderfel:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}

export type UpdateCalendarEventInput =
  CreateCalendarEventInput & {
    eventId: string;
    status:
      | "scheduled"
      | "completed"
      | "cancelled";
  };

export type CalendarMutationResult = {
  ok: boolean;
  error?: string;
};

export async function updateCalendarEventAction(
  input: UpdateCalendarEventInput
): Promise<CalendarMutationResult> {
  try {
    if (!input.eventId) {
      return {
        ok: false,
        error:
          "Händelsens ID saknas.",
      };
    }

    const title =
      input.title.trim();

    if (!title) {
      return {
        ok: false,
        error:
          "Händelsen måste ha en titel.",
      };
    }

    const startAt =
      new Date(input.startAt);

    const endAt =
      new Date(input.endAt);

    if (
      Number.isNaN(
        startAt.getTime()
      ) ||
      Number.isNaN(
        endAt.getTime()
      )
    ) {
      return {
        ok: false,
        error:
          "Datum eller tid är ogiltig.",
      };
    }

    if (
      endAt.getTime() <=
      startAt.getTime()
    ) {
      return {
        ok: false,
        error:
          "Sluttiden måste vara efter starttiden.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

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

    const reminders =
      input.reminderMinutes
        .map((value) =>
          Math.max(
            Math.round(value),
            0
          )
        )
        .filter(
          (value, index, values) =>
            values.indexOf(value) ===
            index
        );

    const {
      error,
    } = await (
      supabase as any
    )
      .from("calendar_events")
      .update({
        title,

        event_type:
          input.eventType,

        description:
          cleanOptionalText(
            input.description
          ),

        customer_id:
          input.customerId || null,

        project_id:
          input.projectId || null,

        start_at:
          startAt.toISOString(),

        end_at:
          endAt.toISOString(),

        location_type:
          input.locationType,

        location_name:
          cleanOptionalText(
            input.locationName
          ),

        meeting_url:
          cleanOptionalText(
            input.meetingUrl
          ),

        color_key:
          eventColors[
            input.eventType
          ],

        status:
          input.status,

        reminder_minutes:
          reminders.length > 0
            ? reminders
            : [60],
      })
      .eq("id", input.eventId);

    if (error) {
      console.error(
        "Händelsen kunde inte uppdateras:",
        error
      );

      return {
        ok: false,
        error:
          error.message ||
          "Händelsen kunde inte uppdateras.",
      };
    }

    revalidatePath(
      "/dashboard/kalender"
    );

    revalidatePath(
      `/dashboard/kalender/${input.eventId}`
    );

    return {
      ok: true,
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel vid uppdatering:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}

export async function deleteCalendarEventAction(
  eventId: string
): Promise<CalendarMutationResult> {
  try {
    if (!eventId) {
      return {
        ok: false,
        error:
          "Händelsens ID saknas.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

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
      error,
    } = await (
      supabase as any
    )
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error(
        "Händelsen kunde inte tas bort:",
        error
      );

      return {
        ok: false,
        error:
          error.message ||
          "Händelsen kunde inte tas bort.",
      };
    }

    revalidatePath(
      "/dashboard/kalender"
    );

    return {
      ok: true,
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel vid borttagning:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}
