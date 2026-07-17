"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

export type CreateDesignProposalState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;
  proposalId?: string;
};

export const initialCreateDesignProposalState:
CreateDesignProposalState = {
  status: "idle",
  message: "",
};

const allowedMimeTypes =
  new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ]);

const maximumFileSize =
  50 * 1024 * 1024;

const maximumFiles = 8;

function cleanText(
  value: FormDataEntryValue | null
) {
  return String(
    value ?? ""
  ).trim();
}

function cleanFileName(
  fileName: string
) {
  const cleaned =
    fileName
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
        ""
      );

  return (
    cleaned ||
    "designfil"
  );
}

function validateExternalUrl(
  value: string
) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function createDesignProposalAction(
  _previousState:
    CreateDesignProposalState,

  formData: FormData
): Promise<CreateDesignProposalState> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      status: "error",
      message:
        "Du är inte längre inloggad.",
    };
  }

  const projectId =
    cleanText(
      formData.get(
        "projectId"
      )
    );

  const title =
    cleanText(
      formData.get(
        "title"
      )
    );

  const versionLabel =
    cleanText(
      formData.get(
        "versionLabel"
      )
    ) ||
    "Version 1";

  const summary =
    cleanText(
      formData.get(
        "summary"
      )
    );

  const externalUrlValue =
    cleanText(
      formData.get(
        "externalUrl"
      )
    );

  const externalUrl =
    validateExternalUrl(
      externalUrlValue
    );

  const publishNow =
    formData.get(
      "publishNow"
    ) === "yes";

  const files =
    formData
      .getAll("files")
      .filter(
        (
          value
        ): value is File =>
          value instanceof File &&
          value.size > 0
      );

  if (!projectId) {
    return {
      status: "error",
      message:
        "Välj vilket projekt designförslaget tillhör.",
    };
  }

  if (!title) {
    return {
      status: "error",
      message:
        "Skriv en titel för designförslaget.",
    };
  }

  if (
    externalUrlValue &&
    !externalUrl
  ) {
    return {
      status: "error",
      message:
        "Länken måste börja med http:// eller https://.",
    };
  }

  if (
    files.length === 0 &&
    !externalUrl
  ) {
    return {
      status: "error",
      message:
        "Ladda upp minst en fil eller ange en extern designlänk.",
    };
  }

  if (
    files.length >
    maximumFiles
  ) {
    return {
      status: "error",
      message:
        `Du kan ladda upp högst ${maximumFiles} filer åt gången.`,
    };
  }

  for (
    const file
    of files
  ) {
    if (
      !allowedMimeTypes.has(
        file.type
      )
    ) {
      return {
        status: "error",
        message:
          `${file.name} har ett filformat som inte stöds.`,
      };
    }

    if (
      file.size >
      maximumFileSize
    ) {
      return {
        status: "error",
        message:
          `${file.name} är större än 50 MB.`,
      };
    }
  }

  const {
    data: project,
    error: projectError,
  } = await supabase
    .from("projects")
    .select(
      "id, customer_id"
    )
    .eq(
      "id",
      projectId
    )
    .single();

  if (
    projectError ||
    !project
  ) {
    return {
      status: "error",
      message:
        "Det valda projektet kunde inte hittas.",
    };
  }

  const {
    data: proposal,
    error: proposalError,
  } = await supabase
    .from(
      "project_design_proposals"
    )
    .insert({
      project_id:
        projectId,

      title,

      version_label:
        versionLabel,

      summary:
        summary || null,

      external_url:
        externalUrl,

      status:
        publishNow
          ? "published"
          : "draft",

      customer_visible:
        publishNow,

      published_at:
        publishNow
          ? new Date()
              .toISOString()
          : null,

      published_by:
        publishNow
          ? user.id
          : null,

      created_by:
        user.id,
    })
    .select("id")
    .single();

  if (
    proposalError ||
    !proposal
  ) {
    console.error(
      "Kunde inte skapa designförslag:",
      proposalError
    );

    const duplicateVersion =
      proposalError?.code ===
      "23505";

    return {
      status: "error",

      message:
        duplicateVersion
          ? "Det finns redan ett designförslag med samma versionsnamn i projektet."
          : "Designförslaget kunde inte skapas.",
    };
  }

  const uploadedPaths:
  string[] = [];

  try {
    for (
      let index = 0;
      index <
      files.length;
      index += 1
    ) {
      const file =
        files[index];

      const storagePath = [
        projectId,
        proposal.id,
        `${
          index + 1
        }-${
          crypto.randomUUID()
        }-${
          cleanFileName(
            file.name
          )
        }`,
      ].join("/");

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "design-proposals"
          )
          .upload(
            storagePath,
            file,
            {
              contentType:
                file.type,

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
        error: fileRowError,
      } = await supabase
        .from(
          "project_design_files"
        )
        .insert({
          proposal_id:
            proposal.id,

          storage_bucket:
            "design-proposals",

          storage_path:
            storagePath,

          file_name:
            file.name,

          mime_type:
            file.type,

          file_size_bytes:
            file.size,

          sort_order:
            index,

          is_primary:
            index === 0,

          created_by:
            user.id,
        });

      if (fileRowError) {
        throw new Error(
          fileRowError.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Kunde inte ladda upp designfiler:",
      error
    );

    if (
      uploadedPaths.length >
      0
    ) {
      await supabase.storage
        .from(
          "design-proposals"
        )
        .remove(
          uploadedPaths
        );
    }

    await supabase
      .from(
        "project_design_proposals"
      )
      .delete()
      .eq(
        "id",
        proposal.id
      );

    return {
      status: "error",
      message:
        "En eller flera filer kunde inte laddas upp. Inget designförslag publicerades.",
    };
  }

  revalidatePath(
    "/dashboard/designforslag"
  );

  revalidatePath(
    "/portal/design-feedback"
  );

  return {
    status: "success",

    message:
      publishNow
        ? "Designförslaget är publicerat och synligt för kunden."
        : "Designförslaget är sparat som utkast.",

    proposalId:
      proposal.id,
  };
}
