export type CustomerType =
  | "company"
  | "private";

export type CustomerStatus =
  | "prospect"
  | "active"
  | "former"
  | "inactive";

export type CustomerDraft = {
  customerType: CustomerType;

  companyName: string;
  organizationNumber: string;
  industry: string;
  employeeRange: string;

  firstName: string;
  lastName: string;
  personalIdentityNumber: string;

  description: string;
  status: CustomerStatus;
  source: string;

  website: string;
  email: string;
  phone: string;

  address: string;
  postalCode: string;
  city: string;
  country: string;

  billingEmail: string;
  invoiceReference: string;
  paymentTerms: string;

  billingAddressSameAsMain: boolean;
  billingAddress: string;
  billingPostalCode: string;
  billingCity: string;
};

export type CustomerContactDraft = {
  id: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

export type CustomerWizardStep = {
  id: number;
  title: string;
  subtitle: string;
};
