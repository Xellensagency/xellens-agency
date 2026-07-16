import { createClient } from "@/lib/supabase/server";

import {
  getCalendarCreateOptions,
} from "./get-calendar-create-options";

import type {
  CalendarEventColor,
  CalendarEventEditData,
  CalendarEventType,
} from "./calendar-types";

type UnknownRow =
  Record<string, unknown>;

function optionalString(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function normalizeEventType(
  value: unknown
): CalendarEventType {
  switch (value) {
    case "customer_meeting":
    case "workshop":
    case "deadline":
    case "follow_up":
    case "internal":
      return value;

    default:
      return "meeting";
  }
}

function normalizeColor(
  value: unknown
): CalendarEventColor {
  switch (value) {
    case "teal":
    case "purple":
    case "red":
    case "orange":
    case "slate":
      return value;

    default:
      return "blue";
  }
}

export async function getCalendarEventEditData(
  eventId: string
): Promise<CalendarEventEditData | null> {
  const supabase =
    await createClient();

  const [
    eventResult,
    options,
  ] = await Promise.all([
    (supabase as any)
      .from("calendar_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle(),

    getCalendarCreateOptions(),
  ]);

  if (eventResult.error) {
    console.error(
      "Händelsen kunde inte hämtas:",
      eventResult.error
    );

    throw new Error(
      eventResult.error.message
    );
  }

  if (!eventResult.data) {
    return null;
  }

  const row =
    eventResult.data as UnknownRow;

  const customerId =
    optionalString(
      row.customer_id
    );

  const projectId =
    optionalString(
      row.project_id
    );

  const customer =
    options.customers.find(
      (item) =>
        item.id === customerId
    );

  const project =
    options.projects.find(
      (item) =>
        item.id === projectId
    );

  const reminders =
    Array.isArray(
      row.reminder_minutes
    )
      ? row.reminder_minutes
          .map(Number)
          .filter(Number.isFinite)
      : [60];

  return {
    options,

    event: {
      id: String(row.id ?? ""),

      title:
        String(row.title ?? "") ||
        "Namnlös händelse",

      eventType:
        normalizeEventType(
          row.event_type
        ),

      description:
        optionalString(
          row.description
        ),

      customerId,

      customerName:
        customer?.name ?? null,

      projectId,

      projectName:
        project?.name ?? null,

      ownerId:
        optionalString(
          row.owner_id
        ),

      startAt:
        String(row.start_at ?? ""),

      endAt:
        String(row.end_at ?? ""),

      allDay:
        row.all_day === true,

      locationType:
        row.location_type ===
        "physical"
          ? "physical"
          : row.location_type ===
              "online"
            ? "online"
            : row.location_type ===
                "meeting_room"
              ? "meeting_room"
              : "none",

      locationName:
        optionalString(
          row.location_name
        ),

      meetingUrl:
        optionalString(
          row.meeting_url
        ),

      colorKey:
        normalizeColor(
          row.color_key
        ),

      status:
        row.status === "completed"
          ? "completed"
          : row.status ===
              "cancelled"
            ? "cancelled"
            : "scheduled",

      reminderMinutes:
        reminders.length > 0
          ? reminders
          : [60],
    },
  };
}
