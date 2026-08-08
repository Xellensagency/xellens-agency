"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


async function getUser() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}


export async function publishProjectDesignAction(
  projectId: string,
  proposalId: string
) {
  const {
    supabase,
    user,
  } =
    await getUser();

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
        "project_design_proposals"
      )
      .update({
        status:
          "published",

        customer_visible:
          true,

        published_at:
          new Date()
            .toISOString(),

        published_by:
          user.id,
      })
      .eq(
        "id",
        proposalId
      )
      .eq(
        "project_id",
        projectId
      );

  if (error) {
    return {
      ok: false,
      error:
        error.message,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/design`
  );

  revalidatePath(
    "/portal/design-feedback"
  );

  return {
    ok: true,
  };
}


export async function unpublishProjectDesignAction(
  projectId: string,
  proposalId: string
) {
  const {
    supabase,
    user,
  } =
    await getUser();

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
        "project_design_proposals"
      )
      .update({
        status:
          "draft",

        customer_visible:
          false,

        published_at:
          null,

        published_by:
          null,
      })
      .eq(
        "id",
        proposalId
      )
      .eq(
        "project_id",
        projectId
      );

  if (error) {
    return {
      ok: false,
      error:
        error.message,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/design`
  );

  revalidatePath(
    "/portal/design-feedback"
  );

  return {
    ok: true,
  };
}


export async function deleteProjectDesignAction(
  projectId: string,
  proposalId: string
) {
  const {
    supabase,
    user,
  } =
    await getUser();

  if (!user) {
    return {
      ok: false,
    };
  }

  const {
    data: files,
    error:
      filesError,
  } =
    await (
      supabase as any
    )
      .from(
        "project_design_files"
      )
      .select(
        "storage_bucket, storage_path"
      )
      .eq(
        "proposal_id",
        proposalId
      );

  if (filesError) {
    return {
      ok: false,
      error:
        filesError.message,
    };
  }

  const grouped =
    new Map<
      string,
      string[]
    >();

  for (
    const file of
      files ?? []
  ) {
    const bucket =
      String(
        file.storage_bucket ??
        "design-proposals"
      );

    const paths =
      grouped.get(bucket) ??
      [];

    paths.push(
      String(
        file.storage_path
      )
    );

    grouped.set(
      bucket,
      paths
    );
  }

  for (
    const [
      bucket,
      paths,
    ] of grouped
  ) {
    if (
      paths.length === 0
    ) {
      continue;
    }

    const {
      error:
        removeError,
    } =
      await supabase.storage
        .from(bucket)
        .remove(paths);

    if (removeError) {
      return {
        ok: false,
        error:
          removeError.message,
      };
    }
  }

  const {
    error:
      deleteError,
  } =
    await (
      supabase as any
    )
      .from(
        "project_design_proposals"
      )
      .delete()
      .eq(
        "id",
        proposalId
      )
      .eq(
        "project_id",
        projectId
      );

  if (deleteError) {
    return {
      ok: false,
      error:
        deleteError.message,
    };
  }

  revalidatePath(
    `/dashboard/projekt/${projectId}/design`
  );

  return {
    ok: true,
  };
}