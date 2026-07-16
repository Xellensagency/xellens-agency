import CreateCatalogPackageForm from "@/components/dashboard/catalog/package/CreateCatalogPackageForm";

import {
  getCatalogPageData,
} from "@/lib/dashboard/catalog/get-catalog-page-data";

export default async function NewCatalogPackagePage() {
  const data =
    await getCatalogPageData();

  return (
    <CreateCatalogPackageForm
      services={data.services}
      units={data.units}
    />
  );
}
