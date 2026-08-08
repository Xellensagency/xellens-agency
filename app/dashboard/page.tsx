import StatsSection from "@/components/dashboard/home/StatsSection";
import DashboardFocusSection from "@/components/dashboard/home/DashboardFocusSection";
import LatestActivity from "@/components/dashboard/home/LatestActivity";
import DashboardBottomSection from "@/components/dashboard/home/DashboardBottomSection";

import {
  getAdminDashboard,
} from "@/lib/dashboard/get-admin-dashboard";

import {
  getDashboardActivity,
} from "@/lib/dashboard/get-dashboard-activity";

import styles from "./DashboardPage.module.css";

export const dynamic =
  "force-dynamic";

export default async function DashboardPage() {
  const [
    dashboardData,
    activities,
  ] = await Promise.all([
    getAdminDashboard(),
    getDashboardActivity(),
  ]);

  return (
    <div className={styles.dashboard}>
      <StatsSection
        stats={dashboardData.stats}
      />

      <DashboardFocusSection
        overview={
          dashboardData.project_overview
        }
        deadlines={
          dashboardData.deadlines
        }
        projects={
          dashboardData.recent_projects
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

      <LatestActivity
        activities={activities.slice(0, 5)}
      />
    </div>
  );
}