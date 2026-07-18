import type {
  CompanySettings,
} from "@/lib/dashboard/settings/company-settings-types";

import {
  createClient,
} from "@/lib/supabase/server";

function stringValue(
  value: unknown
) {
  return String(
    value ?? ""
  );
}

function numberValue(
  value: unknown,
  fallback: number
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

export async function getCompanySettings():
Promise<CompanySettings | null> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return null;
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
    return null;
  }

  const {
    data,
    error,
  } = await (
    supabase as any
  )
    .from(
      "company_settings"
    )
    .select("*")
    .eq("singleton_key", "true")
    .single();

  if (
    error ||
    !data
  ) {
    console.error(
      "Kunde inte hämta företagsinställningar:",
      error
    );

    throw new Error(
      error?.message ||
      "Företagsinställningarna kunde inte hämtas."
    );
  }

  return {
    id:
      stringValue(data.id),

    companyName:
      stringValue(
        data.company_name
      ),

    legalName:
      stringValue(
        data.legal_name
      ),

    organizationNumber:
      stringValue(
        data.organization_number
      ),

    vatNumber:
      stringValue(
        data.vat_number
      ),

    approvedForFTax:
      data.approved_for_f_tax ===
      true,

    address:
      stringValue(data.address),

    postalCode:
      stringValue(
        data.postal_code
      ),

    city:
      stringValue(data.city),

    country:
      stringValue(
        data.country ||
        "Sverige"
      ),

    phone:
      stringValue(data.phone),

    email:
      stringValue(data.email),

    website:
      stringValue(data.website),

    bankName:
      stringValue(
        data.bank_name
      ),

    bankgiro:
      stringValue(
        data.bankgiro
      ),

    plusgiro:
      stringValue(
        data.plusgiro
      ),

    swishNumber:
      stringValue(
        data.swish_number
      ),

    clearingNumber:
      stringValue(
        data.clearing_number
      ),

    accountNumber:
      stringValue(
        data.account_number
      ),

    iban:
      stringValue(data.iban),

    bicSwift:
      stringValue(
        data.bic_swift
      ),

    defaultPaymentTerms:
      numberValue(
        data.default_payment_terms,
        30
      ),

    defaultVatRate:
      numberValue(
        data.default_vat_rate,
        25
      ),

    lateInterestPercent:
      numberValue(
        data.late_interest_percent,
        8
      ),

    reminderFee:
      numberValue(
        data.reminder_fee,
        60
      ),

    invoicePrefix:
      stringValue(
        data.invoice_prefix ||
        "F"
      ),

    offerPrefix:
      stringValue(
        data.offer_prefix ||
        "OFF"
      ),

    invoiceFooterText:
      stringValue(
        data.invoice_footer_text
      ),

    offerFooterText:
      stringValue(
        data.offer_footer_text
      ),

    logoUrl:
      stringValue(
        data.logo_url
      ),

    logoDarkUrl:
      stringValue(
        data.logo_dark_url
      ),

    primaryColor:
      stringValue(
        data.primary_color ||
        "#07366F"
      ),

    emailSenderName:
      stringValue(
        data.email_sender_name ||
        "Xellens Agency"
      ),

    emailSignature:
      stringValue(
        data.email_signature
      ),

    updatedAt:
      data.updated_at
        ? stringValue(
            data.updated_at
          )
        : null,
  };
}

