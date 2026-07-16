"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  ListChecks,
  Mail,
  ReceiptText,
  Send,
  Share2,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  OfferSentData,
} from "@/lib/dashboard/offers/offer-sent-types";

import styles from "./OfferSent.module.css";

type OfferSentProps = {
  data: OfferSentData;
};

function formatMoney(
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

function formatDate(
  value: string | null,
  includeTime = false
) {
  if (!value) {
    return "Ej angivet";
  }

  const date =
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    includeTime
      ? {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
  ).format(date);
}

export default function OfferSent({
  data,
}: OfferSentProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const emailSubject =
    encodeURIComponent(
      `Offert ${data.offerNumber} från Xellens Agency`
    );

  const emailBody =
    encodeURIComponent(
      `Hej!\n\nHär kan ni granska offert ${data.offerNumber}:\n${data.shareUrl}\n\nMed vänliga hälsningar\nXellens Agency`
    );

  const whatsappText =
    encodeURIComponent(
      `Här kan du granska offert ${data.offerNumber} från Xellens Agency: ${data.shareUrl}`
    );

  async function copyLink() {
    await navigator.clipboard.writeText(
      data.shareUrl
    );

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      2200
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs}>
        <Link href="/dashboard/offerter">
          Offerter
        </Link>

        <span>›</span>

        <span>Skapa ny offert</span>

        <span>›</span>

        <strong>
          Offert skickad
        </strong>
      </nav>

      <header className={styles.heading}>
        <div className={styles.headingIntro}>
          <Link
            href="/dashboard/offerter"
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1>
              Offerten är skickad!
            </h1>

            <p>
              Din offert har skickats till{" "}
              {data.customerName}.
            </p>
          </div>
        </div>

        <div className={styles.headingActions}>
          <a
            href={data.shareUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.secondaryButton}
          >
            <ExternalLink size={17} />
            Visa offert
          </a>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              window.print()
            }
          >
            <Download size={17} />
            Spara PDF
          </button>

          <Link
            href="/dashboard/offerter"
            className={styles.primaryButton}
          >
            <ListChecks size={17} />
            Gå till offerter
          </Link>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.successCard}>
          <section className={styles.successHero}>
            <div className={styles.successSymbol}>
              <span className={styles.sparkleOne}>
                ✦
              </span>

              <span className={styles.sparkleTwo}>
                ✦
              </span>

              <Check size={48} />
            </div>

            <h2>
              Offerten är skickad!
            </h2>

            <p>
              Din offert har skickats till{" "}
              {data.customerName}
            </p>
          </section>

          <section className={styles.nextInfo}>
            <h3>
              Vad händer härnäst?
            </h3>

            <div>
              <span>
                <Check size={14} />
              </span>

              Kunden får ett
              e-postmeddelande med
              offertlänken
            </div>

            <div>
              <span>
                <Check size={14} />
              </span>

              Kunden kan granska offerten
              och återkomma med svar
            </div>

            <div>
              <span>
                <Check size={14} />
              </span>

              Du får en notis när kunden
              öppnar offerten
            </div>
          </section>

          <section className={styles.offerInformation}>
            <h3>Offertinformation</h3>

            <div className={styles.informationGrid}>
              <dl>
                <div>
                  <dt>
                    <FileText size={17} />
                    Offertnummer
                  </dt>

                  <dd>
                    {data.offerNumber}
                  </dd>
                </div>

                <div>
                  <dt>
                    <ReceiptText size={17} />
                    Kund
                  </dt>

                  <dd>
                    {data.customerName}
                  </dd>
                </div>

                <div>
                  <dt>
                    <Mail size={17} />
                    E-post
                  </dt>

                  <dd>
                    {data.customerEmail ||
                      "Ej angiven"}
                  </dd>
                </div>

                <div>
                  <dt>
                    <Send size={17} />
                    Skickad
                  </dt>

                  <dd>
                    {formatDate(
                      data.sentAt,
                      true
                    )}
                  </dd>
                </div>
              </dl>

              <dl>
                <div>
                  <dt>
                    <CalendarDays
                      size={17}
                    />
                    Giltig till
                  </dt>

                  <dd>
                    {formatDate(
                      data.validUntil
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    <ReceiptText size={17} />
                    Totalt belopp
                  </dt>

                  <dd
                    className={
                      styles.totalValue
                    }
                  >
                    {formatMoney(
                      data.totalIncVat,
                      data.currency
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    <Clipboard size={17} />
                    Moms
                  </dt>

                  <dd>
                    {formatMoney(
                      data.vatAmount,
                      data.currency
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    <CheckCircle2
                      size={17}
                    />
                    Status
                  </dt>

                  <dd>
                    <span
                      className={
                        styles.sentStatus
                      }
                    >
                      Skickad
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <blockquote>
            <span>“</span>

            En professionell offert är
            första steget mot ett
            framgångsrikt samarbete.

            <span>”</span>
          </blockquote>

          <footer className={styles.mainFooter}>
            <Link
              href="/dashboard/offerter"
              className={styles.previousButton}
            >
              <ArrowLeft size={17} />
              Föregående
            </Link>

            <Link
              href="/dashboard/offerter"
              className={styles.primaryButton}
            >
              <ListChecks size={17} />
              Tillbaka till offerter
            </Link>
          </footer>
        </main>

        <aside className={styles.sidebar}>
          <section className={styles.sideCard}>
            <h2>Nästa steg</h2>

            <div className={styles.timeline}>
              <article className={styles.completedStep}>
                <span>1</span>

                <div>
                  <strong>
                    Offert skickad
                  </strong>

                  <small>
                    Kunden har fått offerten
                    via e-post
                  </small>
                </div>

                <em>Klar</em>
              </article>

              <article>
                <span>2</span>

                <div>
                  <strong>
                    Kund granskar
                  </strong>

                  <small>
                    Kunden tittar på offerten
                  </small>
                </div>

                <em>Väntar</em>
              </article>

              <article>
                <span>3</span>

                <div>
                  <strong>
                    Kundens svar
                  </strong>

                  <small>
                    Kunden accepterar eller
                    återkommer
                  </small>
                </div>

                <em>Väntar</em>
              </article>

              <article>
                <span>4</span>

                <div>
                  <strong>
                    Projekt skapas
                  </strong>

                  <small>
                    Vid accept skapas
                    projektet
                  </small>
                </div>

                <em>Väntar</em>
              </article>
            </div>
          </section>

          <section className={styles.sideCard}>
            <h2>Dela offerten</h2>

            <p>
              Dela offertlänken med kunden
              via andra kanaler.
            </p>

            <div className={styles.shareField}>
              <input
                readOnly
                value={data.shareUrl}
              />

              <button
                type="button"
                onClick={copyLink}
              >
                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}

                {copied
                  ? "Kopierad"
                  : "Kopiera"}
              </button>
            </div>

            <div className={styles.shareActions}>
              <a
                href={`mailto:${data.customerEmail || ""}?subject=${emailSubject}&body=${emailBody}`}
              >
                <Mail size={17} />
                Skicka via e-post
              </a>

              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
              >
                <Send size={17} />
                WhatsApp
              </a>

              <button
                type="button"
                onClick={copyLink}
              >
                <Share2 size={17} />
                Dela länk
              </button>
            </div>
          </section>

          <section
            className={[
              styles.sideCard,
              styles.tipCard,
            ].join(" ")}
          >
            <div className={styles.tipHeading}>
              <Lightbulb size={21} />

              <div>
                <h2>Tips</h2>

                <p>
                  Öka dina chanser att få
                  affären
                </p>
              </div>
            </div>

            <ul>
              <li>
                Följ upp inom 2–3 dagar om
                du inte hör något
              </li>

              <li>
                Var tillgänglig för frågor
                och funderingar
              </li>

              <li>
                Erbjud ett möte för att gå
                igenom offerten
              </li>

              <li>
                Påminn om erbjudandets
                giltighetstid
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
