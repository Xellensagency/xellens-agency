import { createClient } from "@/lib/supabase/server";
import type {
  ProjectsPageData,
  ProjectsPageParameters,
} from "./project-types";

export async function getProjectsPage(
  parameters: ProjectsPageParameters = {}
): Promise<ProjectsPageData> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_projects_page",
    {
      p_search: parameters.search?.trim() || null,
      p_status: parameters.status || "all",
      p_customer_id:
        parameters.customerId || null,
      p_sort:
        parameters.sort || "updated_desc",
      p_page:
        parameters.page && parameters.page > 0
          ? parameters.page
          : 1,
      p_page_size:
        parameters.pageSize &&
        parameters.pageSize > 0
          ? parameters.pageSize
          : 10,
    }
  );

  if (error) {
    console.error(
      "Kunde inte hämta projektsidan:",
      error
    );

    throw new Error(
      "Projektinformationen kunde inte hämtas."
    );
  }

  if (!data) {
    throw new Error(
      "Projektfunktionen returnerade ingen information."
    );
  }

  return data as ProjectsPageData;
}
