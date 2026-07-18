import type {
  InvoiceDisplayStatus,
} from "./invoice-types";

export type InvoiceCompanySnapshot = {
  name: string;
  legalName: string | null;

  organizationNumber: string | null;
  vatNumber: string | null;
  approvedForFTax: boolean;

  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;

  phone: string | null;
  email: string | null;
  website: string | null;

  bankName: string | null;
  bankgiro: string | null;
  plusgiro: string | null;
  swishNumber: string | null;

  clearingNumber: string | null;
  accountNumber: string | null;
  iban: string | null;
  bicSwift: string | null;

  paymentTermsDays: number;
  defaultVatRate: number;
  lateInterestPercent: number;
  reminderFee: number;

  invoicePrefix: string;
  invoiceFooterText: string | null;

  logoUrl: string | null;
  logoDarkUrl: string | null;
  primaryColor: string;

  emailSenderName: string;
};

export type InvoiceDetailCustomer = {
  id: string;
  name: string;
  organizationNumber: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
};

export type InvoiceDetailProject = {
  id: string;
  projectNumber: string;
  title: string;
};

export type InvoiceDetailItem = {
  id: string;
  description: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
};

export type InvoiceDetailPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  externalReference: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
};

export type InvoiceDetailEvent = {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  createdAt: string;
};

export type InvoiceDetailData = {
  invoice: {
    id: string;
    invoiceNumber: string;
    title: string;
    description: string | null;
    status: InvoiceDisplayStatus;

    invoiceDate: string;
    dueDate: string | null;

    subtotalExVat: number;
    vatAmount: number;
    totalIncVat: number;
    amountPaid: number;
    outstandingAmount: number;

    currency: string;

    referenceNumber: string | null;
    poNumber: string | null;
    ocrNumber: string | null;
    paymentTermsDays: number;

    deliveryEmail: string | null;
    sourceType: string;

    notes: string | null;
    internalNotes: string | null;

    sentAt: string | null;
    paidAt: string | null;
    createdAt: string;
  };

  company: InvoiceCompanySnapshot;

  customer: InvoiceDetailCustomer;
  project: InvoiceDetailProject | null;

  items: InvoiceDetailItem[];
  payments: InvoiceDetailPayment[];
  events: InvoiceDetailEvent[];
};

