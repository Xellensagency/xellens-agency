import { createClient } from "@/lib/supabase/server";

import type {
  CalendarCustomerOption,
  CalendarEventColor,
  CalendarEventItem,
  CalendarEventType,
  CalendarPageData,
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

function eventType(
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

function eventColor(
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

function projectName(
  row: UnknownRow
) {
  return String(
    row.name ??
      row.title ??
      row.project_name ??
      row.project_title ??
      "Namnlöst projekt"
  );
}

function localDateString() {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
}

export async function getCalendarPageData(): Promise<CalendarPageData> {
  const supabase =
    await createClient();

  const {
    data: userData,
  } = await supabase.auth.getUser();

  const [
    eventsResult,
    customersResult,
    projectsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("calendar_events")
      .select("*")
      .order("start_at", {
        ascending: true,
      })
      .limit(500),

    (supabase as any)
      .from("customers")
      .select("id, name")
      .order("name", {
        ascending: true,
      }),

    (supabase as any)
      .from("projects")
      .select("*"),
  ]);

  const errors = [
    eventsResult.error,
    customersResult.error,
    projectsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error(
      "Kalendern kunde inte hämtas:",
      errors
    );

    throw new Error(
      errors[0]?.message ||
        "Kalendern kunde inte hämtas."
    );
  }

  const customers: CalendarCustomerOption[] = (
      Array.isArray(
        customersResult.data
      )
        ? customersResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id: String(row.id ?? ""),
        name:
          String(row.name ?? "") ||
          "Namnlös kund",
      })
    );

  const customerNames =
    new Map(
      customers.map((customer) => [
        customer.id,
        customer.name,
      ])
    );

  const projectRows: UnknownRow[] =
    Array.isArray(
      projectsResult.data
    )
      ? projectsResult.data
      : [];

  const projectNames =
    new Map(
      projectRows.map((row) => [
        String(row.id ?? ""),
        projectName(row),
      ])
    );

  const events: CalendarEventItem[] =
    (
      Array.isArray(eventsResult.data)
        ? eventsResult.data
        : []
    ).map(
      (row: UnknownRow) => {
        const customerId =
          optionalString(
            row.customer_id
          );

        const projectId =
          optionalString(
            row.project_id
          );

        return {
          id: String(row.id ?? ""),

          title:
            String(row.title ?? "") ||
            "Namnlös händelse",

          eventType:
            eventType(row.event_type),

          description:
            optionalString(
              row.description
            ),

          customerId,

          customerName:
            customerId
              ? customerNames.get(
                  customerId
                ) ?? null
              : null,

          projectId,

          projectName:
            projectId
              ? projectNames.get(
                  projectId
                ) ?? null
              : null,

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
            eventColor(
              row.color_key
            ),

          status:
            row.status ===
            "completed"
              ? "completed"
              : row.status ===
                  "cancelled"
                ? "cancelled"
                : "scheduled",
        };
      }
    );

  return {
    events,
    customers,
    currentUserId:
      userData.user?.id ?? null,
    today: localDateString(),
  };
}

