export type CreateProjectContact = {
  id: string;
  full_name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
};

export type CreateProjectCustomer = {
  id: string;
  customer_number: string;
  name: string;
  customer_type: string;
  status: string;
  email: string | null;
  phone: string | null;
  contacts: CreateProjectContact[];
};

export type CreateProjectCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_key: string | null;
  color_key: string | null;
};

export type CreateProjectUnit = {
  code: string;
  label: string;
  short_label: string;
};

export type CreateProjectService = {
  id: string;
  category_id: string | null;
  category_name: string | null;
  code: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  pricing_model: "fixed" | "quantity";
  unit_code: string;
  quantity: number;
  unit_price_ex_vat: number;
  vat_rate: number;
  customer_visible: boolean;
};

export type CreateProjectPackageItem = {
  id: string;
  service_id: string;
  service_name: string;
  category_id: string | null;
  description: string | null;
  quantity: number;
  unit_code: string;
  unit_price_ex_vat: number;
  discount_percent: number;
  vat_rate: number;
  is_optional: boolean;
};

export type CreateProjectPackage = {
  id: string;
  code: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price_mode: "sum_items" | "fixed";
  fixed_price_ex_vat: number | null;
  discount_percent: number;
  items: CreateProjectPackageItem[];
};

export type CreateProjectTeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

export type CreateProjectOptions = {
  customers: CreateProjectCustomer[];
  categories: CreateProjectCategory[];
  units: CreateProjectUnit[];
  services: CreateProjectService[];
  packages: CreateProjectPackage[];
  team_members: CreateProjectTeamMember[];
};

export type ProjectDraft = {
  title: string;
  customerId: string;
  contactId: string;
  categoryIds: string[];
  description: string;
  startDate: string;
  endDate: string;
  budgetExVat: string;
  priority: "low" | "normal" | "high" | "urgent";
  status:
    | "planning"
    | "ongoing"
    | "waiting_customer"
    | "production"
    | "paused";
  customerVisibility:
    | "hidden"
    | "immediate"
    | "after_approval";
};

export type ProjectServiceDraft = {
  id: string;
  sourceServiceId: string | null;
  sourcePackageId: string | null;
  categoryId: string | null;
  name: string;
  description: string;
  pricingModel: "fixed" | "quantity";
  unitCode: string;
  quantity: number;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
  customerVisible: boolean;
  isOptional: boolean;
};

export type ProjectMilestoneType =
  | "delivery"
  | "feedback"
  | "meeting"
  | "task"
  | "other";

export type ProjectMilestoneDraft = {
  id: string;
  title: string;
  description: string;
  milestoneType: ProjectMilestoneType;
  status: "pending" | "in_progress";
  dueDate: string;
  dueTime: string;
  assignedTo: string | null;
  reminderMinutes: number;
  customerVisible: boolean;
};

export type ProjectTeamMemberDraft = {
  profileId: string;
  memberRole: string;
  responsibilities: string;
};

export type ProjectServiceAssignment = {
  assignedTo: string | null;
  deadline: string;
};

export type ProjectServiceAssignments = Record<
  string,
  ProjectServiceAssignment
>;

