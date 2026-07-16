import { createClient } from "@/lib/supabase/server";
import type { AdminDashboardData } from "./dashboard-types";

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_admin_dashboard"
  );

  if (error) {
    console.error(
      "Kunde inte hämta dashboardinformationen:",
      error
    );

    throw new Error(
      "Dashboardinformationen kunde inte hämtas."
    );
  }

  if (!data) {
    throw new Error(
      "Dashboardfunktionen returnerade ingen information."
    );
  }

  return data as AdminDashboardData;
}
