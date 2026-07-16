import CustomersTable from "@/components/dashboard/customers/CustomersTable";
import { getCustomersPage } from "@/lib/dashboard/customers/get-customers-page";

type CustomersPageProps = {
  searchParams: Promise<{
    search?: string | string[];
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const parameters =
    await searchParams;

  const searchValue =
    Array.isArray(parameters.search)
      ? parameters.search[0] ?? ""
      : parameters.search ?? "";

  const data =
    await getCustomersPage();

  return (
    <CustomersTable
      customers={data.customers}
      stats={data.stats}
      initialSearch={searchValue}
    />
  );
}
