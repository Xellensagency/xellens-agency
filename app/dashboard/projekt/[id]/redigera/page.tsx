import Link from "next/link";

import {
  ArrowLeft,
  PencilLine,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import EditProjectForm from "@/components/dashboard/projects/detail/EditProjectForm";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../ProjectSubPage.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function stringValue(
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


function dateValue(
  value: unknown
) {
  const text =
    stringValue(
      value
    );

  if (!text) {
    return "";
  }

  return text.slice(
    0,
    10
  );
}


export default async function EditProjectPage({
  params,
}: Props) {
  const {
    id,
  } =
    await params;

  const supabase =
    await createClient();


  const [
    projectResult,
    customersResult,
    profilesResult,
  ] =
    await Promise.all([
      (
        supabase as any
      )
        .from("projects")
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle(),

      (
        supabase as any
      )
        .from("customers")
        .select(`
          id,
          customer_number,
          name
        `)
        .order(
          "name",
          {
            ascending: true,
          }
        ),

      (
        supabase as any
      )
        .from("profiles")
        .select(`
          id,
          full_name,
          role,
          is_active
        `)
        .eq(
          "is_active",
          true
        )
        .in(
          "role",
          [
            "super_admin",
            "admin",
            "staff",
          ]
        )
        .order(
          "full_name",
          {
            ascending: true,
          }
        ),
    ]);


  if (
    projectResult.error
  ) {
    console.error(
      "Projektet kunde inte hämtas:",
      projectResult.error
    );

    throw new Error(
      projectResult.error.message
    );
  }


  if (
    !projectResult.data
  ) {
    notFound();
  }


  const raw =
    projectResult.data;


  const project = {
    id:
      stringValue(
        raw.id
      ),

    projectNumber:
      stringValue(
        raw.project_number
      ),

    title:
      stringValue(
        raw.title
      ),

    description:
      stringValue(
        raw.description
      ),

    customerId:
      stringValue(
        raw.customer_id
      ),

    ownerId:
      stringValue(
        raw.owner_id
      ),

    status:
      stringValue(
        raw.status,
        "planning"
      ),

    priority:
      stringValue(
        raw.priority,
        "normal"
      ),

    progress:
      Math.max(
        0,
        Math.min(
          100,
          Number(
            raw.progress ??
            0
          )
        )
      ),

    customerVisibility:
      stringValue(
        raw.customer_visibility,
        "hidden"
      ),

    budgetExVat:
      Number(
        raw.budget_ex_vat ??
        raw.budget ??
        0
      ),

    startDate:
      dateValue(
        raw.start_date
      ),

    endDate:
      dateValue(
        raw.end_date
      ),

    deadline:
      dateValue(
        raw.deadline ??
        raw.end_date
      ),
  };


  const customers =
    (
      customersResult.data ??
      []
    ).map(
      (
        customer: any
      ) => ({
        id:
          String(
            customer.id
          ),

        name:
          String(
            customer.name ??
            "Namnlös kund"
          ),

        customerNumber:
          customer.customer_number
            ? String(
                customer.customer_number
              )
            : null,
      })
    );


  const teamMembers =
    (
      profilesResult.data ??
      []
    ).map(
      (
        profile: any
      ) => ({
        id:
          String(
            profile.id
          ),

        fullName:
          String(
            profile.full_name ??
            "Namnlös användare"
          ),

        role:
          String(
            profile.role ??
            ""
          ),
      })
    );


  return (
    <div
      className={
        styles.page
      }
    >
      <header
        className={
          styles.header
        }
      >
        <Link
          href={`/dashboard/projekt/${id}`}
          className={
            styles.back
          }
        >
          <ArrowLeft
            size={17}
          />

          Till projektet
        </Link>

        <span
          className={
            styles.eyebrow
          }
        >
          {
            project.projectNumber
          }
        </span>

        <h1>
          Redigera projekt
        </h1>

        <p>
          Uppdatera information,
          ansvar, tidsplan och
          inställningar för{" "}
          <strong>
            {project.title}
          </strong>.
        </p>
      </header>


      <ProjectWorkspaceTabs
        projectId={id}
      />


      <EditProjectForm
        project={
          project
        }
        customers={
          customers
        }
        teamMembers={
          teamMembers
        }
      />
    </div>
  );
}