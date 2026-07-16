"use client";

import Image from "next/image";

import {
  BadgePercent,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Settings2,
} from "lucide-react";

import type {
  CreateOfferOptions,
  OfferAddonDraft,
  OfferDiscountDraft,
  OfferDraft,
  OfferServiceDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import {
  calculateOfferLineSubtotal,
  calculateOfferTotals,
} from "@/lib/dashboard/offers/offer-calculations";

import styles from "./OfferPreview.module.css";

type OfferPreviewProps = {
  options: CreateOfferOptions;
  draft: OfferDraft;
  services: OfferServiceDraft[];
  addons: OfferAddonDraft[];
  discount: OfferDiscountDraft;

  onDraftChange: <
    K extends keyof OfferDraft
  >(
    field: K,
    value: OfferDraft[K]
  ) => void;
};

function formatDate(
  value: string
) {
  if (!value) {
    return "Ej angivet";
  }

  const date = new Date(
    `${value}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

export default function OfferPreview({
  options,
  draft,
  services,
  addons,
  discount,
  onDraftChange,
}: OfferPreviewProps) {
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

  const customerEmail =
    draft.customerMode === "existing"
      ? contact?.email ||
        customer?.email ||
        ""
      : draft.newCustomerEmail;

  const customerPhone =
    draft.customerMode === "existing"
      ? contact?.phone ||
        customer?.phone ||
        ""
      : draft.newCustomerPhone;

  const totals =
    calculateOfferTotals(
      services,
      addons,
      discount
    );

  const currencyFormatter =
    new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: draft.currency,
      maximumFractionDigits: 0,
    });

  const offerRows = [
    ...services.map((service) => ({
      ...service,
      group: "Tjänst",
    })),

    ...addons.map((addon) => ({
      ...addon,
      group: addon.isOptional
        ? "Valbart tillägg"
        : "Tillägg",
    })),
  ];

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>Steg 4</span>

          <h2>Förhandsvisning</h2>

          <p>
            Kontrollera innehållet innan
            offerten sparas och skickas.
          </p>
        </div>

        <strong>
          Redo för granskning
        </strong>
      </header>

      <div className={styles.previewLayout}>
        <div className={styles.documentWrap}>
          <article
            className={styles.document}
            id="offer-print-preview"
          >
            <header
              className={
                styles.documentHeader
              }
            >
              <div className={styles.logoArea}>
                <Image
                  src="/images/login/xellens-login-logo.png"
                  alt="Xellens Agency"
                  width={175}
                  height={55}
                  className={styles.logo}
                />
              </div>

              <div className={styles.offerMeta}>
                <span>OFFERT</span>

                <strong>
                  UTKAST
                </strong>

                <small>
                  Giltig i {draft.validDays}{" "}
                  dagar
                </small>
              </div>
            </header>

            <div
              className={
                styles.documentContent
              }
            >
              <section
                className={
                  styles.customerSection
                }
              >
                <div>
                  <small>OFFERT TILL</small>

                  <strong>
                    {customerName}
                  </strong>

                  {contact?.fullName && (
                    <span>
                      {contact.fullName}
                    </span>
                  )}

                  {customerEmail && (
                    <span>
                      {customerEmail}
                    </span>
                  )}

                  {customerPhone && (
                    <span>
                      {customerPhone}
                    </span>
                  )}
                </div>

                <dl>
                  <div>
                    <dt>Projekt</dt>
                    <dd>
                      {draft.title ||
                        "Ej angivet"}
                    </dd>
                  </div>

                  <div>
                    <dt>Kategori</dt>
                    <dd>
                      {category?.name ||
                        "Ej angivet"}
                    </dd>
                  </div>

                  <div>
                    <dt>Startdatum</dt>
                    <dd>
                      {formatDate(
                        draft.desiredStartDate
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Valuta</dt>
                    <dd>
                      {draft.currency}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className={
                  styles.introduction
                }
              >
                <h1>
                  {draft.title ||
                    "Offertförslag"}
                </h1>

                {draft.description && (
                  <p>
                    {draft.description}
                  </p>
                )}

                {draft.customerMessage && (
                  <div
                    className={
                      styles.customerMessage
                    }
                  >
                    <Mail size={17} />

                    <p>
                      {draft.customerMessage}
                    </p>
                  </div>
                )}
              </section>

              <section
                className={
                  styles.offerTableSection
                }
              >
                <h2>
                  Tjänster och omfattning
                </h2>

                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Tjänst</th>

                        {draft.includeDetailedPricing && (
                          <>
                            <th>Antal</th>
                            <th>À-pris</th>
                          </>
                        )}

                        <th>Belopp</th>
                      </tr>
                    </thead>

                    <tbody>
                      {offerRows.map(
                        (row) => (
                          <tr key={row.id}>
                            <td>
                              <strong>
                                {row.name}
                              </strong>

                              <span>
                                {row.group}
                              </span>

                              {row.description && (
                                <small>
                                  {
                                    row.description
                                  }
                                </small>
                              )}
                            </td>

                            {draft.includeDetailedPricing && (
                              <>
                                <td>
                                  {row.quantity}
                                </td>

                                <td>
                                  {currencyFormatter.format(
                                    row.unitPriceExVat
                                  )}
                                </td>
                              </>
                            )}

                            <td>
                              <strong>
                                {currencyFormatter.format(
                                  calculateOfferLineSubtotal(
                                    row
                                  )
                                )}
                              </strong>
                            </td>
                          </tr>
                        )
                      )}

                      {offerRows.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={
                              draft.includeDetailedPricing
                                ? 4
                                : 2
                            }
                            className={
                              styles.emptyRows
                            }
                          >
                            Inga tjänster valda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section
                className={
                  styles.totalSection
                }
              >
                <div />

                <dl>
                  <div>
                    <dt>
                      Delsumma exkl. moms
                    </dt>

                    <dd>
                      {currencyFormatter.format(
                        totals.subtotalBeforeDiscount
                      )}
                    </dd>
                  </div>

                  {totals.discountAmount >
                    0 && (
                    <div
                      className={
                        styles.discountRow
                      }
                    >
                      <dt>
                        {discount.label ||
                          "Rabatt"}
                      </dt>

                      <dd>
                        −{" "}
                        {currencyFormatter.format(
                          totals.discountAmount
                        )}
                      </dd>
                    </div>
                  )}

                  {draft.showVat && (
                    <div>
                      <dt>Moms</dt>

                      <dd>
                        {currencyFormatter.format(
                          totals.vatAmount
                        )}
                      </dd>
                    </div>
                  )}

                  <div
                    className={
                      styles.grandTotal
                    }
                  >
                    <dt>
                      Totalt{" "}
                      {draft.showVat
                        ? "inkl. moms"
                        : "exkl. moms"}
                    </dt>

                    <dd>
                      {currencyFormatter.format(
                        draft.showVat
                          ? totals.totalIncVat
                          : totals.subtotalAfterDiscount
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className={
                  styles.termsSection
                }
              >
                <div>
                  <h2>Betalningsvillkor</h2>

                  <p>
                    {draft.paymentTerms ||
                      "Betalningsvillkor anges före utskick."}
                  </p>
                </div>

                <div>
                  <h2>Villkor</h2>

                  <p>
                    {draft.termsText ||
                      "Offertens fullständiga villkor anges före utskick."}
                  </p>
                </div>
              </section>
            </div>

            <footer
              className={
                styles.documentFooter
              }
            >
              <div>
                <strong>
                  Xellens Agency
                </strong>

                <span>
                  Digital produktion,
                  utveckling och design
                </span>
              </div>

              <div>
                <span>
                  xellensagency.com
                </span>

                <span>
                  Offerten är skapad
                  digitalt
                </span>
              </div>
            </footer>
          </article>
        </div>

        <aside className={styles.settings}>
          <section
            className={styles.settingsCard}
          >
            <div
              className={
                styles.settingsHeader
              }
            >
              <Settings2 size={19} />

              <div>
                <h3>Offertinställningar</h3>

                <p>
                  Anpassa det kunden ser.
                </p>
              </div>
            </div>

            <label className={styles.field}>
              <span>
                Meddelande till kunden
              </span>

              <textarea
                rows={5}
                value={
                  draft.customerMessage
                }
                placeholder="Tack för er förfrågan. Här kommer vårt offertförslag..."
                onChange={(event) =>
                  onDraftChange(
                    "customerMessage",
                    event.target.value
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>
                Betalningsvillkor
              </span>

              <textarea
                rows={3}
                value={
                  draft.paymentTerms
                }
                placeholder="Exempel: 30 % vid projektstart..."
                onChange={(event) =>
                  onDraftChange(
                    "paymentTerms",
                    event.target.value
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Övriga villkor</span>

              <textarea
                rows={5}
                value={draft.termsText}
                placeholder="Beskriv leverans, korrigeringar och offertens giltighet..."
                onChange={(event) =>
                  onDraftChange(
                    "termsText",
                    event.target.value
                  )
                }
              />
            </label>
          </section>

          <section
            className={styles.settingsCard}
          >
            <div
              className={
                styles.settingsHeader
              }
            >
              <FileText size={19} />

              <div>
                <h3>Visningsalternativ</h3>

                <p>
                  Styr offertens detaljer.
                </p>
              </div>
            </div>

            <label
              className={
                styles.checkField
              }
            >
              <input
                type="checkbox"
                checked={
                  draft.includeDetailedPricing
                }
                onChange={(event) =>
                  onDraftChange(
                    "includeDetailedPricing",
                    event.target.checked
                  )
                }
              />

              <span>
                Visa antal och à-pris
              </span>
            </label>

            <label
              className={
                styles.checkField
              }
            >
              <input
                type="checkbox"
                checked={draft.showVat}
                onChange={(event) =>
                  onDraftChange(
                    "showVat",
                    event.target.checked
                  )
                }
              />

              <span>
                Visa moms och pris inkl. moms
              </span>
            </label>

            <label
              className={
                styles.checkField
              }
            >
              <input
                type="checkbox"
                checked={draft.includePdf}
                onChange={(event) =>
                  onDraftChange(
                    "includePdf",
                    event.target.checked
                  )
                }
              />

              <span>
                Bifoga PDF vid utskick
              </span>
            </label>

            <label
              className={
                styles.checkField
              }
            >
              <input
                type="checkbox"
                checked={
                  draft.sendCopyToSelf
                }
                onChange={(event) =>
                  onDraftChange(
                    "sendCopyToSelf",
                    event.target.checked
                  )
                }
              />

              <span>
                Skicka kopia till mig
              </span>
            </label>
          </section>

          <section className={styles.readyCard}>
            <span>
              <CheckCircle2 size={23} />
            </span>

            <div>
              <strong>
                Offerten är redo
              </strong>

              <p>
                Kontrollera kund, innehåll,
                priser och villkor innan
                utskick.
              </p>
            </div>
          </section>

          {totals.discountAmount > 0 && (
            <section
              className={styles.campaignCard}
            >
              <BadgePercent size={20} />

              <div>
                <strong>
                  {discount.label ||
                    "Aktiv rabatt"}
                </strong>

                <span>
                  −{" "}
                  {currencyFormatter.format(
                    totals.discountAmount
                  )}
                </span>
              </div>
            </section>
          )}

          <button
            type="button"
            className={styles.pdfButton}
            onClick={() =>
              window.print()
            }
          >
            <Download size={17} />
            Skriv ut / spara PDF
          </button>
        </aside>
      </div>
    </section>
  );
}
