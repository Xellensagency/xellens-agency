export type CatalogServiceKind =
  | "service"
  | "addon";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  colorKey: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogUnit = {
  code: string;
  label: string;
  shortLabel: string;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogService = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  code: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  pricingModel:
    | "fixed"
    | "quantity";
  unitCode: string;
  quantity: number;
  unitPriceExVat: number;
  vatRate: number;
  customerVisible: boolean;
  serviceKind: CatalogServiceKind;
  isActive: boolean;
  sortOrder: number;
};

export type CatalogPackage = {
  id: string;
  code: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  priceMode:
    | "sum_items"
    | "fixed";
  fixedPriceExVat: number | null;
  discountPercent: number;
  customerVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
};

export type CatalogStats = {
  services: number;
  addons: number;
  packages: number;
  categories: number;
  inactive: number;
};

export type CatalogPageData = {
  categories: CatalogCategory[];
  units: CatalogUnit[];
  services: CatalogService[];
  packages: CatalogPackage[];
  stats: CatalogStats;
};
