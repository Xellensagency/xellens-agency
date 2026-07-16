import CreateInvoiceForm from "@/components/dashboard/invoices/create/CreateInvoiceForm";

import {
  getCreateInvoiceOptions,
} from "@/lib/dashboard/invoices/get-create-invoice-options";

export default async function NewInvoicePage() {
  const options =
    await getCreateInvoiceOptions();

  return (
    <CreateInvoiceForm
      options={options}
    />
  );
}
