import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";
import ProjectDesignClient from "@/components/dashboard/projects/detail/ProjectDesignClient";

import type {
  DesignProposalProjectOption,
} from "@/lib/dashboard/design-proposals/get-design-proposal-project-options";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../ProjectSubPage.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


export default async function ProjectDesignPage({
  params,
}: Props) {
  const {
    id,
  } = await params;

  const supabase =
    await createClient();


  const {
    data: project,
    error: projectError,
  } =
    await (
      supabase as any
    )
      .from("projects")
      .select(`
        id,
        project_number,
        title,
        customer_id,
        status
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (projectError) {
    console.error(
      "Kunde inte hämta projekt för design:",
      projectError
    );

    throw new Error(
      projectError.message ||
      "Projektet kunde inte hämtas."
    );
  }


  if (!project) {
    notFound();
  }


  const [
    customerResult,
    proposalResult,
  ] =
    await Promise.all([
      project.customer_id
        ? (
            supabase as any
          )
            .from("customers")
            .select(
              "id, name"
            )
            .eq(
              "id",
              project.customer_id
            )
            .maybeSingle()
        : Promise.resolve({
            data: null,
            error: null,
          }),

      (
        supabase as any
      )
        .from(
          "project_design_proposals"
        )
        .select(`
          id,
          title,
          version_label,
          summary,
          external_url,
          status,
          customer_visible,
          published_at,
          created_at,
          created_by
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
        ),
    ]);


  if (proposalResult.error) {
    console.error(
      "Designförslag kunde inte hämtas:",
      proposalResult.error
    );
  }


  const rawProposals =
    proposalResult.data ??
    [];


  const proposalIds =
    rawProposals.map(
      (proposal: any) =>
        String(
          proposal.id
        )
    );


  let designFiles:
    any[] = [];


  if (
    proposalIds.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await (
        supabase as any
      )
        .from(
          "project_design_files"
        )
        .select(`
          id,
          proposal_id,
          storage_bucket,
          storage_path,
          file_name,
          mime_type,
          sort_order,
          is_primary
        `)
        .in(
          "proposal_id",
          proposalIds
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );


    if (error) {
      console.error(
        "Designfiler kunde inte hämtas:",
        error
      );
    }

    designFiles =
      data ?? [];
  }


  const creatorIds = [
    ...new Set(
      rawProposals
        .map(
          (proposal: any) =>
            proposal.created_by
        )
        .filter(Boolean)
        .map(String)
    ),
  ];


  let creators:
    any[] = [];


  if (
    creatorIds.length >
    0
  ) {
    const {
      data,
    } =
      await (
        supabase as any
      )
        .from("profiles")
        .select(
          "id, full_name"
        )
        .in(
          "id",
          creatorIds
        );

    creators =
      data ?? [];
  }


  const creatorMap =
    new Map(
      creators.map(
        (creator: any) => [
          String(
            creator.id
          ),

          String(
            creator.full_name ??
            "Vorix"
          ),
        ]
      )
    );


  const proposals =
    await Promise.all(
      rawProposals.map(
        async (
          proposal: any
        ) => {
          const files =
            designFiles.filter(
              (file: any) =>
                String(
                  file.proposal_id
                ) ===
                String(
                  proposal.id
                )
            );


          const primary =
            files.find(
              (file: any) =>
                Boolean(
                  file.is_primary
                )
            ) ??
            files[0] ??
            null;


          let primaryUrl:
            string | null =
              null;


          if (primary) {
            const bucket =
              String(
                primary.storage_bucket ??
                "design-proposals"
              );

            const {
              data: signedData,
            } =
              await supabase.storage
                .from(bucket)
                .createSignedUrl(
                  String(
                    primary.storage_path
                  ),
                  3600
                );

            primaryUrl =
              signedData?.signedUrl ??
              null;
          }


          return {
            id:
              String(
                proposal.id
              ),

            title:
              String(
                proposal.title ??
                "Designförslag"
              ),

            version_label:
              String(
                proposal.version_label ??
                "Version"
              ),

            summary:
              proposal.summary
                ? String(
                    proposal.summary
                  )
                : null,

            external_url:
              proposal.external_url
                ? String(
                    proposal.external_url
                  )
                : null,

            status:
              String(
                proposal.status ??
                "draft"
              ),

            customer_visible:
              Boolean(
                proposal.customer_visible
              ),

            published_at:
              proposal.published_at
                ? String(
                    proposal.published_at
                  )
                : null,

            created_at:
              String(
                proposal.created_at
              ),

            created_by_name:
              proposal.created_by
                ? creatorMap.get(
                    String(
                      proposal.created_by
                    )
                  ) ?? null
                : null,

            file_count:
              files.length,

            primary_file_name:
              primary
                ? String(
                    primary.file_name
                  )
                : null,

            primary_file_url:
              primaryUrl,
          };
        }
      )
    );


  const projectOption:
    DesignProposalProjectOption = {
      id:
        String(
          project.id
        ),

      projectNumber:
        String(
          project.project_number
        ),

      title:
        String(
          project.title
        ),

      customerName:
        String(
          customerResult.data?.name ??
          "Okänd kund"
        ),

      status:
        String(
          project.status
        ),
    };


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
            project.project_number
          }
        </span>

        <h1>
          Design
        </h1>

        <p>
          Designversioner och
          kundgranskning för{" "}
          <strong>
            {project.title}
          </strong>.
        </p>
      </header>

      <ProjectWorkspaceTabs
        projectId={id}
      />

      <ProjectDesignClient
        project={
          projectOption
        }
        proposals={
          proposals
        }
      />
    </div>
  );
}