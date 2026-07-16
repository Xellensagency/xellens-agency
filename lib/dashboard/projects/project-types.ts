export type ProjectMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  member_role: string;
};

export type ProjectListItem = {
  id: string;
  project_number: string;
  title: string;
  category: string | null;
  description: string | null;
  status: string;
  progress: number;
  deadline: string | null;
  thumbnail_url: string | null;
  customer_id: string;
  customer_name: string;
  owner_id: string | null;
  owner_name: string | null;
  created_at: string;
  updated_at: string;
  members: ProjectMember[];
};

export type ProjectCustomerOption = {
  id: string;
  name: string;
};

export type ProjectListStats = {
  active_projects: number;
  active_projects_change: number;
  waiting_projects: number;
  waiting_projects_change: number;
  completed_projects: number;
  completed_projects_change: number;
  total_projects: number;
  total_projects_change: number;
};

export type ProjectPaginationData = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type ProjectsPageData = {
  stats: ProjectListStats;
  projects: ProjectListItem[];
  customers: ProjectCustomerOption[];
  pagination: ProjectPaginationData;
};

export type ProjectsPageParameters = {
  search?: string;
  status?: string;
  customerId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};
