import InvoiceStatistics from "@/components/dashboard/invoices/statistics/InvoiceStatistics";

import {
  getInvoiceStatisticsData,
} from "@/lib/dashboard/invoices/get-invoice-statistics-data";

type InvoiceStatisticsPageProps = {
  searchParams: Promise<{
    year?: string;
  }>;
};

export default async function InvoiceStatisticsPage({
  searchParams,
}: InvoiceStatisticsPageProps) {
  const parameters =
    await searchParams;

  const selectedYear =
    Number(parameters.year);

  const data =
    await getInvoiceStatisticsData(
      Number.isInteger(
        selectedYear
      )
        ? selectedYear
        : undefined
    );

  return (
    <InvoiceStatistics
      data={data}
    />
  );
}
