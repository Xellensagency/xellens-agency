"use client";

import {
  CircleDollarSign,
  Clock3,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import type {
  CreateOfferOptions,
  OfferAddonDraft,
  OfferDiscountDraft,
  OfferDraft,
  OfferServiceDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import {
  calculateOfferTotals,
} from "@/lib/dashboard/offers/offer-calculations";

import styles from "./CreateOfferWizard.module.css";

type OfferSummaryProps = {
  options: CreateOfferOptions;
  draft: OfferDraft;
  services: OfferServiceDraft[];
  addons: OfferAddonDraft[];
  discount: OfferDiscountDraft;
  activeStep: number;
};

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

function calculateSubtotal(
  service: OfferServiceDraft
) {
  return (
    service.quantity *
    service.unitPriceExVat *
    (1 - service.discountPercent / 100)
  );
}

export default function OfferSummary({
  options,
  draft,
  services,
  addons,
  discount,
  activeStep,
}: OfferSummaryProps) {
  const customer =
    options.customers.find(
      (item) =>
        item.id === draft.customerId
    );

  const contact =
    customer?.contacts.find(
      (item) =>
        item.id === draft.contactId
    );

  const project =
    options.projects.find(
      (item) =>
        item.id ===
        draft.existingProjectId
    );

  const category =
    options.categories.find(
      (item) =>
        item.id === draft.categoryId
    );

  const customerName =
    draft.customerMode === "existing"
      ? customer?.name ||
        "Ingen kund vald"
      : draft.newCustomerName ||
        "Ny kund";

  const totals =
    calculateOfferTotals(
      services,
      addons,
      discount
    );

  return (
    <aside className={styles.summaryColumn}>
      <section className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h2>Offertöversikt</h2>

          <span>
            Steg {activeStep} av 4
          </span>
        </div>

        <div className={styles.summaryHero}>
          <span>
            <FileCheck2 size={27} />
          </span>

          <div>
            <small>Kund</small>

            <strong>{customerName}</strong>

            <em>
              {contact?.fullName ||
                (draft.customerMode ===
                "new"
                  ? draft.newCustomerEmail ||
                    "Kontakt anges senare"
                  : "Ingen kontaktperson vald")}
            </em>
          </div>
        </div>

        <dl className={styles.summaryDetails}>
          <div>
            <dt>Projekt</dt>
            <dd>
              {draft.title ||
                project?.title ||
                "Ej angivet"}
            </dd>
          </div>

          <div>
            <dt>Kategori</dt>
            <dd>
              {category?.name ||
                "Ej vald"}
            </dd>
          </div>

          <div>
            <dt>Önskad start</dt>
            <dd>
              {draft.desiredStartDate ||
                "Ej angivet"}
            </dd>
          </div>

          <div>
            <dt>Giltighetstid</dt>
            <dd>
              {draft.validDays} dagar
            </dd>
          </div>
        </dl>

        {services.length === 0 ? (
          <div className={styles.summaryEmpty}>
            Inga tjänster valda ännu.
          </div>
        ) : (
          <div className={styles.summaryServices}>
            {services.map((service) => (
              <div key={service.id}>
                <span>
                  {service.name}
                  <small>
                    {service.quantity} st
                  </small>
                </span>

                <strong>
                  {currencyFormatter.format(
                    calculateSubtotal(
                      service
                    )
                  )}
                </strong>
              </div>
            ))}
          </div>
        )}

        {discount.mode !== "none" &&
          totals.discountAmount > 0 && (
            <div
              className={
                styles.summaryDiscount
              }
            >
              <span>
                {discount.label ||
                  "Rabatt"}
              </span>

              <strong>
                −{" "}
                {currencyFormatter.format(
                  totals.discountAmount
                )}
              </strong>
            </div>
          )}

        <div className={styles.priceSummary}>
          <div>
            <span>Delsumma</span>

            <strong>
              {currencyFormatter.format(
                totals.subtotalAfterDiscount
              )}
            </strong>
          </div>

          <div>
            <span>Moms</span>

            <strong>
              {currencyFormatter.format(
                totals.vatAmount
              )}
            </strong>
          </div>

          <div>
            <span>Totalt belopp</span>

            <strong>
              {currencyFormatter.format(
                totals.totalIncVat
              )}
            </strong>
          </div>
        </div>
      </section>

      <section className={styles.benefitCard}>
        <div>
          <span>
            <ShieldCheck size={19} />
          </span>

          <div>
            <strong>
              Professionell offert
            </strong>

            <small>
              Tydlig presentation i Xellens
              Agency-design.
            </small>
          </div>
        </div>

        <div>
          <span>
            <Clock3 size={19} />
          </span>

          <div>
            <strong>Snabb leverans</strong>

            <small>
              Skicka offerten digitalt till
              kunden.
            </small>
          </div>
        </div>

        <div>
          <span>
            <CircleDollarSign size={19} />
          </span>

          <div>
            <strong>
              Bättre uppföljning
            </strong>

            <small>
              Följ status och kundens svar i
              realtid.
            </small>
          </div>
        </div>
      </section>
    </aside>
  );
}


