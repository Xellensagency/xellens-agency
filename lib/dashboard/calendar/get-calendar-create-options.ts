import { createClient } from "@/lib/supabase/server";

import type {
  CalendarCreateOptions,
  CalendarCustomerOption,
  CalendarProjectOption,
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

function resolveProjectName(
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

export async function getCalendarCreateOptions(): Promise<CalendarCreateOptions> {
  const supabase =
    await createClient();

  const [
    customersResult,
    projectsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("customers")
      .select("id, name")
      .order("name", {
        ascending: true,
      }),

    (supabase as any)
      .from("projects")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (customersResult.error) {
    console.error(
      "Kunder kunde inte hämtas:",
      customersResult.error
    );

    throw new Error(
      customersResult.error.message
    );
  }

  if (projectsResult.error) {
    console.error(
      "Projekt kunde inte hämtas:",
      projectsResult.error
    );

    throw new Error(
      projectsResult.error.message
    );
  }

  const customers: CalendarCustomerOption[] =
    (
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

  const projects: CalendarProjectOption[] =
    (
      Array.isArray(
        projectsResult.data
      )
        ? projectsResult.data
        : []
    ).map(
      (row: UnknownRow) => ({
        id: String(row.id ?? ""),
        name:
          resolveProjectName(row),
        customerId:
          optionalString(
            row.customer_id
          ),
      })
    );

  return {
    customers,
    projects,
  };
}
