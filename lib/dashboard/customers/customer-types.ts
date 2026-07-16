export type CustomerListType =
  | "company"
  | "private";

export type CustomerListContact = {
  id: string;
  fullName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export type CustomerListItem = {
  id: string;
  customerNumber: string;
  name: string;
  customerType: CustomerListType;
  status: string;
  email: string | null;
  phone: string | null;
  contacts: CustomerListContact[];
};

export type CustomerListStats = {
  total: number;
  active: number;
  prospects: number;
  companies: number;
  privateCustomers: number;
};
