import type {
  DashboardRecentProjectData,
  DashboardRevenueData,
} from "@/lib/dashboard/dashboard-types";
import RecentProjects from "./RecentProjects";
import RevenueOverview from "./RevenueOverview";
import styles from "./DashboardBottomSection.module.css";

type DashboardBottomSectionProps = {
  projects: DashboardRecentProjectData[];
  revenue: DashboardRevenueData;
};

export default function DashboardBottomSection({
  projects,
  revenue,
}: DashboardBottomSectionProps) {
  return (
    <section
      className={styles.grid}
      aria-label="Senaste projekt och intäkter"
    >
      <RecentProjects
        projects={projects}
      />

      <RevenueOverview
        revenue={revenue}
      />
    </section>
  );
}
