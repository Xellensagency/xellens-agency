"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  CompanySettingsInput,
} from "@/lib/dashboard/settings/company-settings-types";

import {
  createClient,
} from "@/lib/supabase/server";

export type SaveCompanySettingsResult = {
  success: boolean;
  message: string;
};

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function cleanNumber(
  value: unknown,
  minimum: number,
  maximum: number
) {
  const parsed =
    Number(value);

  if (!Number.isFinite(parsed)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      parsed
    )
  );
}

export async function saveCompanySettingsAction(
  input: CompanySettingsInput
): Promise<SaveCompanySettingsResult> {
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
    data: profile,
    error: profileError,
  } = await (
    supabase as any
  )
    .from("profiles")
    .select(
      "role, is_active"
    )
    .eq(
      "id",
      user.id
    )
    .single();

  const allowedRoles = [
    "super_admin",
    "admin",
  ];

  if (
    profileError ||
    !profile ||
    profile.is_active !== true ||
    !allowedRoles.includes(
      String(profile.role)
    )
  ) {
    return {
      success: false,
      message:
        "Du har inte behörighet att ändra företagsinställningarna.",
    };
  }

  const companyName =
    cleanText(
      input.companyName
    );

  if (!companyName) {
    return {
      success: false,
      message:
        "Företagsnamn måste anges.",
    };
  }

  const primaryColor =
    cleanText(
      input.primaryColor
    ).toUpperCase();

  if (
    !/^#[0-9A-F]{6}$/.test(
      primaryColor
    )
  ) {
    return {
      success: false,
      message:
        "Företagsfärgen måste anges som en giltig HEX-färg, exempelvis #07366F.",
    };
  }

  const {
    error,
  } = await (
    supabase as any
  )
    .from(
      "company_settings"
    )
    .update({
      company_name:
        companyName,

      legal_name:
        cleanText(
          input.legalName
        ),

      organization_number:
        cleanText(
          input.organizationNumber
        ),

      vat_number:
        cleanText(
          input.vatNumber
        ),

      approved_for_f_tax:
        Boolean(
          input.approvedForFTax
        ),

      address:
        cleanText(
          input.address
        ),

      postal_code:
        cleanText(
          input.postalCode
        ),

      city:
        cleanText(
          input.city
        ),

      country:
        cleanText(
          input.country
        ) || "Sverige",

      phone:
        cleanText(
          input.phone
        ),

      email:
        cleanText(
          input.email
        ),

      website:
        cleanText(
          input.website
        ),

      bank_name:
        cleanText(
          input.bankName
        ),

      bankgiro:
        cleanText(
          input.bankgiro
        ),

      plusgiro:
        cleanText(
          input.plusgiro
        ),

      swish_number:
        cleanText(
          input.swishNumber
        ),

      clearing_number:
        cleanText(
          input.clearingNumber
        ),

      account_number:
        cleanText(
          input.accountNumber
        ),

      iban:
        cleanText(
          input.iban
        ).toUpperCase(),

      bic_swift:
        cleanText(
          input.bicSwift
        ).toUpperCase(),

      default_payment_terms:
        Math.round(
          cleanNumber(
            input.defaultPaymentTerms,
            0,
            365
          )
        ),

      default_vat_rate:
        cleanNumber(
          input.defaultVatRate,
          0,
          100
        ),

      late_interest_percent:
        cleanNumber(
          input.lateInterestPercent,
          0,
          100
        ),

      reminder_fee:
        cleanNumber(
          input.reminderFee,
          0,
          100000
        ),

      invoice_prefix:
        cleanText(
          input.invoicePrefix
        ) || "F",

      offer_prefix:
        cleanText(
          input.offerPrefix
        ) || "OFF",

      invoice_footer_text:
        cleanText(
          input.invoiceFooterText
        ),

      offer_footer_text:
        cleanText(
          input.offerFooterText
        ),

      logo_url:
        cleanText(
          input.logoUrl
        ),

      logo_dark_url:
        cleanText(
          input.logoDarkUrl
        ),

      primary_color:
        primaryColor,

      email_sender_name:
        cleanText(
          input.emailSenderName
        ) || companyName,

      email_signature:
        cleanText(
          input.emailSignature
        ),

      updated_at:
        new Date()
          .toISOString(),

      updated_by:
        user.id,
    })
    .eq("singleton_key", "true");

  if (error) {
    console.error(
      "Kunde inte spara företagsinställningar:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Inställningarna kunde inte sparas.",
    };
  }

  revalidatePath(
    "/dashboard/installningar"
  );

  return {
    success: true,
    message:
      "Företagsinställningarna har sparats.",
  };
}

