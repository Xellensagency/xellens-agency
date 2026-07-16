import CatalogManager from "@/components/dashboard/catalog/CatalogManager";
import { getCatalogPageData } from "@/lib/dashboard/catalog/get-catalog-page-data";

export default async function TemplatesPage() {
  const data =
    await getCatalogPageData();

  return (
    <CatalogManager data={data} />
  );
}
