import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import ProjectActivityClient, {
  type ProjectActivityItem,
} from "@/components/dashboard/projects/detail/ProjectActivityClient";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../ProjectSubPage.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


type ActivityRow = {
  id: string;

  category:
    | "project"
    | "task"
    | "file"
    | "design"
    | "offer"
    | "invoice";

  event_type: string;

  title: string;

  description:
    string | null;

  actor_name:
    string | null;

  created_at: string;
};


export default async function ProjectActivityPage({
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
    activityResult,
  ] =
    await Promise.all([
      (
        supabase as any
      )
        .from("projects")
        .select(`
          id,
          project_number,
          title
        `)
        .eq(
          "id",
          id
        )
        .maybeSingle(),

      (
        supabase as any
      )
        .from(
          "project_activity_events"
        )
        .select(`
          id,
          category,
          event_type,
          title,
          description,
          actor_name,
          created_at
        `)
        .eq(
          "project_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(500),
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


  if (
    activityResult.error
  ) {
    console.error(
      "Aktivitetsloggen kunde inte hämtas:",
      activityResult.error
    );

    throw new Error(
      activityResult.error.message ||
      "Aktivitetsloggen kunde inte hämtas."
    );
  }


  const rows =
    (
      activityResult.data ??
      []
    ) as ActivityRow[];


  const items:
    ProjectActivityItem[] =
      rows.map(
        (
          row
        ) => ({
          id:
            String(
              row.id
            ),

          category:
            row.category,

          type:
            String(
              row.event_type
            ),

          title:
            String(
              row.title
            ),

          description:
            row.description
              ? String(
                  row.description
                )
              : null,

          actor:
            row.actor_name
              ? String(
                  row.actor_name
                )
              : null,

          timestamp:
            String(
              row.created_at
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

          Till översikt
        </Link>

        <span
          className={
            styles.eyebrow
          }
        >
          {
            projectResult.data
              .project_number
          }
        </span>

        <h1>
          Aktivitet
        </h1>

        <p>
          Full revisionshistorik för{" "}
          <strong>
            {
              projectResult.data
                .title
            }
          </strong>.
        </p>
      </header>


      <ProjectWorkspaceTabs
        projectId={id}
      />


      <ProjectActivityClient
        items={items}
      />
    </div>
  );
}