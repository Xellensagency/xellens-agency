import {
  notFound,
} from "next/navigation";

import CustomerDetailForm from "@/components/dashboard/customers/detail/CustomerDetailForm";

import {
  getCustomerDetail,
} from "@/lib/dashboard/customers/get-customer-detail";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const {
    id,
  } = await params;

  const customer =
    await getCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetailForm
      initialCustomer={customer}
    />
  );
}
