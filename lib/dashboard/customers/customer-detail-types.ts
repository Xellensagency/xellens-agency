export type CustomerDetailContact = {
  id: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

export type CustomerDetail = {
  id: string;
  customerNumber: string;
  customerType: "company" | "private";
  status:
    | "prospect"
    | "active"
    | "former"
    | "inactive";

  name: string;
  organizationNumber: string;
  personalIdentityNumber: string;

  email: string;
  phone: string;
  website: string;

  address: string;
  postalCode: string;
  city: string;
  country: string;

  billingEmail: string;
  billingAddress: string;
  billingPostalCode: string;
  billingCity: string;

  industry: string;
  employeeRange: string;
  source: string;
  description: string;

  invoiceReference: string;
  paymentTerms: number;
  notes: string;

  contacts: CustomerDetailContact[];
};
