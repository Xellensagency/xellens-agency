import {
  notFound,
} from "next/navigation";

import InvoiceDetail from "@/components/dashboard/invoices/detail/InvoiceDetail";

import {
  getInvoiceDetailData,
} from "@/lib/dashboard/invoices/get-invoice-detail-data";

type InvoicePageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function InvoicePage({
  params,
}: InvoicePageProps) {
  const {
    invoiceId,
  } = await params;

  const data =
    await getInvoiceDetailData(
      invoiceId
    );

  if (!data) {
    notFound();
  }

  return (
    <InvoiceDetail
      data={data}
    />
  );
}
