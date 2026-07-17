"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  CustomerDetail,
} from "@/lib/dashboard/customers/customer-detail-types";

export type CustomerActionResult = {
  success: boolean;
  message: string;
};

export async function updateCustomerAction(
  customer: CustomerDetail
): Promise<CustomerActionResult> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message:
        "Du är inte längre inloggad.",
    };
  }

  if (!customer.name.trim()) {
    return {
      success: false,
      message:
        "Kundens namn måste anges.",
    };
  }

  const {
    error,
  } = await (
    supabase as any
  ).rpc(
    "update_customer_with_contacts",
    {
      p_customer_id:
        customer.id,

      p_customer: {
        customerType:
          customer.customerType,

        status:
          customer.status,

        name:
          customer.name,

        organizationNumber:
          customer.organizationNumber,

        personalIdentityNumber:
          customer.personalIdentityNumber,

        email:
          customer.email,

        phone:
          customer.phone,

        website:
          customer.website,

        address:
          customer.address,

        postalCode:
          customer.postalCode,

        city:
          customer.city,

        country:
          customer.country,

        billingEmail:
          customer.billingEmail,

        billingAddress:
          customer.billingAddress,

        billingPostalCode:
          customer.billingPostalCode,

        billingCity:
          customer.billingCity,

        industry:
          customer.industry,

        employeeRange:
          customer.employeeRange,

        source:
          customer.source,

        description:
          customer.description,

        invoiceReference:
          customer.invoiceReference,

        paymentTerms:
          customer.paymentTerms,

        notes:
          customer.notes,
      },

      p_contacts:
        customer.contacts,
    }
  );

  if (error) {
    console.error(
      "Kunde inte uppdatera kund:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Kunden kunde inte uppdateras.",
    };
  }

  revalidatePath(
    "/dashboard/kunder"
  );

  revalidatePath(
    `/dashboard/kunder/${customer.id}`
  );

  return {
    success: true,
    message:
      "Kunduppgifterna har sparats.",
  };
}


export async function deleteCustomerAction(
  customerId: string
): Promise<CustomerActionResult> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message:
        "Du är inte längre inloggad.",
    };
  }

  const {
    error,
  } = await (
    supabase as any
  ).rpc(
    "delete_customer_safely",
    {
      p_customer_id:
        customerId,
    }
  );

  if (error) {
    console.error(
      "Kunde inte ta bort kund:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Kunden kunde inte tas bort.",
    };
  }

  revalidatePath(
    "/dashboard/kunder"
  );

  return {
    success: true,
    message:
      "Kunden har tagits bort.",
  };
}
