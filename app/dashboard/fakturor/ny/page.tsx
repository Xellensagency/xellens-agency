import CreateInvoiceForm from "@/components/dashboard/invoices/create/CreateInvoiceForm";

import {
  getCreateInvoiceOptions,
} from "@/lib/dashboard/invoices/get-create-invoice-options";

import {
  getCompanySettings,
} from "@/lib/dashboard/settings/get-company-settings";

export default async function NewInvoicePage() {
  const [
    options,
    companySettings,
  ] = await Promise.all([
    getCreateInvoiceOptions(),
    getCompanySettings(),
  ]);

  return (
    <CreateInvoiceForm
      options={options}
      defaults={{
        paymentTermsDays:
          companySettings
            ?.defaultPaymentTerms ??
          30,

        vatRate:
          companySettings
            ?.defaultVatRate ??
          25,
      }}
    />
  );
}
