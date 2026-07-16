export type OfferListStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "answered"
  | "accepted"
  | "declined"
  | "expired"
  | "archived";

export type OfferListItem = {
  id: string;
  offerNumber: string;
  customerId: string | null;
  customerName: string;
  projectId: string | null;
  projectTitle: string;
  title: string;
  status: OfferListStatus;
  sentAt: string | null;
  validUntil: string | null;
  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  createdAt: string | null;
};

export type OfferCustomerOption = {
  id: string;
  name: string;
};

export type OfferProjectOption = {
  id: string;
  title: string;
  customerId: string | null;
};

export type OfferListStats = {
  total: number;
  drafts: number;
  sent: number;
  accepted: number;
  declined: number;
  archived: number;
};

export type OffersPageData = {
  offers: OfferListItem[];
  customers: OfferCustomerOption[];
  projects: OfferProjectOption[];
  stats: OfferListStats;
};
