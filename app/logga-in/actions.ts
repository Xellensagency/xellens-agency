"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CustomerLoginState = {
  error: string | null;
};

export async function loginCustomer(
  _previousState: CustomerLoginState,
  formData: FormData
): Promise<CustomerLoginState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    return {
      error:
        "Fyll i både e-postadress och lösenord.",
    };
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (
    error ||
    !data.user
  ) {
    return {
      error:
        "E-postadressen eller lösenordet är fel.",
    };
  }

  const membershipResult =
    await (
      supabase as any
    )
      .from(
        "customer_portal_memberships"
      )
      .select(
        "id, status"
      )
      .eq(
        "auth_user_id",
        data.user.id
      )
      .eq(
        "status",
        "active"
      )
      .limit(1)
      .maybeSingle();

  if (
    membershipResult.error ||
    !membershipResult.data
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "Kontot saknar aktiv tillgång till kundportalen. Kontakta Xellens Agency.",
    };
  }

  redirect("/portal");
}
