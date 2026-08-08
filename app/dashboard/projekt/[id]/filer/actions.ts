"use server";

import {
  randomUUID,
} from "node:crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


const BUCKET =
  "vorix-project-files";

const MAX_FILE_SIZE =
  25 * 1024 * 1024;

const allowedFolders = [
  "customer",
  "design",
  "delivery",
  "agreement",
  "other",
] as const;


function cleanFileName(
  value: string
) {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-zA-Z0-9._-]+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^[-.]+|[-.]+$/g,
      "")
    .slice(0, 140) ||
    "fil";
}


async function getInternalUser() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
    };
  }

  const {
    data: profile,
  } =
    await (
      supabase as any
    )
      .from("profiles")
      .select(
        "id, role, is_active"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

  const allowed =
    profile?.is_active === true &&
    [
      "super_admin",
      "admin",
      "staff",
    ].includes(
      String(
        profile.role
      )
    );

  return {
    supabase,
    user:
      allowed
        ? user
        : null,
  };
}


export async function uploadProjectFilesAction(
  formData: FormData
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

  if (!user) {
    return {
      ok: false,
      error:
        "Du saknar behörighet.",
    };
  }

  const projectId =
    String(
      formData.get(
        "projectId"
      ) ?? ""
    );

  const rawFolder =
    String(
      formData.get(
        "folder"
      ) ?? "other"
    );

  const folder =
    allowedFolders.includes(
      rawFolder as
        typeof allowedFolders[number]
    )
      ? rawFolder
      : "other";

  if (!projectId) {
    return {
      ok: false,
      error:
        "Projekt saknas.",
    };
  }

  const rawFiles =
    formData.getAll(
      "files"
    );

  const files =
    rawFiles.filter(
      (value):
        value is File =>
          value instanceof File &&
          value.size > 0
    );

  if (
    files.length === 0
  ) {
    return {
      ok: false,
      error:
        "Välj minst en fil.",
    };
  }

  if (
    files.length > 10
  ) {
    return {
      ok: false,
      error:
        "Du kan ladda upp högst 10 filer åt gången.",
    };
  }

  for (
    const file of files
  ) {
    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return {
        ok: false,
        error:
          `${file.name} är större än 25 MB.`,
      };
    }
  }

  const uploadedPaths:
    string[] = [];

  try {
    for (
      const file of files
    ) {
      const safeName =
        cleanFileName(
          file.name
        );

      const storagePath =
        `${projectId}/${folder}/${randomUUID()}-${safeName}`;

      const arrayBuffer =
        await file.arrayBuffer();

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(BUCKET)
          .upload(
            storagePath,
            arrayBuffer,
            {
              contentType:
                file.type ||
                "application/octet-stream",

              upsert: false,
            }
          );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      uploadedPaths.push(
        storagePath
      );

      const {
        error:
          metadataError,
      } =
        await (
          supabase as any
        )
          .from(
            "project_files"
          )
          .insert({
            project_id:
              projectId,

            folder,

            file_name:
              file.name,

            storage_path:
              storagePath,

            mime_type:
              file.type ||
              null,

            size_bytes:
              file.size,

            customer_visible:
              false,

            uploaded_by:
              user.id,
          });

      if (
        metadataError
      ) {
        await supabase.storage
          .from(BUCKET)
          .remove([
            storagePath,
          ]);

        throw new Error(
          metadataError.message
        );
      }
    }
  }
  catch (error) {
    if (
      uploadedPaths.length >
      0
    ) {
      await supabase.storage
        .from(BUCKET)
        .remove(
          uploadedPaths
        );
    }

    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "Filerna kunde inte laddas upp.",
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/filer`
  );

  return {
    ok: true,
    count:
      files.length,
  };
}


export async function deleteProjectFileAction(
  projectId: string,
  fileId: string
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

  if (!user) {
    return {
      ok: false,
      error:
        "Du saknar behörighet.",
    };
  }

  const {
    data: file,
    error:
      fileError,
  } =
    await (
      supabase as any
    )
      .from(
        "project_files"
      )
      .select(
        "id, storage_path"
      )
      .eq(
        "id",
        fileId
      )
      .eq(
        "project_id",
        projectId
      )
      .maybeSingle();

  if (
    fileError ||
    !file
  ) {
    return {
      ok: false,
      error:
        "Filen kunde inte hittas.",
    };
  }

  const {
    error:
      storageError,
  } =
    await supabase.storage
      .from(BUCKET)
      .remove([
        file.storage_path,
      ]);

  if (
    storageError
  ) {
    return {
      ok: false,
      error:
        storageError.message,
    };
  }

  const {
    error:
      deleteError,
  } =
    await (
      supabase as any
    )
      .from(
        "project_files"
      )
      .delete()
      .eq(
        "id",
        fileId
      )
      .eq(
        "project_id",
        projectId
      );

  if (
    deleteError
  ) {
    return {
      ok: false,
      error:
        deleteError.message,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/filer`
  );

  return {
    ok: true,
  };
}


export async function toggleProjectFileVisibilityAction(
  projectId: string,
  fileId: string,
  visible: boolean
) {
  const {
    supabase,
    user,
  } =
    await getInternalUser();

  if (!user) {
    return {
      ok: false,
    };
  }

  const {
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_files"
      )
      .update({
        customer_visible:
          visible,
      })
      .eq(
        "id",
        fileId
      )
      .eq(
        "project_id",
        projectId
      );

  if (error) {
    return {
      ok: false,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/filer`
  );

  return {
    ok: true,
  };
}