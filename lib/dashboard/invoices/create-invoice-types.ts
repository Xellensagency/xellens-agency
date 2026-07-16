export type InvoiceCatalogKind =
  | "service"
  | "addon";

export type InvoiceCreateCustomer = {
  id: string;
  name: string;
  organizationNumber: string | null;
  email: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
};

export type InvoiceCreateProject = {
  id: string;
  customerId: string;
  title: string;
};

export type InvoiceCreateService = {
  id: string;
  name: string;
  description: string | null;
  kind: InvoiceCatalogKind;
  unitCode: string;
  unitPriceExVat: number;
  vatRate: number;
};

export type InvoiceCreatePackageItem = {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
  isOptional: boolean;
  sortOrder: number;
};

export type InvoiceCreatePackage = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;

  priceMode:
    | "sum_items"
    | "fixed";

  fixedPriceExVat: number;
  defaultDiscountPercent: number;

  items: InvoiceCreatePackageItem[];
};

export type InvoiceCreateUnit = {
  code: string;
  label: string;
  shortLabel: string;
};

export type InvoiceCreateOptions = {
  customers: InvoiceCreateCustomer[];
  projects: InvoiceCreateProject[];
  services: InvoiceCreateService[];
  packages: InvoiceCreatePackage[];
  units: InvoiceCreateUnit[];
};

export type InvoiceDraftItem = {
  clientId: string;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
};
