export type DashboardStatsData = {
  active_projects: number;
  active_projects_change: number;
  ongoing_offers: number;
  ongoing_offers_change: number;
  monthly_revenue: number;
  monthly_revenue_change: number;
  completed_projects: number;
  completed_projects_change: number;
};

export type DashboardProjectStatus = {
  id: string;
  label: string;
  value: number;
  tone: "green" | "purple" | "blue" | "orange";
};

export type DashboardProjectOverview = {
  period: string;
  total: number;
  statuses: DashboardProjectStatus[];
};

export type DashboardDeadlineData = {
  id: string;
  project_id: string;
  project_number: string;
  project_title: string;
  title: string;
  description: string | null;
  milestone_type: string;
  status: string;
  due_at: string;
};

export type DashboardRecentProjectData = {
  id: string;
  project_number: string;
  title: string;
  category: string | null;
  status: string;
  progress: number;
  deadline: string | null;
  created_at: string;
  customer_id: string;
  customer_name: string;
  owner_id: string | null;
  owner_name: string | null;
};

export type DashboardRevenuePoint = {
  date: string;
  value: number;
};

export type DashboardRevenueData = {
  period: string;
  total: number;
  change_percent: number;
  previous_month_total: number;
  points: DashboardRevenuePoint[];
};

export type AdminDashboardData = {
  stats: DashboardStatsData;
  project_overview: DashboardProjectOverview;
  deadlines: DashboardDeadlineData[];
  recent_projects: DashboardRecentProjectData[];
  revenue: DashboardRevenueData;
  generated_at: string;
};
