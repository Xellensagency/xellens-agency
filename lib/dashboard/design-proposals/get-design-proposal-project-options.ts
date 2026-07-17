import {
  createClient,
} from "@/lib/supabase/server";

export type DesignProposalProjectOption = {
  id: string;
  projectNumber: string;
  title: string;
  customerName: string;
  status: string;
};

type ProjectRow = {
  id: string;
  project_number: string;
  title: string;
  customer_id: string;
  status: string;
};

type CustomerRow = {
  id: string;
  name: string;
};

export async function getDesignProposalProjectOptions():
Promise<DesignProposalProjectOption[]> {
  const supabase =
    await createClient();

  const {
    data: projectData,
    error: projectError,
  } = await supabase
    .from("projects")
    .select(`
      id,
      project_number,
      title,
      customer_id,
      status
    `)
    .in(
      "status",
      [
        "planning",
        "ongoing",
        "waiting_customer",
        "production",
        "paused",
      ]
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (projectError) {
    console.error(
      "Kunde inte hämta projekt:",
      projectError
    );

    throw new Error(
      "Projekten kunde inte hämtas."
    );
  }

  const projects =
    (projectData ?? []) as ProjectRow[];

  const customerIds = [
    ...new Set(
      projects
        .map(
          (project) =>
            project.customer_id
        )
        .filter(Boolean)
    ),
  ];

  let customers:
  CustomerRow[] = [];

  if (customerIds.length > 0) {
    const {
      data: customerData,
      error: customerError,
    } = await supabase
      .from("customers")
      .select("id, name")
      .in(
        "id",
        customerIds
      );

    if (customerError) {
      console.error(
        "Kunde inte hämta projektkunder:",
        customerError
      );

      throw new Error(
        "Projektkunderna kunde inte hämtas."
      );
    }

    customers =
      (customerData ?? []) as CustomerRow[];
  }

  const customerNames =
    new Map(
      customers.map(
        (customer) => [
          customer.id,
          customer.name,
        ]
      )
    );

  return projects.map(
    (project) => ({
      id: project.id,

      projectNumber:
        project.project_number,

      title:
        project.title,

      customerName:
        customerNames.get(
          project.customer_id
        ) ?? "Okänd kund",

      status:
        project.status,
    })
  );
}
