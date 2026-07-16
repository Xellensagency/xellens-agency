import {
  notFound,
} from "next/navigation";

import InvoicePreview from "@/components/dashboard/invoices/preview/InvoicePreview";

import {
  getInvoiceDetailData,
} from "@/lib/dashboard/invoices/get-invoice-detail-data";

type InvoicePreviewPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function InvoicePreviewPage({
  params,
}: InvoicePreviewPageProps) {
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
    <InvoicePreview
      data={data}
    />
  );
}
