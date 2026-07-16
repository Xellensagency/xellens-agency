export type OfferSentData = {
  id: string;
  offerNumber: string;
  title: string;
  status: string;

  customerName: string;
  customerEmail: string | null;

  validUntil: string | null;
  sentAt: string | null;

  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  currency: string;

  shareUrl: string;
};
