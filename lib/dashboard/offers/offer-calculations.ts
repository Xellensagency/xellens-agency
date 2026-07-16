import type {
  OfferDiscountDraft,
  OfferServiceDraft,
} from "./create-offer-types";

export type OfferTotals = {
  servicesSubtotal: number;
  addonsSubtotal: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  totalIncVat: number;
};

export function calculateOfferLineSubtotal(
  service: OfferServiceDraft
) {
  const quantity = Math.max(
    0,
    Number(service.quantity) || 0
  );

  const unitPrice = Math.max(
    0,
    Number(service.unitPriceExVat) || 0
  );

  const discount = Math.min(
    100,
    Math.max(
      0,
      Number(service.discountPercent) || 0
    )
  );

  return (
    quantity *
    unitPrice *
    (1 - discount / 100)
  );
}

function calculateDiscountAmount(
  subtotal: number,
  discount: OfferDiscountDraft
) {
  if (
    discount.mode === "none" ||
    discount.value <= 0 ||
    subtotal <= 0
  ) {
    return 0;
  }

  if (discount.mode === "percent") {
    const percentage = Math.min(
      100,
      Math.max(0, discount.value)
    );

    return subtotal * (percentage / 100);
  }

  return Math.min(
    subtotal,
    Math.max(0, discount.value)
  );
}

export function calculateOfferTotals(
  services: OfferServiceDraft[],
  addons: OfferServiceDraft[],
  discount: OfferDiscountDraft
): OfferTotals {
  const servicesSubtotal =
    services.reduce(
      (sum, service) =>
        sum +
        calculateOfferLineSubtotal(service),
      0
    );

  const addonsSubtotal =
    addons.reduce(
      (sum, addon) =>
        sum +
        calculateOfferLineSubtotal(addon),
      0
    );

  const allLines = [
    ...services,
    ...addons,
  ];

  const subtotalBeforeDiscount =
    servicesSubtotal + addonsSubtotal;

  const discountAmount =
    calculateDiscountAmount(
      subtotalBeforeDiscount,
      discount
    );

  const subtotalAfterDiscount =
    Math.max(
      0,
      subtotalBeforeDiscount -
        discountAmount
    );

  const discountFactor =
    subtotalBeforeDiscount > 0
      ? subtotalAfterDiscount /
        subtotalBeforeDiscount
      : 1;

  const vatAmount = allLines.reduce(
    (sum, line) => {
      const lineSubtotal =
        calculateOfferLineSubtotal(line);

      const vatRate = Math.max(
        0,
        Number(line.vatRate) || 0
      );

      return (
        sum +
        lineSubtotal *
          discountFactor *
          (vatRate / 100)
      );
    },
    0
  );

  return {
    servicesSubtotal,
    addonsSubtotal,
    subtotalBeforeDiscount,
    discountAmount,
    subtotalAfterDiscount,
    vatAmount,
    totalIncVat:
      subtotalAfterDiscount +
      vatAmount,
  };
}
