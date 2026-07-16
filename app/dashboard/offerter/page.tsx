import OffersOverview from "@/components/dashboard/offers/OffersOverview";
import { getOffersPage } from "@/lib/dashboard/offers/get-offers-page";

type OffersPageProps = {
  searchParams: Promise<{
    search?: string | string[];
  }>;
};

export default async function OffersPage({
  searchParams,
}: OffersPageProps) {
  const parameters =
    await searchParams;

  const initialSearch =
    Array.isArray(parameters.search)
      ? parameters.search[0] ?? ""
      : parameters.search ?? "";

  const data = await getOffersPage();

  return (
    <OffersOverview
      data={data}
      initialSearch={initialSearch}
    />
  );
}
