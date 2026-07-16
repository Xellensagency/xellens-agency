import { createClient } from "@/lib/supabase/server";
import type { CreateProjectOptions } from "./create-project-types";

export async function getCreateProjectOptions(): Promise<CreateProjectOptions> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_create_project_options"
  );

  if (error) {
    console.error(
      "Kunde inte hämta projektformulärets alternativ:",
      error
    );

    throw new Error(
      "Projektformuläret kunde inte laddas."
    );
  }

  if (!data) {
    throw new Error(
      "Projektformuläret returnerade ingen information."
    );
  }

  return data as CreateProjectOptions;
}
