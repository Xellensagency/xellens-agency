"use client";

import Image from "next/image";

import {
  BadgePercent,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Mail,
  Printer,
  ReceiptText,
  Settings2,
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
  calculateOfferLineSubtotal,
  calculateOfferTotals,
} from "@/lib/dashboard/offers/offer-calculations";

import styles from "./OfferPreview.module.css";


type OfferPreviewProps = {
  options:
    CreateOfferOptions;

  draft:
    OfferDraft;

  services:
    OfferServiceDraft[];

  addons:
    OfferAddonDraft[];

  discount:
    OfferDiscountDraft;

  offerNumber?: string;

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

  const date =
    new Date(
      `${value}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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


function formatCurrency(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(value);
}


export default function OfferPreview({
  options,
  draft,
  services,
  addons,
  discount,
  offerNumber = "",
  onDraftChange,
}: OfferPreviewProps) {
  const customer =
    options.customers.find(
      (
        item
      ) =>
        item.id ===
        draft.customerId
    );


  const contact =
    customer?.contacts.find(
      (
        item
      ) =>
        item.id ===
        draft.contactId
    );


  const category =
    options.categories.find(
      (
        item
      ) =>
        item.id ===
        draft.categoryId
    );


  const customerName =
    draft.customerMode ===
    "existing"
      ? customer?.name ||
        "Ingen kund vald"
      : draft.newCustomerName ||
        "Ny kund";


  const contactName =
    draft.customerMode ===
    "existing"
      ? contact?.fullName ||
        ""
      : "";


  const customerEmail =
    draft.customerMode ===
    "existing"
      ? contact?.email ||
        customer?.email ||
        ""
      : draft.newCustomerEmail;


  const customerPhone =
    draft.customerMode ===
    "existing"
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


  const requiredAddons =
    addons.filter(
      (
        addon
      ) =>
        !addon.isOptional
    );


  const optionalAddons =
    addons.filter(
      (
        addon
      ) =>
        addon.isOptional
    );


  const mainRows = [
    ...services.map(
      (
        service
      ) => ({
        ...service,
        group:
          "Tjänst",
      })
    ),

    ...requiredAddons.map(
      (
        addon
      ) => ({
        ...addon,
        group:
          "Tillägg",
      })
    ),
  ];


  const checks = [
    {
      label:
        "Kund vald",
      ready:
        Boolean(
          customerName &&
          customerName !==
            "Ingen kund vald"
        ),
    },
    {
      label:
        "Kontaktuppgifter",
      ready:
        Boolean(
          customerEmail
        ),
    },
    {
      label:
        "Tjänster tillagda",
      ready:
        services.length >
        0,
    },
    {
      label:
        "Betalningsvillkor",
      ready:
        Boolean(
          draft.paymentTerms
            .trim()
        ),
    },
    {
      label:
        "Offertvillkor",
      ready:
        Boolean(
          draft.termsText
            .trim()
        ),
    },
  ];


  const readyCount =
    checks.filter(
      (
        item
      ) =>
        item.ready
    ).length;


  function printAsA4() {
    const preview =
      document.getElementById(
        "offer-print-preview"
      );

    if (!preview) {
      window.alert(
        "Offertens förhandsvisning kunde inte hittas."
      );

      return;
    }

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=920,height=1100"
      );

    if (!printWindow) {
      window.alert(
        "Webbläsaren blockerade PDF-fönstret. Tillåt popup-fönster och försök igen."
      );

      return;
    }

    const styles =
      Array.from(
        document.querySelectorAll(
          'link[rel="stylesheet"], style'
        )
      )
        .map(
          (element) =>
            element.outerHTML
        )
        .join("\n");

    const title =
      offerNumber
        ? `Offert ${offerNumber}`
        : "Vorix offert";

    printWindow.document.open();

    printWindow.document.write(`
      <!doctype html>
      <html lang="sv">
        <head>
          <meta charset="utf-8" />

          <base href="${window.location.origin}/" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>${title}</title>

          ${styles}

          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }

            html,
            body {
              width: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            body {
              min-height: 0 !important;
              overflow: visible !important;
            }

            body * {
              visibility: visible !important;
            }

            #offer-print-preview {
              position: static !important;
              inset: auto !important;

              display: block !important;

              width: 210mm !important;
              min-width: 210mm !important;
              max-width: 210mm !important;

              min-height: 0 !important;

              margin: 0 !important;

              border: 0 !important;
              border-radius: 0 !important;

              box-shadow: none !important;

              overflow: visible !important;

              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            #offer-print-preview * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            #offer-print-preview header,
            #offer-print-preview footer,
            #offer-print-preview article,
            #offer-print-preview tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @media print {
              html,
              body {
                width: 210mm !important;
                height: auto !important;
              }

              #offer-print-preview {
                width: 210mm !important;
                min-width: 210mm !important;
                min-height: 0 !important;
              }
            }
          </style>
        </head>

        <body>
          ${preview.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    const runPrint = () => {
      printWindow.focus();

      window.setTimeout(
        () => {
          printWindow.print();
        },
        350
      );
    };

    if (
      printWindow.document.readyState ===
      "complete"
    ) {
      runPrint();
    }
    else {
      printWindow.onload =
        runPrint;
    }
  }


  return (
    <section
      className={
        styles.card
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span>
            STEG 4 · GRANSKA
          </span>

          <h2>
            Förhandsgranska offerten
          </h2>

          <p>
            Kontrollera exakt hur
            kunden kommer att se
            offerten innan den
            skickas.
          </p>
        </div>

        <div
          className={
            styles.headerStatus
          }
        >
          <FileCheck2
            size={19}
          />

          <div>
            <small>
              PDF-FÖRHANDSVISNING
            </small>

            <strong>
              A4 · 210 × 297 mm
            </strong>
          </div>
        </div>
      </header>


      <div
        className={
          styles.previewLayout
        }
      >
        <div
          className={
            styles.documentColumn
          }
        >
          <div
            className={
              styles.documentToolbar
            }
          >
            <div>
              <span>
                A4
              </span>

              <strong>
                Kundens offert
              </strong>

              <small>
                Ljus PDF-layout
              </small>
            </div>

            <button
              type="button"
              onClick={
                printAsA4
              }
            >
              <Printer
                size={16}
              />

              Skriv ut / Spara PDF
            </button>
          </div>


          <div
            className={
              styles.documentWrap
            }
          >
            <article
              className={
                styles.document
              }
              id="offer-print-preview"
            >
              <header
                className={
                  styles.documentHeader
                }
              >
                <div
                  className={
                    styles.brand
                  }
                >
                  <Image
                    src="/images/brand/vorix-logo-vit.png"
                    alt="Vorix"
                    width={160}
                    height={48}
                    className={
                      styles.logo
                    }
                  />

                  <span>
                    Digital products.
                    Built to last.
                  </span>
                </div>


                <div
                  className={
                    styles.offerMeta
                  }
                >
                  <span>
                    OFFERT
                  </span>

                  <strong>
                    {offerNumber ||
                      "UTKAST"}
                  </strong>

                  <small>
                    Giltig i{" "}
                    {
                      draft.validDays
                    }{" "}
                    dagar från
                    utskick
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
                    styles.documentIntro
                  }
                >
                  <div>
                    <small>
                      OFFERTFÖRSLAG
                    </small>

                    <h1>
                      {draft.title ||
                        "Offertförslag"}
                    </h1>

                    {draft.description && (
                      <p>
                        {
                          draft.description
                        }
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      styles.offerBadge
                    }
                  >
                    <small>
                      TOTALT
                    </small>

                    <strong>
                      {formatCurrency(
                        draft.showVat
                          ? totals.totalIncVat
                          : totals.subtotalAfterDiscount,
                        draft.currency
                      )}
                    </strong>

                    <span>
                      {draft.showVat
                        ? "inkl. moms"
                        : "exkl. moms"}
                    </span>
                  </div>
                </section>


                <section
                  className={
                    styles.customerSection
                  }
                >
                  <div>
                    <small>
                      OFFERT TILL
                    </small>

                    <strong>
                      {
                        customerName
                      }
                    </strong>

                    {contactName && (
                      <span>
                        {
                          contactName
                        }
                      </span>
                    )}

                    {customerEmail && (
                      <span>
                        {
                          customerEmail
                        }
                      </span>
                    )}

                    {customerPhone && (
                      <span>
                        {
                          customerPhone
                        }
                      </span>
                    )}
                  </div>


                  <dl>
                    <div>
                      <dt>
                        Offertnummer
                      </dt>

                      <dd>
                        {offerNumber ||
                          "Tilldelas vid sparning"}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Kategori
                      </dt>

                      <dd>
                        {category?.name ||
                          "Ej angivet"}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Önskad start
                      </dt>

                      <dd>
                        {formatDate(
                          draft.desiredStartDate
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Giltighet
                      </dt>

                      <dd>
                        {
                          draft.validDays
                        }{" "}
                        dagar
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Valuta
                      </dt>

                      <dd>
                        {
                          draft.currency
                        }
                      </dd>
                    </div>
                  </dl>
                </section>


                {draft.customerMessage && (
                  <section
                    className={
                      styles.customerMessage
                    }
                  >
                    <Mail
                      size={18}
                    />

                    <div>
                      <strong>
                        Meddelande från
                        Vorix
                      </strong>

                      <p>
                        {
                          draft.customerMessage
                        }
                      </p>
                    </div>
                  </section>
                )}


                <section
                  className={
                    styles.offerTableSection
                  }
                >
                  <div
                    className={
                      styles.sectionTitle
                    }
                  >
                    <span>
                      01
                    </span>

                    <div>
                      <h2>
                        Tjänster &
                        omfattning
                      </h2>

                      <p>
                        Det här ingår
                        i grundofferten.
                      </p>
                    </div>
                  </div>


                  <div
                    className={
                      styles.tableWrap
                    }
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Beskrivning
                          </th>

                          {draft.includeDetailedPricing && (
                            <>
                              <th>
                                Antal
                              </th>

                              <th>
                                Á-pris
                              </th>
                            </>
                          )}

                          <th>
                            Belopp
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {mainRows.map(
                          (
                            row
                          ) => (
                            <tr
                              key={
                                row.id
                              }
                            >
                              <td>
                                <strong>
                                  {
                                    row.name
                                  }
                                </strong>

                                <span>
                                  {
                                    row.group
                                  }
                                </span>

                                {row.description && (
                                  <small>
                                    {
                                      row.description
                                    }
                                  </small>
                                )}

                                {row.discountPercent >
                                  0 && (
                                  <em>
                                    {
                                      row.discountPercent
                                    }
                                    % rabatt
                                  </em>
                                )}
                              </td>

                              {draft.includeDetailedPricing && (
                                <>
                                  <td>
                                    {
                                      row.quantity
                                    }
                                  </td>

                                  <td>
                                    {formatCurrency(
                                      row.unitPriceExVat,
                                      draft.currency
                                    )}
                                  </td>
                                </>
                              )}

                              <td>
                                <strong>
                                  {formatCurrency(
                                    calculateOfferLineSubtotal(
                                      row
                                    ),
                                    draft.currency
                                  )}
                                </strong>
                              </td>
                            </tr>
                          )
                        )}

                        {mainRows.length ===
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
                              Inga
                              tjänster
                              har lagts
                              till.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>


                {optionalAddons.length >
                  0 && (
                  <section
                    className={
                      styles.optionalSection
                    }
                  >
                    <div
                      className={
                        styles.sectionTitle
                      }
                    >
                      <span>
                        02
                      </span>

                      <div>
                        <h2>
                          Valbara
                          tillägg
                        </h2>

                        <p>
                          Kunden kan
                          välja dessa
                          utöver
                          grundofferten.
                        </p>
                      </div>
                    </div>


                    <div
                      className={
                        styles.optionalList
                      }
                    >
                      {optionalAddons.map(
                        (
                          addon
                        ) => (
                          <article
                            key={
                              addon.id
                            }
                          >
                            <div>
                              <strong>
                                {
                                  addon.name
                                }
                              </strong>

                              {addon.description && (
                                <p>
                                  {
                                    addon.description
                                  }
                                </p>
                              )}
                            </div>

                            <strong>
                              +{" "}
                              {formatCurrency(
                                calculateOfferLineSubtotal(
                                  addon
                                ),
                                draft.currency
                              )}
                            </strong>
                          </article>
                        )
                      )}
                    </div>
                  </section>
                )}


                <section
                  className={
                    styles.totalSection
                  }
                >
                  <div
                    className={
                      styles.totalInfo
                    }
                  >
                    <ReceiptText
                      size={22}
                    />

                    <div>
                      <strong>
                        Prissammanställning
                      </strong>

                      <span>
                        Samtliga belopp
                        anges i{" "}
                        {
                          draft.currency
                        }.
                      </span>
                    </div>
                  </div>


                  <dl>
                    <div>
                      <dt>
                        Delsumma
                        exkl. moms
                      </dt>

                      <dd>
                        {formatCurrency(
                          totals.subtotalBeforeDiscount,
                          draft.currency
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
                          {formatCurrency(
                            totals.discountAmount,
                            draft.currency
                          )}
                        </dd>
                      </div>
                    )}


                    {draft.showVat && (
                      <div>
                        <dt>
                          Moms
                        </dt>

                        <dd>
                          {formatCurrency(
                            totals.vatAmount,
                            draft.currency
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
                        {formatCurrency(
                          draft.showVat
                            ? totals.totalIncVat
                            : totals.subtotalAfterDiscount,
                          draft.currency
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
                  <div
                    className={
                      styles.sectionTitle
                    }
                  >
                    <span>
                      03
                    </span>

                    <div>
                      <h2>
                        Villkor
                      </h2>

                      <p>
                        Viktig
                        information
                        innan
                        godkännande.
                      </p>
                    </div>
                  </div>


                  <div
                    className={
                      styles.termsGrid
                    }
                  >
                    <article>
                      <h3>
                        Betalning
                      </h3>

                      <p>
                        {draft.paymentTerms ||
                          "Betalningsvillkor anges före utskick."}
                      </p>
                    </article>

                    <article>
                      <h3>
                        Offertvillkor
                      </h3>

                      <p>
                        {draft.termsText ||
                          "Offertens fullständiga villkor anges före utskick."}
                      </p>
                    </article>
                  </div>
                </section>


                <section
                  className={
                    styles.acceptanceSection
                  }
                >
                  <div>
                    <ShieldCheck
                      size={22}
                    />

                    <div>
                      <strong>
                        Digitalt
                        godkännande
                      </strong>

                      <p>
                        När kunden
                        accepterar
                        offerten
                        registreras
                        svar och tid
                        digitalt i
                        Vorix.
                      </p>
                    </div>
                  </div>

                  <span>
                    Giltig i{" "}
                    {
                      draft.validDays
                    }{" "}
                    dagar från
                    utskick
                  </span>
                </section>
              </div>


              <footer
                className={
                  styles.documentFooter
                }
              >
                <div>
                  <strong>
                    VORIX
                  </strong>

                  <span>
                    Digital
                    products.
                    Built to last.
                  </span>
                </div>

                <div>
                  <span>
                    Offerten är
                    skapad digitalt
                    i Vorix
                  </span>

                  <span>
                    {
                      offerNumber ||
                      "Utkast"
                    }
                  </span>
                </div>
              </footer>
            </article>
          </div>
        </div>


        <aside
          className={
            styles.settings
          }
        >
          <section
            className={
              styles.settingsCard
            }
          >
            <div
              className={
                styles.settingsHeader
              }
            >
              <CheckCircle2
                size={20}
              />

              <div>
                <small>
                  SLUTKONTROLL
                </small>

                <h3>
                  Redo att skicka?
                </h3>

                <p>
                  {readyCount} av{" "}
                  {checks.length}{" "}
                  kontroller är
                  klara.
                </p>
              </div>
            </div>


            <div
              className={
                styles.checkList
              }
            >
              {checks.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item.label
                    }
                    className={
                      item.ready
                        ? styles.readyCheck
                        : styles.warningCheck
                    }
                  >
                    <span>
                      {item.ready ? (
                        <Check
                          size={14}
                        />
                      ) : (
                        <CircleAlert
                          size={14}
                        />
                      )}
                    </span>

                    <strong>
                      {
                        item.label
                      }
                    </strong>
                  </div>
                )
              )}
            </div>
          </section>


          <section
            className={
              styles.settingsCard
            }
          >
            <div
              className={
                styles.settingsHeader
              }
            >
              <Settings2
                size={20}
              />

              <div>
                <small>
                  VISNING
                </small>

                <h3>
                  Offertinställningar
                </h3>

                <p>
                  Ändra vad kunden
                  ska se.
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
                onChange={(
                  event
                ) =>
                  onDraftChange(
                    "includeDetailedPricing",
                    event.target
                      .checked
                  )
                }
              />

              <Eye
                size={17}
              />

              <span>
                <strong>
                  Detaljerade
                  priser
                </strong>

                <small>
                  Visa antal och
                  á-pris.
                </small>
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
                  draft.showVat
                }
                onChange={(
                  event
                ) =>
                  onDraftChange(
                    "showVat",
                    event.target
                      .checked
                  )
                }
              />

              <ReceiptText
                size={17}
              />

              <span>
                <strong>
                  Visa moms
                </strong>

                <small>
                  Redovisa moms
                  separat.
                </small>
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
                  draft.includePdf
                }
                onChange={(
                  event
                ) =>
                  onDraftChange(
                    "includePdf",
                    event.target
                      .checked
                  )
                }
              />

              <FileText
                size={17}
              />

              <span>
                <strong>
                  Bifoga PDF
                </strong>

                <small>
                  Skicka PDF med
                  den digitala
                  offerten.
                </small>
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
                onChange={(
                  event
                ) =>
                  onDraftChange(
                    "sendCopyToSelf",
                    event.target
                      .checked
                  )
                }
              />

              <Mail
                size={17}
              />

              <span>
                <strong>
                  Kopia till Vorix
                </strong>

                <small>
                  Skicka en kopia
                  internt.
                </small>
              </span>
            </label>
          </section>


          {totals.discountAmount >
            0 && (
            <section
              className={
                styles.campaignCard
              }
            >
              <BadgePercent
                size={20}
              />

              <div>
                <small>
                  AKTIV RABATT
                </small>

                <strong>
                  {discount.label ||
                    "Offertens rabatt"}
                </strong>

                <span>
                  −{" "}
                  {formatCurrency(
                    totals.discountAmount,
                    draft.currency
                  )}
                </span>
              </div>
            </section>
          )}


          <button
            type="button"
            className={
              styles.pdfButton
            }
            onClick={() =>
              window.print()
            }
          >
            <Download
              size={17}
            />

            Förhandsvisa som PDF
          </button>
        </aside>
      </div>
    </section>
  );
}