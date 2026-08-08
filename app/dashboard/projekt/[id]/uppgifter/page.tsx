import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import ProjectTasksClient from "@/components/dashboard/projects/detail/ProjectTasksClient";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../ProjectSubPage.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


export default async function ProjectTasksPage({
  params,
}: Props) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const [
    projectResult,
    tasksResult,
    teamResult,
    checklistResult,
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
        .eq("id", id)
        .maybeSingle(),

      (
        supabase as any
      )
        .from("project_tasks")
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          assignee_id,
          created_at,
          updated_at
        `)
        .eq(
          "project_id",
          id
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),

      (
        supabase as any
      )
        .from("profiles")
        .select(`
          id,
          full_name
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
          "full_name"
        ),

      (
        supabase as any
      )
        .from(
          "project_task_checklist_items"
        )
        .select(`
          id,
          task_id,
          title,
          is_completed,
          sort_order
        `)
        .order(
          "sort_order",
          {
            ascending: true,
          }
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        ),
    ]);


  if (
    projectResult.error ||
    !projectResult.data
  ) {
    notFound();
  }


  const rawTasks =
    tasksResult.data ?? [];

  const team =
    teamResult.data ?? [];

  const checklist =
    checklistResult.data ?? [];


  const teamMap =
    new Map(
      team.map(
        (member: any) => [
          String(
            member.id
          ),
          member,
        ]
      )
    );


  const tasks =
    rawTasks.map(
      (task: any) => ({
        ...task,

        assignee:
          task.assignee_id
            ? teamMap.get(
                String(
                  task.assignee_id
                )
              ) ?? null
            : null,

        checklist:
          checklist.filter(
            (item: any) =>
              String(
                item.task_id
              ) ===
              String(
                task.id
              )
          ),
      })
    );


  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link
          href={`/dashboard/projekt/${id}`}
          className={styles.back}
        >
          <ArrowLeft size={17} />

          Till översikt
        </Link>

        <span className={styles.eyebrow}>
          {
            projectResult.data
              .project_number
          }
        </span>

        <h1>
          Uppgifter
        </h1>

        <p>
          Planera och följ arbetet för{" "}
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

      <ProjectTasksClient
        projectId={id}
        tasks={tasks}
        teamMembers={team}
      />
    </div>
  );
}