import StatsSection from "@/components/dashboard/home/StatsSection";
import OverviewSection from "@/components/dashboard/home/OverviewSection";
import DashboardBottomSection from "@/components/dashboard/home/DashboardBottomSection";
import { getAdminDashboard } from "@/lib/dashboard/get-admin-dashboard";
import styles from "./DashboardPage.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboardData =
    await getAdminDashboard();

  return (
    <div className={styles.dashboard}>
      <StatsSection
        stats={dashboardData.stats}
      />

      <OverviewSection
        overview={
          dashboardData.project_overview
        }
        deadlines={
          dashboardData.deadlines
        }
      />

      <DashboardBottomSection
        projects={
          dashboardData.recent_projects
        }
        revenue={
          dashboardData.revenue
        }
      />
    </div>
  );
}
