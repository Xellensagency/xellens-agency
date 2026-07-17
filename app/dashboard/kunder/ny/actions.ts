"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  CustomerContactDraft,
  CustomerDraft,
} from "@/lib/dashboard/customers/create-customer-types";

export type CreateCustomerResult = {
  success: boolean;
  message: string;
  customerId?: string;
  customerNumber?: string;
};

export async function createCustomerAction(
  draft: CustomerDraft,
  contacts: CustomerContactDraft[]
): Promise<CreateCustomerResult> {
  const supabase =
    await createClient();

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
    return {
      success: false,
      message:
        "Du är inte längre inloggad.",
    };
  }

  const customerName =
    draft.customerType === "company"
      ? draft.companyName.trim()
      : [
          draft.firstName.trim(),
          draft.lastName.trim(),
        ]
          .filter(Boolean)
          .join(" ");

  if (!customerName) {
    return {
      success: false,
      message:
        "Kundens namn måste anges.",
    };
  }

  const cleanContacts =
    contacts
      .map((contact) => ({
        fullName:
          contact.fullName.trim(),

        jobTitle:
          contact.jobTitle.trim(),

        email:
          contact.email
            .trim()
            .toLowerCase(),

        phone:
          contact.phone.trim(),

        isPrimary:
          contact.isPrimary,
      }))
      .filter(
        (contact) =>
          contact.fullName ||
          contact.email ||
          contact.phone
      );

  const {
    data,
    error,
  } = await (
    supabase as any
  ).rpc(
    "create_customer_with_contacts",
    {
      p_customer: draft,
      p_contacts: cleanContacts,
    }
  );

  if (error) {
    console.error(
      "Kunde inte skapa kund:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Kunden kunde inte skapas.",
    };
  }

  const customerId =
    String(
      data?.customer_id ?? ""
    );

  if (!customerId) {
    return {
      success: false,
      message:
        "Kunden skapades men kund-id saknas.",
    };
  }

  revalidatePath(
    "/dashboard/kunder"
  );

  return {
    success: true,
    message:
      `${data.customer_name} har skapats som ${data.customer_number}.`,

    customerId,

    customerNumber:
      String(
        data.customer_number ?? ""
      ),
  };
}
