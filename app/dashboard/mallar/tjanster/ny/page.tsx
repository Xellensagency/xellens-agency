import CreateCatalogServiceForm from "@/components/dashboard/catalog/create/CreateCatalogServiceForm";

import {
  getCatalogPageData,
} from "@/lib/dashboard/catalog/get-catalog-page-data";

export default async function NewCatalogServicePage() {
  const data =
    await getCatalogPageData();

  return (
    <CreateCatalogServiceForm
      categories={data.categories}
      units={data.units}
    />
  );
}
