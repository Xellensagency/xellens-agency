export type InvoiceDisplayStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "credited";

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;

  customerId: string;
  customerName: string;

  projectId: string | null;
  projectName: string | null;

  title: string;
  description: string | null;

  invoiceDate: string;
  dueDate: string | null;

  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  amountPaid: number;
  outstandingAmount: number;

  currency: string;

  status: InvoiceDisplayStatus;
  sourceType: string;

  sentAt: string | null;
  paidAt: string | null;
};

export type InvoiceCustomerOption = {
  id: string;
  name: string;
};

export type InvoiceOverviewSummary = {
  totalInvoiced: number;
  totalInvoicedCount: number;

  totalPaid: number;
  paidCount: number;

  totalOutstanding: number;
  outstandingCount: number;

  totalOverdue: number;
  overdueCount: number;
};

export type InvoiceOverviewData = {
  invoices: InvoiceListItem[];
  customers: InvoiceCustomerOption[];
  summary: InvoiceOverviewSummary;
  currentYear: number;
};
