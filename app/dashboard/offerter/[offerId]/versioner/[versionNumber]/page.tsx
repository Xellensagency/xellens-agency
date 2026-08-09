import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Download,
  CheckCircle2,
  FileClock,
  LockKeyhole,
  Mail,
  ReceiptText,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "./page.module.css";


type PageProps = {
  params: Promise<{
    offerId: string;
    versionNumber: string;
  }>;
};


type UnknownRow =
  Record<string, unknown>;


function asObject(
  value: unknown
): UnknownRow {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRow;
  }

  return {};
}


function asArray(
  value: unknown
) {
  return Array.isArray(value)
    ? value
    : [];
}


function stringValue(
  row: UnknownRow,
  key: string,
  fallback = ""
) {
  const value =
    row[key];

  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}


function numberValue(
  row: UnknownRow,
  key: string
) {
  const value =
    Number(row[key]);

  return Number.isFinite(value)
    ? value
    : 0;
}


function formatCurrency(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency:
        currency || "SEK",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "Ej registrerat";
  }

  const date =
    new Date(value);

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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


export default async function OfferVersionPage({
  params,
}: PageProps) {
  const {
    offerId,
    versionNumber,
  } = await params;

  const parsedVersion =
    Number(versionNumber);

  if (
    !Number.isInteger(
      parsedVersion
    ) ||
    parsedVersion < 1
  ) {
    notFound();
  }


  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await (
    supabase as any
  )
    .from("offer_versions")
    .select(
      "id, offer_id, version_number, snapshot, recipient_email, sent_at, created_at"
    )
    .eq(
      "offer_id",
      offerId
    )
    .eq(
      "version_number",
      parsedVersion
    )
    .maybeSingle();


  if (
    error ||
    !data
  ) {
    notFound();
  }


  const snapshot =
    asObject(
      data.snapshot
    );

  const offer =
    asObject(
      snapshot.offer
    );

  const customer =
    asObject(
      snapshot.customer
    );

  const contact =
    asObject(
      snapshot.contact
    );

  const items =
    asArray(
      snapshot.items
    ).map(
      (
        value
      ) =>
        asObject(value)
    );


  const currency =
    stringValue(
      offer,
      "currency",
      "SEK"
    );

  const offerNumber =
    stringValue(
      offer,
      "offer_number",
      "Offert"
    );

  const title =
    stringValue(
      offer,
      "title",
      "Offert"
    );

  const customerName =
    stringValue(
      customer,
      "name",
      "Ingen kund angiven"
    );

  const recipient =
    data.recipient_email ||
    stringValue(
      contact,
      "email"
    ) ||
    stringValue(
      customer,
      "email"
    );


  return (
    <div
      className={
        styles.page
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <Link
            href={`/dashboard/offerter/${offerId}`}
            className={
              styles.back
            }
          >
            <ArrowLeft
              size={16}
            />

            Tillbaka till
            offerten
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            LÅST OFFERTVERSION
          </span>

          <div
            className={
              styles.titleRow
            }
          >
            <h1>
              Version{" "}
              {parsedVersion}
            </h1>

            <span
              className={
                styles.locked
              }
            >
              <LockKeyhole
                size={13}
              />

              Låst
            </span>
          </div>

          <p>
            Detta är en historisk
            kopia och kan inte
            ändras.
          </p>
        </div>


        <div
          className={
            styles.headerActions
          }
        >
          <a
            href={`/dashboard/offerter/${offerId}/versioner/${parsedVersion}/pdf`}
            className={
              styles.downloadButton
            }
          >
            <Download
              size={15}
            />

            Ladda ner PDF
          </a>

          <div
            className={
              styles.meta
            }
          >
          <FileClock
            size={18}
          />

          <div>
            <small>
              SKICKAD
            </small>

            <strong>
              {formatDateTime(
                data.sent_at ||
                  data.created_at
              )}
            </strong>
          </div>
          </div>
        </div>
      </header>


      <section
        className={
          styles.summary
        }
      >
        <article>
          <small>
            OFFERTNUMMER
          </small>

          <strong>
            {offerNumber}
          </strong>
        </article>

        <article>
          <small>
            KUND
          </small>

          <strong>
            {customerName}
          </strong>
        </article>

        <article>
          <small>
            MOTTAGARE
          </small>

          <strong>
            {recipient ||
              "Ej angivet"}
          </strong>
        </article>

        <article>
          <small>
            TOTALT
          </small>

          <strong
            className={
              styles.green
            }
          >
            {formatCurrency(
              numberValue(
                offer,
                "total_inc_vat"
              ),
              currency
            )}
          </strong>
        </article>
      </section>


      <div
        className={
          styles.layout
        }
      >
        <main
          className={
            styles.main
          }
        >
          <section
            className={
              styles.card
            }
          >
            <header
              className={
                styles.cardHeader
              }
            >
              <div>
                <span>
                  01
                </span>

                <div>
                  <h2>
                    {title}
                  </h2>

                  <p>
                    {
                      stringValue(
                        offer,
                        "description"
                      ) ||
                      "Ingen beskrivning angiven."
                    }
                  </p>
                </div>
              </div>
            </header>


            <div
              className={
                styles.table
              }
            >
              <div
                className={
                  styles.tableHead
                }
              >
                <span>
                  Tjänst
                </span>

                <span>
                  Antal
                </span>

                <span>
                  Pris
                </span>

                <span>
                  Belopp
                </span>
              </div>

              {items.map(
                (
                  item,
                  index
                ) => (
                  <article
                    key={
                      stringValue(
                        item,
                        "id",
                        String(index)
                      )
                    }
                    className={
                      styles.line
                    }
                  >
                    <div>
                      <strong>
                        {stringValue(
                          item,
                          "name",
                          "Tjänst"
                        )}
                      </strong>

                      {stringValue(
                        item,
                        "description"
                      ) && (
                        <p>
                          {stringValue(
                            item,
                            "description"
                          )}
                        </p>
                      )}

                      {item.is_optional ===
                        true && (
                        <span
                          className={
                            styles.optional
                          }
                        >
                          Valbart tillägg
                        </span>
                      )}
                    </div>

                    <span>
                      {numberValue(
                        item,
                        "quantity"
                      )}{" "}
                      {stringValue(
                        item,
                        "unit_code"
                      )}
                    </span>

                    <span>
                      {formatCurrency(
                        numberValue(
                          item,
                          "unit_price_ex_vat"
                        ),
                        currency
                      )}
                    </span>

                    <strong>
                      {formatCurrency(
                        numberValue(
                          item,
                          "subtotal_ex_vat"
                        ),
                        currency
                      )}
                    </strong>
                  </article>
                )
              )}

              {items.length ===
                0 && (
                <div
                  className={
                    styles.empty
                  }
                >
                  Inga offertrader
                  sparades i denna
                  version.
                </div>
              )}
            </div>
          </section>


          <section
            className={
              styles.card
            }
          >
            <header
              className={
                styles.cardHeader
              }
            >
              <div>
                <span>
                  02
                </span>

                <div>
                  <h2>
                    Kundmeddelande &
                    villkor
                  </h2>

                  <p>
                    Informationen som
                    hörde till denna
                    version.
                  </p>
                </div>
              </div>
            </header>

            <div
              className={
                styles.terms
              }
            >
              <article>
                <Mail
                  size={18}
                />

                <small>
                  MEDDELANDE
                </small>

                <p>
                  {stringValue(
                    offer,
                    "customer_message",
                    "Inget meddelande."
                  )}
                </p>
              </article>

              <article>
                <ReceiptText
                  size={18}
                />

                <small>
                  BETALNINGSVILLKOR
                </small>

                <p>
                  {stringValue(
                    offer,
                    "payment_terms",
                    "Ej angivet."
                  )}
                </p>
              </article>

              <article
                className={
                  styles.full
                }
              >
                <CheckCircle2
                  size={18}
                />

                <small>
                  OFFERTVILLKOR
                </small>

                <p>
                  {stringValue(
                    offer,
                    "terms_text",
                    "Ej angivet."
                  )}
                </p>
              </article>
            </div>
          </section>
        </main>


        <aside
          className={
            styles.sidebar
          }
        >
          <section
            className={
              styles.priceCard
            }
          >
            <small>
              PRISSAMMANSTÄLLNING
            </small>

            <h3>
              Version{" "}
              {parsedVersion}
            </h3>

            <div>
              <span>
                Delsumma
              </span>

              <strong>
                {formatCurrency(
                  numberValue(
                    offer,
                    "subtotal_before_discount"
                  ),
                  currency
                )}
              </strong>
            </div>

            {numberValue(
              offer,
              "discount_amount"
            ) >
              0 && (
              <div>
                <span>
                  {stringValue(
                    offer,
                    "discount_label",
                    "Rabatt"
                  )}
                </span>

                <strong>
                  −{" "}
                  {formatCurrency(
                    numberValue(
                      offer,
                      "discount_amount"
                    ),
                    currency
                  )}
                </strong>
              </div>
            )}

            <div>
              <span>
                Moms
              </span>

              <strong>
                {formatCurrency(
                  numberValue(
                    offer,
                    "vat_amount"
                  ),
                  currency
                )}
              </strong>
            </div>

            <div
              className={
                styles.total
              }
            >
              <span>
                Totalt
              </span>

              <strong>
                {formatCurrency(
                  numberValue(
                    offer,
                    "total_inc_vat"
                  ),
                  currency
                )}
              </strong>
            </div>
          </section>


          <section
            className={
              styles.infoCard
            }
          >
            <LockKeyhole
              size={19}
            />

            <div>
              <small>
                HISTORISK SNAPSHOT
              </small>

              <strong>
                Versionen är
                skrivskyddad
              </strong>

              <p>
                Ändringar som görs
                i den aktuella
                offerten påverkar
                inte denna version.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}