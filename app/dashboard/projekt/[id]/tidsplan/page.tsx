import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectTimelineClient, {
  type TimelineMilestone,
} from "@/components/dashboard/projects/detail/ProjectTimelineClient";

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


function text(
  value: unknown
) {
  return value == null
    ? ""
    : String(
        value
      );
}


function dateOnly(
  value: unknown
) {
  const raw =
    text(value);

  return raw
    ? raw.slice(
        0,
        10
      )
    : "";
}


export default async function ProjectTimelinePage({
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
    milestoneResult,
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
        .from(
          "project_milestones"
        )
        .select("*")
        .eq(
          "project_id",
          id
        )
        .order(
          "due_date",
          {
            ascending: true,
          }
        ),

      (
        supabase as any
      )
        .from("profiles")
        .select(
          "id, full_name, is_active"
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "full_name"
        ),
    ]);


  if (
    projectResult.error
  ) {
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
    milestoneResult.error
  ) {
    throw new Error(
      milestoneResult.error.message
    );
  }


  const profiles =
    profilesResult.data ??
    [];


  const profileMap =
    new Map(
      profiles.map(
        (
          profile: any
        ) => [
          String(
            profile.id
          ),

          String(
            profile.full_name ??
            "Namnlös användare"
          ),
        ]
      )
    );


  const milestones:
    TimelineMilestone[] =
      (
        milestoneResult.data ??
        []
      ).map(
        (
          item: any
        ) => ({
          id:
            String(
              item.id
            ),

          title:
            text(
              item.title
            ),

          description:
            text(
              item.description
            ),

          milestoneType:
            (
              item.milestone_type ||
              "other"
            ) as TimelineMilestone["milestoneType"],

          status:
            (
              item.status ||
              "pending"
            ) as TimelineMilestone["status"],

          dueDate:
            dateOnly(
              item.due_date
            ),

          dueTime:
            text(
              item.due_time
            ),

          assignedTo:
            item.assigned_to
              ? String(
                  item.assigned_to
                )
              : null,

          assignedName:
            item.assigned_to
              ? profileMap.get(
                  String(
                    item.assigned_to
                  )
                ) ??
                null
              : null,

          reminderMinutes:
            Number(
              item.reminder_minutes ??
              0
            ),

          customerVisible:
            Boolean(
              item.customer_visible
            ),

          completedAt:
            item.completed_at
              ? String(
                  item.completed_at
                )
              : null,
        })
      );


  const project =
    projectResult.data;


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
          {text(
            project.project_number
          )}
        </span>

        <h1>
          Tidsplan
        </h1>

        <p>
          Milstolpar, leveranser och
          deadlines för{" "}
          <strong>
            {text(
              project.title
            )}
          </strong>.
        </p>
      </header>


      <ProjectWorkspaceTabs
        projectId={id}
      />


      <ProjectTimelineClient
        projectId={id}
        startDate={
          dateOnly(
            project.start_date
          )
        }
        endDate={
          dateOnly(
            project.end_date
          )
        }
        deadline={
          dateOnly(
            project.deadline
          )
        }
        milestones={
          milestones
        }
        teamMembers={
          profiles.map(
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
            })
          )
        }
      />
    </div>
  );
}