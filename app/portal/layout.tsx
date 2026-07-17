import type {
  Metadata,
} from "next";

import CustomerPortalShell from "@/components/customer-portal/layout/CustomerPortalShell";

import {
  getCurrentPortalContext,
} from "@/lib/customer-portal/get-current-portal-context";

export const metadata:
Metadata = {
  title: {
    default: "Kundportal",
    template:
      "%s | Xellens kundportal",
  },
  description:
    "Kundportal för Xellens Agency.",
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context =
    await getCurrentPortalContext();

  return (
    <CustomerPortalShell
      user={{
        fullName:
          context.contactName,
        customerName:
          context.customerName,
        customerNumber:
          context.customerNumber,
      }}
    >
      {children}
    </CustomerPortalShell>
  );
}
