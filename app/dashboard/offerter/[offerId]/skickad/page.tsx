import {
  notFound,
} from "next/navigation";

import OfferSent from "@/components/dashboard/offers/sent/OfferSent";

import {
  getOfferSentData,
} from "@/lib/dashboard/offers/get-offer-sent-data";

type OfferSentPageProps = {
  params: Promise<{
    offerId: string;
  }>;
};

export default async function OfferSentPage({
  params,
}: OfferSentPageProps) {
  const {
    offerId,
  } = await params;

  const data =
    await getOfferSentData(
      offerId
    );

  if (!data) {
    notFound();
  }

  return (
    <OfferSent
      data={data}
    />
  );
}
