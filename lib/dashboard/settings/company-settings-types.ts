export type CompanySettings = {
  id: string;

  companyName: string;
  legalName: string;
  organizationNumber: string;
  vatNumber: string;
  approvedForFTax: boolean;

  address: string;
  postalCode: string;
  city: string;
  country: string;

  phone: string;
  email: string;
  website: string;

  bankName: string;
  bankgiro: string;
  plusgiro: string;
  swishNumber: string;
  clearingNumber: string;
  accountNumber: string;
  iban: string;
  bicSwift: string;

  defaultPaymentTerms: number;
  defaultVatRate: number;
  lateInterestPercent: number;
  reminderFee: number;

  invoicePrefix: string;
  offerPrefix: string;
  invoiceFooterText: string;
  offerFooterText: string;

  logoUrl: string;
  logoDarkUrl: string;
  primaryColor: string;

  emailSenderName: string;
  emailSignature: string;

  updatedAt: string | null;
};

export type CompanySettingsInput =
  Omit<
    CompanySettings,
    "id" | "updatedAt"
  >;
