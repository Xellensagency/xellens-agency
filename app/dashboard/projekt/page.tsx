import ProjectStatsSection from "@/components/dashboard/projects/ProjectStatsSection";
import ProjectFilters from "@/components/dashboard/projects/ProjectFilters";
import ProjectsTable from "@/components/dashboard/projects/ProjectsTable";
import ProjectPagination from "@/components/dashboard/projects/ProjectPagination";
import { getProjectsPage } from "@/lib/dashboard/projects/get-projects-page";
import styles from "./ProjectsPage.module.css";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    customer?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    pageSize?: string | string[];
  }>;
};

function getStringValue(
  value: string | string[] | undefined
) {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function getPositiveNumber(
  value: string | undefined,
  fallback: number
) {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) &&
    parsedValue > 0
    ? parsedValue
    : fallback;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectPageProps) {
  const parameters =
    await searchParams;

  const search = getStringValue(
    parameters.search
  );

  const status = getStringValue(
    parameters.status
  );

  const customerId = getStringValue(
    parameters.customer
  );

  const sort = getStringValue(
    parameters.sort
  );

  const page = getPositiveNumber(
    getStringValue(parameters.page),
    1
  );

  const pageSize = getPositiveNumber(
    getStringValue(
      parameters.pageSize
    ),
    10
  );

  const data = await getProjectsPage({
    search,
    status,
    customerId,
    sort,
    page,
    pageSize,
  });

  return (
    <div className={styles.page}>
      <ProjectStatsSection
        stats={data.stats}
      />

      <ProjectFilters
        customers={data.customers}
      />

      <ProjectsTable
        projects={data.projects}
      />

      <ProjectPagination
        pagination={data.pagination}
      />
    </div>
  );
}
