import DesignFeedbackPageClient from "@/components/customer-portal/design-feedback/DesignFeedbackPageClient";

import {
  getCurrentPortalContext,
} from "@/lib/customer-portal/get-current-portal-context";

export const metadata = {
  title: "Design & feedback",
};

export default async function DesignFeedbackPage() {
  const context =
    await getCurrentPortalContext();

  return (
    <DesignFeedbackPageClient
      contactName={context.contactName}
      customerName={context.customerName}
    />
  );
}
