export type InvoiceStatisticStatus =
  | "paid"
  | "sent"
  | "outstanding"
  | "overdue";

export type InvoiceStatisticsSummary = {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;

  invoicedChange: number | null;
  paidChange: number | null;
  outstandingChange: number | null;
  overdueChange: number | null;
};

export type InvoiceMonthlyStatistic = {
  month: number;
  label: string;
  total: number;
};

export type InvoiceStatusStatistic = {
  key: InvoiceStatisticStatus;
  label: string;
  count: number;
  percentage: number;
};

export type InvoiceTopCustomer = {
  id: string;
  name: string;
  total: number;
};

export type InvoiceDueSoonItem = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  dueDate: string;
  total: number;
  outstanding: number;
  daysLeft: number;
};

export type InvoiceStatisticsData = {
  year: number;
  availableYears: number[];

  summary: InvoiceStatisticsSummary;
  monthly: InvoiceMonthlyStatistic[];
  statuses: InvoiceStatusStatistic[];

  totalInvoiceCount: number;

  topCustomers: InvoiceTopCustomer[];
  dueSoon: InvoiceDueSoonItem[];
};
