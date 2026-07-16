import type {
  CreateProjectPackage,
  CreateProjectService,
  CreateProjectUnit,
  ProjectServiceDraft,
} from "@/lib/dashboard/projects/create-project-types";

export type CreateOfferContact = {
  id: string;
  fullName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export type CreateOfferCustomer = {
  id: string;
  name: string;
  customerNumber: string;
  customerType: "company" | "private";
  email: string | null;
  phone: string | null;
  contacts: CreateOfferContact[];
};

export type CreateOfferProject = {
  id: string;
  title: string;
  description: string | null;
  customerId: string | null;
  categoryId: string | null;
};

export type CreateOfferCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CreateOfferOptions = {
  customers: CreateOfferCustomer[];
  projects: CreateOfferProject[];
  categories: CreateOfferCategory[];
  units: CreateProjectUnit[];
  services: CreateProjectService[];
  packages: CreateProjectPackage[];
};

export type OfferCustomerMode =
  | "existing"
  | "new";

export type OfferNewCustomerType =
  | "company"
  | "private";

export type OfferDraft = {
  customerMode: OfferCustomerMode;
  customerId: string;
  contactId: string;

  newCustomerType: OfferNewCustomerType;
  newCustomerName: string;
  newCustomerEmail: string;
  newCustomerPhone: string;

  existingProjectId: string;
  title: string;
  description: string;
  categoryId: string;
  desiredStartDate: string;
  internalNote: string;

  validDays: string;
  language: "sv" | "en";
  currency: "SEK" | "EUR" | "USD";

  customerMessage: string;
  termsText: string;
  paymentTerms: string;

  includeDetailedPricing: boolean;
  showVat: boolean;
  includePdf: boolean;
  sendCopyToSelf: boolean;
};

export type OfferServiceDraft =
  ProjectServiceDraft;

export type OfferAddonDraft =
  OfferServiceDraft;

export type OfferDiscountMode =
  | "none"
  | "percent"
  | "fixed";

export type OfferDiscountDraft = {
  mode: OfferDiscountMode;
  value: number;
  label: string;
  code: string;
};

