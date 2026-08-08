import { createClient } from "@/lib/supabase/server";

export type DashboardActivityItem = {
  id: string;
  type:
    | "project"
    | "customer"
    | "invoice";
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone:
    | "green"
    | "blue"
    | "champagne";
};

type UnknownRow =
  Record<string, unknown>;

function text(
  value: unknown,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

export async function getDashboardActivity():
Promise<DashboardActivityItem[]> {
  const supabase =
    await createClient();

  const [
    projectsResult,
    customersResult,
    invoiceEventsResult,
  ] = await Promise.all([
    (supabase as any)
      .from("projects")
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at
      `)
      .order("updated_at", {
        ascending: false,
      })
      .limit(8),

    (supabase as any)
      .from("customers")
      .select(`
        id,
        name,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    (supabase as any)
      .from("invoice_events")
      .select(`
        id,
        invoice_id,
        title,
        description,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(10),
  ]);

  const activities:
    DashboardActivityItem[] = [];

  if (!projectsResult.error) {
    for (
      const raw of
      projectsResult.data ?? []
    ) {
      const row =
        raw as UnknownRow;

      const createdAt =
        text(row.created_at);

      const updatedAt =
        text(
          row.updated_at,
          createdAt
        );

      const createdTime =
        new Date(
          createdAt
        ).getTime();

      const updatedTime =
        new Date(
          updatedAt
        ).getTime();

      const wasUpdated =
        Number.isFinite(
          createdTime
        ) &&
        Number.isFinite(
          updatedTime
        ) &&
        updatedTime -
          createdTime >
          5 * 60 * 1000;

      activities.push({
        id:
          `project-${text(row.id)}-${updatedAt}`,
        type: "project",
        title:
          wasUpdated
            ? "Projekt uppdaterat"
            : "Nytt projekt",
        description:
          text(
            row.title,
            "Namnlöst projekt"
          ),
        href:
          `/dashboard/projekt/${text(row.id)}`,
        createdAt: updatedAt,
        tone: "green",
      });
    }
  }

  if (!customersResult.error) {
    for (
      const raw of
      customersResult.data ?? []
    ) {
      const row =
        raw as UnknownRow;

      activities.push({
        id:
          `customer-${text(row.id)}`,
        type: "customer",
        title:
          "Ny kund registrerad",
        description:
          text(
            row.name,
            "Namnlös kund"
          ),
        href:
          `/dashboard/kunder/${text(row.id)}`,
        createdAt:
          text(row.created_at),
        tone: "blue",
      });
    }
  }

  if (!invoiceEventsResult.error) {
    for (
      const raw of
      invoiceEventsResult.data ?? []
    ) {
      const row =
        raw as UnknownRow;

      activities.push({
        id:
          `invoice-${text(row.id)}`,
        type: "invoice",
        title:
          text(
            row.title,
            "Fakturahändelse"
          ),
        description:
          text(
            row.description,
            "Faktura uppdaterad"
          ),
        href:
          `/dashboard/fakturor/${text(row.invoice_id)}`,
        createdAt:
          text(row.created_at),
        tone: "champagne",
      });
    }
  }

  return activities
    .filter(
      (item) =>
        Boolean(item.createdAt)
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    )
    .slice(0, 8);
}