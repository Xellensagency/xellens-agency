import {
  notFound,
} from "next/navigation";

import CreateOfferWizard from "@/components/dashboard/offers/create/CreateOfferWizard";

import {
  getCreateOfferOptions,
} from "@/lib/dashboard/offers/get-create-offer-options";

import {
  getOfferEditData,
} from "@/lib/dashboard/offers/get-offer-edit-data";


type EditOfferPageProps = {
  params: Promise<{
    offerId: string;
  }>;
};


export default async function EditOfferPage({
  params,
}: EditOfferPageProps) {
  const {
    offerId,
  } = await params;

  const [
    options,
    initialOffer,
  ] =
    await Promise.all([
      getCreateOfferOptions(),
      getOfferEditData(offerId),
    ]);

  if (!initialOffer) {
    notFound();
  }

  return (
    <CreateOfferWizard
      options={options}
      initialOffer={
        initialOffer
      }
      mode="edit"
    />
  );
}