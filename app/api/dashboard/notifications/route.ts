import {
  getAdminDashboard,
} from "@/lib/dashboard/get-admin-dashboard";

import {
  createClient,
} from "@/lib/supabase/server";

type NotificationTone =
  | "danger"
  | "warning"
  | "info"
  | "success";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: NotificationTone;
};

function parseDate(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function daysUntil(
  target: Date
) {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const copy =
    new Date(target);

  copy.setHours(
    0,
    0,
    0,
    0
  );

  return Math.round(
    (
      copy.getTime() -
      today.getTime()
    ) /
      86400000
  );
}

export async function GET() {
  try {
    const [
      dashboard,
      invoiceResult,
    ] = await Promise.all([
      getAdminDashboard(),

      (async () => {
        const supabase =
          await createClient();

        return (
          supabase as any
        )
          .from("invoices")
          .select(`
            id,
            invoice_number,
            title,
            status,
            due_date,
            total_inc_vat,
            amount_paid
          `)
          .order(
            "due_date",
            {
              ascending: true,
            }
          )
          .limit(30);
      })(),
    ]);

    const notifications:
      NotificationItem[] = [];

    for (
      const deadline of
      dashboard.deadlines
    ) {
      const date =
        parseDate(
          deadline.due_at
        );

      if (!date) {
        continue;
      }

      const days =
        daysUntil(date);

      if (days < 0) {
        notifications.push({
          id:
            `deadline-overdue-${deadline.id}`,
          title:
            "Försenad deadline",
          description:
            `${deadline.project_title} · ${deadline.title}`,
          href:
            `/dashboard/projekt/${deadline.project_id}`,
          tone:
            "danger",
        });
      } else if (days <= 2) {
        notifications.push({
          id:
            `deadline-soon-${deadline.id}`,
          title:
            days === 0
              ? "Deadline idag"
              : days === 1
                ? "Deadline imorgon"
                : "Deadline inom 2 dagar",
          description:
            `${deadline.project_title} · ${deadline.title}`,
          href:
            `/dashboard/projekt/${deadline.project_id}`,
          tone:
            "warning",
        });
      }
    }

    for (
      const project of
      dashboard.recent_projects
    ) {
      if (
        project.status ===
        "waiting_customer"
      ) {
        notifications.push({
          id:
            `waiting-${project.id}`,
          title:
            "Väntar på kund",
          description:
            `${project.title} · ${project.customer_name}`,
          href:
            `/dashboard/projekt/${project.id}`,
          tone:
            "info",
        });
      }

      if (
        !project.deadline &&
        project.status !==
          "completed" &&
        project.status !==
          "cancelled"
      ) {
        notifications.push({
          id:
            `deadline-missing-${project.id}`,
          title:
            "Projekt saknar deadline",
          description:
            project.title,
          href:
            `/dashboard/projekt/${project.id}`,
          tone:
            "info",
        });
      }
    }

    if (
      !invoiceResult.error
    ) {
      for (
        const invoice of
        invoiceResult.data ??
        []
      ) {
        const total =
          Number(
            invoice.total_inc_vat ??
            0
          );

        const paid =
          Number(
            invoice.amount_paid ??
            0
          );

        const outstanding =
          Math.max(
            total - paid,
            0
          );

        const status =
          String(
            invoice.status ??
            ""
          ).toLowerCase();

        if (
          outstanding <= 0 ||
          status === "paid" ||
          status === "cancelled" ||
          status === "credited"
        ) {
          continue;
        }

        const dueDate =
          parseDate(
            invoice.due_date
          );

        if (!dueDate) {
          continue;
        }

        const days =
          daysUntil(
            dueDate
          );

        const number =
          invoice.invoice_number ||
          invoice.title ||
          "Faktura";

        if (days < 0) {
          notifications.push({
            id:
              `invoice-overdue-${invoice.id}`,
            title:
              "Förfallen faktura",
            description:
              `${number} · ${outstanding.toLocaleString(
                "sv-SE"
              )} kr kvar`,
            href:
              `/dashboard/fakturor/${invoice.id}`,
            tone:
              "danger",
          });
        } else if (
          days <= 3
        ) {
          notifications.push({
            id:
              `invoice-soon-${invoice.id}`,
            title:
              days === 0
                ? "Faktura förfaller idag"
                : "Faktura förfaller snart",
            description:
              `${number} · ${outstanding.toLocaleString(
                "sv-SE"
              )} kr kvar`,
            href:
              `/dashboard/fakturor/${invoice.id}`,
            tone:
              "warning",
          });
        }
      }
    }

    return Response.json({
      notifications:
        notifications.slice(
          0,
          12
        ),
    });
  } catch (error) {
    console.error(
      "Notiser kunde inte hämtas:",
      error
    );

    return Response.json(
      {
        notifications: [],
      },
      {
        status: 500,
      }
    );
  }
}