"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Download,
  Printer,
  ReceiptText,
} from "lucide-react";

import type {
  InvoiceDetailData,
} from "@/lib/dashboard/invoices/invoice-detail-types";

import styles from "./InvoicePreview.module.css";

type InvoicePreviewProps = {
  data: InvoiceDetailData;
};

/*
  Dessa uppgifter kopplas senare till Inställningar.
  De används tills company_settings hämtas automatiskt.
*/
const company = {
  name: "Xellens Agency",
  address: "Hofverbergsgatan 2B",
  postalCity: "254 43 Helsingborg",
  phone: "072-942 35 37",
  email: "info@xellensagency.com",
  website: "xellensagency.com",
  organizationNumber: "890101-3931",
  vatNumber: "SE890101393101",
  bankgiro: "5587-4879",
  swish: "123 386 71 57",
};

function money(
  value: number,
  currency = "SEK"
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function dateText(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    )
  );
}

export default function InvoicePreview({
  data,
}: InvoicePreviewProps) {
  const paymentReference =
    data.invoice.ocrNumber ||
    data.invoice.invoiceNumber;

  function printInvoice() {
    window.print();
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link
          href={`/dashboard/fakturor/${data.invoice.id}`}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          Till fakturan
        </Link>

        <div className={styles.toolbarTitle}>
          <ReceiptText size={20} />

          <div>
            <strong>Förhandsgranskning</strong>

            <span>
              {data.invoice.invoiceNumber}
            </span>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            onClick={printInvoice}
          >
            <Printer size={18} />
            Skriv ut
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={printInvoice}
          >
            <Download size={18} />
            Spara PDF
          </button>
        </div>
      </div>

      <div className={styles.previewArea}>
        <article className={styles.invoicePaper}>
          <div className={styles.topAccent} />

          <header className={styles.invoiceHeader}>
            <div className={styles.brand}>
              <div className={styles.logoMark}>
                <span />
                <span />
              </div>

              <div className={styles.brandText}>
                <strong>XELLENS</strong>
                <span>AGENCY</span>
              </div>
            </div>

            <div className={styles.invoiceIdentity}>
              <span>FAKTURA</span>

              <strong>
                {data.invoice.invoiceNumber}
              </strong>

              <small>Sida 1 av 1</small>
            </div>
          </header>

          <section className={styles.introGrid}>
            <div className={styles.invoiceMetadata}>
              <dl>
                <div>
                  <dt>Fakturadatum</dt>

                  <dd>
                    {dateText(
                      data.invoice.invoiceDate
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Förfallodatum</dt>

                  <dd>
                    {dateText(
                      data.invoice.dueDate
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Kundnummer</dt>

                  <dd>
                    {data.customer.id
                      .slice(0, 8)
                      .toUpperCase()}
                  </dd>
                </div>

                <div>
                  <dt>Er referens</dt>

                  <dd>
                    {data.invoice.referenceNumber ||
                      "Ej angiven"}
                  </dd>
                </div>

                <div>
                  <dt>Vår referens</dt>

                  <dd>Andreas Ekelöf</dd>
                </div>

                <div>
                  <dt>Offert-/ordernummer</dt>

                  <dd>
                    {data.invoice.poNumber ||
                      "Ej angivet"}
                  </dd>
                </div>
              </dl>

              <p>
                Vid betalning efter
                förfallodatum kan
                dröjsmålsränta debiteras
                enligt gällande lag.
              </p>
            </div>

            <div className={styles.customerBox}>
              <span className={styles.boxLabel}>
                FAKTURAMOTTAGARE
              </span>

              <strong>
                {data.customer.name}
              </strong>

              {data.customer.organizationNumber && (
                <span>
                  Org.nr{" "}
                  {
                    data.customer
                      .organizationNumber
                  }
                </span>
              )}

              {data.customer.billingAddress && (
                <span>
                  {data.customer.billingAddress}
                </span>
              )}

              <span>
                {[
                  data.customer.postalCode,
                  data.customer.city,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </span>

              <span>
                {data.customer.country}
              </span>

              {(data.customer.billingEmail ||
                data.customer.email) && (
                <span className={styles.customerEmail}>
                  {data.customer.billingEmail ||
                    data.customer.email}
                </span>
              )}
            </div>
          </section>

          <section className={styles.invoiceDescription}>
            <span className={styles.sectionEyebrow}>
              FAKTURAUNDERLAG
            </span>

            <h1>{data.invoice.title}</h1>

            {data.invoice.description && (
              <p>
                {data.invoice.description}
              </p>
            )}
          </section>

          <section className={styles.itemsSection}>
            <table>
              <thead>
                <tr>
                  <th>Beskrivning</th>
                  <th>Antal</th>
                  <th>Enhet</th>
                  <th>À-pris</th>
                  <th>Moms</th>
                  <th>Summa</th>
                </tr>
              </thead>

              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      Fakturan saknar
                      fakturarader.
                    </td>
                  </tr>
                ) : (
                  data.items.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {item.description}
                          </strong>

                          {item.discountPercent >
                            0 && (
                            <small>
                              Rabatt:{" "}
                              {
                                item.discountPercent
                              }{" "}
                              %
                            </small>
                          )}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {item.unitCode}
                        </td>

                        <td>
                          {money(
                            item.unitPriceExVat,
                            data.invoice.currency
                          )}
                        </td>

                        <td>
                          {item.vatRate} %
                        </td>

                        <td>
                          <strong>
                            {money(
                              item.subtotalExVat,
                              data.invoice.currency
                            )}
                          </strong>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </section>

          <section className={styles.noticeBox}>
            <strong>Viktig information</strong>

            <p>
              Ange alltid OCR- eller
              fakturanumret som meddelande
              vid betalning.
            </p>

            {data.invoice.description && (
              <span>
                {data.invoice.description}
              </span>
            )}
          </section>

          <section className={styles.paymentArea}>
            <div className={styles.amountSummary}>
              <dl>
                <div>
                  <dt>Exkl. moms</dt>

                  <dd>
                    {money(
                      data.invoice.subtotalExVat,
                      data.invoice.currency
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Moms</dt>

                  <dd>
                    {money(
                      data.invoice.vatAmount,
                      data.invoice.currency
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Avrundning</dt>

                  <dd>
                    {money(
                      0,
                      data.invoice.currency
                    )}
                  </dd>
                </div>

                {data.invoice.amountPaid > 0 && (
                  <div>
                    <dt>Redan betalt</dt>

                    <dd>
                      −{" "}
                      {money(
                        data.invoice.amountPaid,
                        data.invoice.currency
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className={styles.paymentCard}>
              <div className={styles.qrPlaceholder}>
                <div className={styles.fakeQr}>
                  <span />
                  <span />
                  <span />
                </div>

                <strong>SWISH</strong>

                <small>
                  QR aktiveras när
                  Swish-integrationen kopplas
                </small>
              </div>

              <div className={styles.paymentDetails}>
                <dl>
                  <div>
                    <dt>Förfallodatum</dt>

                    <dd>
                      {dateText(
                        data.invoice.dueDate
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>OCR / referens</dt>

                    <dd>
                      {paymentReference}
                    </dd>
                  </div>

                  <div>
                    <dt>Bankgiro</dt>

                    <dd>
                      {company.bankgiro}
                    </dd>
                  </div>

                  <div>
                    <dt>Swish</dt>

                    <dd>
                      {company.swish}
                    </dd>
                  </div>
                </dl>

                <div className={styles.payTotal}>
                  <span>Att betala</span>

                  <strong>
                    {money(
                      data.invoice.outstandingAmount,
                      data.invoice.currency
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <footer className={styles.invoiceFooter}>
            <div>
              <strong>Adress</strong>

              <span>{company.name}</span>
              <span>{company.address}</span>
              <span>{company.postalCity}</span>
            </div>

            <div>
              <strong>Kontakt</strong>

              <span>{company.phone}</span>
              <span>{company.email}</span>
              <span>{company.website}</span>
            </div>

            <div>
              <strong>Företagsuppgifter</strong>

              <span>
                Org.nr{" "}
                {company.organizationNumber}
              </span>

              <span>
                Godkänd för F-skatt
              </span>
            </div>

            <div>
              <strong>Momsregistrering</strong>

              <span>{company.vatNumber}</span>

              <span>
                Faktura{" "}
                {data.invoice.invoiceNumber}
              </span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
