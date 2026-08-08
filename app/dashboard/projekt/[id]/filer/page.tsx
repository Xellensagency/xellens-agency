import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import ProjectFilesClient from "@/components/dashboard/projects/detail/ProjectFilesClient";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../ProjectSubPage.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


const BUCKET =
  "vorix-project-files";


export default async function ProjectFilesPage({
  params,
}: Props) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  const [
    projectResult,
    filesResult,
    profilesResult,
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
          "project_files"
        )
        .select(`
          id,
          folder,
          file_name,
          storage_path,
          mime_type,
          size_bytes,
          customer_visible,
          uploaded_by,
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
        ),

      (
        supabase as any
      )
        .from("profiles")
        .select(`
          id,
          full_name
        `),
    ]);


  if (
    projectResult.error ||
    !projectResult.data
  ) {
    notFound();
  }


  const rawFiles =
    filesResult.data ?? [];

  const profiles =
    profilesResult.data ?? [];


  const profileMap =
    new Map(
      profiles.map(
        (profile: any) => [
          String(
            profile.id
          ),
          String(
            profile.full_name ??
            "Vorix"
          ),
        ]
      )
    );


  const files =
    await Promise.all(
      rawFiles.map(
        async (file: any) => {
          const {
            data:
              signedData,
          } =
            await supabase.storage
              .from(BUCKET)
              .createSignedUrl(
                file.storage_path,
                3600
              );

          return {
            id:
              String(
                file.id
              ),

            folder:
              String(
                file.folder
              ),

            file_name:
              String(
                file.file_name
              ),

            mime_type:
              file.mime_type
                ? String(
                    file.mime_type
                  )
                : null,

            size_bytes:
              Number(
                file.size_bytes ??
                0
              ),

            customer_visible:
              Boolean(
                file.customer_visible
              ),

            created_at:
              String(
                file.created_at
              ),

            uploaded_by_name:
              file.uploaded_by
                ? profileMap.get(
                    String(
                      file.uploaded_by
                    )
                  ) ?? null
                : null,

            signed_url:
              signedData
                ?.signedUrl ??
              null,
          };
        }
      )
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
          Filer
        </h1>

        <p>
          Projektmaterial och dokument för{" "}
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

      <ProjectFilesClient
        projectId={id}
        files={files}
      />
    </div>
  );
}