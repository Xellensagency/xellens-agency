import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CustomerPortalContext = {
  userId: string;
  email: string;
  membershipId: string;
  customerId: string;
  customerNumber: string;
  customerName: string;
  contactName: string;
  role: string;
};

type PortalContextRow = {
  membership_id: string | null;
  customer_id: string | null;
  customer_number: string | null;
  customer_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  portal_role: string | null;
  portal_status: string | null;
};

export async function getCurrentPortalContext():
Promise<CustomerPortalContext> {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/logga-in");
  }

  const {
    data,
    error,
  } = await (
    supabase as any
  ).rpc(
    "get_customer_portal_context"
  );

  if (error) {
    console.error(
      "Kunde inte hämta kundportalens profil:",
      error
    );

    throw new Error(
      error.message ||
        "Kundprofilen kunde inte hämtas."
    );
  }

  const rows =
    Array.isArray(data)
      ? data as PortalContextRow[]
      : [];

  const profile =
    rows[0];

  if (
    !profile ||
    profile.portal_status !== "active"
  ) {
    redirect(
      "/logga-in?fel=behorighet"
    );
  }

  return {
    userId: user.id,

    email:
      profile.contact_email ||
      user.email ||
      "",

    membershipId:
      String(
        profile.membership_id ?? ""
      ),

    customerId:
      String(
        profile.customer_id ?? ""
      ),

    customerNumber:
      String(
        profile.customer_number ?? ""
      ),

    customerName:
      String(
        profile.customer_name ??
          "Kundkonto"
      ),

    contactName:
      String(
        profile.contact_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Kund"
      ),

    role:
      String(
        profile.portal_role ??
          "member"
      ),
  };
}
