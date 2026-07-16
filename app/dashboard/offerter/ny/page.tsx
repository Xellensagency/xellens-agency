import CreateOfferWizard from "@/components/dashboard/offers/create/CreateOfferWizard";
import { getCreateOfferOptions } from "@/lib/dashboard/offers/get-create-offer-options";

export default async function NewOfferPage() {
  const options =
    await getCreateOfferOptions();

  return (
    <CreateOfferWizard
      options={options}
    />
  );
}
