import InvoiceOverview from "@/components/dashboard/invoices/InvoiceOverview";

import {
  getInvoiceOverviewData,
} from "@/lib/dashboard/invoices/get-invoice-overview-data";

export default async function InvoicesPage() {
  const data =
    await getInvoiceOverviewData();

  return (
    <InvoiceOverview
      data={data}
    />
  );
}
