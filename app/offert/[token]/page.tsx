import {
  notFound,
} from "next/navigation";

import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  LockKeyhole,
  ReceiptText,
} from "lucide-react";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import OfferResponsePanel from "./OfferResponsePanel";

import styles from "./page.module.css";


export const dynamic =
  "force-dynamic";


type PageProps = {
  params: Promise<{
    token: string;
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


function text(
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


function number(
  row: UnknownRow,
  key: string
) {
  const parsed =
    Number(
      row[key]
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}


function money(
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


function date(
  value: string
) {
  if (!value) {
    return "Ej angivet";
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
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
  ).format(parsed);
}


export default async function PublicOfferPage({
  params,
}: PageProps) {

  const {
    token,
  } =
    await params;


  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


  if (
    !uuid.test(token)
  ) {
    notFound();
  }


  const supabase =
    createAdminClient();


  const {
    data: offerData,
  } =
    await supabase
      .from("offers")
      .select(
        "id, viewed_at, status, accepted_at, rejected_at"
      )
      .eq(
        "public_token",
        token
      )
      .maybeSingle();


  if (!offerData) {
    notFound();
  }


  const {
    data: versionData,
  } =
    await supabase
      .from(
        "offer_versions"
      )
      .select(
        "version_number, snapshot, sent_at, created_at"
      )
      .eq(
        "offer_id",
        offerData.id
      )
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (!versionData) {
    notFound();
  }


  /*
   * Visa ALLTID den senaste
   * skickade, låsta versionen.
   *
   * Kunden ska aldrig råka se
   * ett nytt oskickat utkast.
   */

  const snapshot =
    asObject(
      versionData.snapshot
    );

  const offer =
    asObject(
      snapshot.offer
    );

  const customer =
    asObject(
      snapshot.customer
    );

  const items =
    asArray(
      snapshot.items
    )
      .map(
        asObject
      )
      .filter(
        (
          item
        ) =>
          item.customer_visible !==
          false
      );


  const required =
    items.filter(
      (
        item
      ) =>
        item.is_optional !==
        true
    );

  const optional =
    items.filter(
      (
        item
      ) =>
        item.is_optional ===
        true
    );


  if (
    !offerData.viewed_at
  ) {
    const now =
      new Date()
        .toISOString();

    await supabase
      .from("offers")
      .update({
        viewed_at:
          now,

        status:
          offerData.status === "sent"
            ? "viewed"
            : offerData.status,
      })
      .eq(
        "id",
        offerData.id
      )
      .is(
        "viewed_at",
        null
      );


    await supabase
      .from(
        "offer_events"
      )
      .insert({
        offer_id:
          offerData.id,

        event_type:
          "offer_viewed",

        event_title:
          "Offert öppnad",

        description:
          "Kunden öppnade den digitala offerten.",

        metadata: {
          version_number:
            versionData
              .version_number,
        },

        actor_id:
          null,
      });
  }


  const currency =
    text(
      offer,
      "currency",
      "SEK"
    );


  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.shell
        }
      >
        <header
          className={
            styles.brand
          }
        >
          <div>
            VORIX
          </div>

          <span>
            Digital products.
            Built to last.
          </span>
        </header>


        <section
          className={
            styles.hero
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              OFFERT ·{" "}
              {text(
                offer,
                "offer_number"
              )}
            </span>

            <h1>
              {text(
                offer,
                "title",
                "Offertförslag"
              )}
            </h1>

            {text(
              offer,
              "description"
            ) && (
              <p>
                {text(
                  offer,
                  "description"
                )}
              </p>
            )}
          </div>


          <div
            className={
              styles.totalHero
            }
          >
            <small>
              TOTALT
            </small>

            <strong>
              {money(
                number(
                  offer,
                  "total_inc_vat"
                ),
                currency
              )}
            </strong>

            <span>
              inkl. moms
            </span>
          </div>
        </section>


        <section
          className={
            styles.info
          }
        >
          <article>
            <FileText
              size={18}
            />

            <div>
              <small>
                KUND
              </small>

              <strong>
                {text(
                  customer,
                  "name",
                  "Kund"
                )}
              </strong>
            </div>
          </article>


          <article>
            <CalendarDays
              size={18}
            />

            <div>
              <small>
                GILTIG TILL
              </small>

              <strong>
                {date(
                  text(
                    offer,
                    "valid_until"
                  )
                )}
              </strong>
            </div>
          </article>


          <article>
            <LockKeyhole
              size={18}
            />

            <div>
              <small>
                VERSION
              </small>

              <strong>
                Version{" "}
                {
                  versionData
                    .version_number
                }
              </strong>
            </div>
          </article>
        </section>


        <section
          className={
            styles.pdfDownload
          }
        >
          <div>
            <Download
              size={18}
            />

            <div>
              <strong>
                Vill du spara offerten?
              </strong>

              <span>
                Ladda ner exakt den skickade versionen som A4-PDF.
              </span>
            </div>
          </div>

          <a
            href={`/offert/${token}/pdf`}
          >
            <Download
              size={15}
            />

            Ladda ner offert som PDF
          </a>
        </section>


        {text(
          offer,
          "customer_message"
        ) && (
          <section
            className={
              styles.message
            }
          >
            <small>
              MEDDELANDE FRÅN
              VORIX
            </small>

            <p>
              {text(
                offer,
                "customer_message"
              )}
            </p>
          </section>
        )}


        <section
          className={
            styles.card
          }
        >
          <header>
            <span>
              01
            </span>

            <div>
              <h2>
                Tjänster &
                omfattning
              </h2>

              <p>
                Det som ingår i
                grundofferten.
              </p>
            </div>
          </header>


          <div
            className={
              styles.rows
            }
          >
            {required.map(
              (
                item,
                index
              ) => (
                <article
                  key={
                    text(
                      item,
                      "id",
                      String(index)
                    )
                  }
                >
                  <div>
                    <strong>
                      {text(
                        item,
                        "name",
                        "Tjänst"
                      )}
                    </strong>

                    {text(
                      item,
                      "description"
                    ) && (
                      <p>
                        {text(
                          item,
                          "description"
                        )}
                      </p>
                    )}
                  </div>

                  <span>
                    {number(
                      item,
                      "quantity"
                    )}{" "}
                    {text(
                      item,
                      "unit_code"
                    )}
                  </span>

                  <strong>
                    {money(
                      number(
                        item,
                        "subtotal_ex_vat"
                      ),
                      currency
                    )}
                  </strong>
                </article>
              )
            )}
          </div>
        </section>


        {optional.length >
          0 && (
          <section
            className={
              styles.card
            }
          >
            <header>
              <span>
                02
              </span>

              <div>
                <h2>
                  Valbara tillägg
                </h2>

                <p>
                  Dessa ingår inte
                  i grundpriset.
                </p>
              </div>
            </header>

            <div
              className={
                styles.optional
              }
            >
              {optional.map(
                (
                  item,
                  index
                ) => (
                  <article
                    key={
                      text(
                        item,
                        "id",
                        String(index)
                      )
                    }
                  >
                    <div>
                      <strong>
                        {text(
                          item,
                          "name",
                          "Tillägg"
                        )}
                      </strong>

                      {text(
                        item,
                        "description"
                      ) && (
                        <p>
                          {text(
                            item,
                            "description"
                          )}
                        </p>
                      )}
                    </div>

                    <strong>
                      +{" "}
                      {money(
                        number(
                          item,
                          "subtotal_ex_vat"
                        ),
                        currency
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
            styles.bottom
          }
        >
          <div
            className={
              styles.terms
            }
          >
            <article>
              <ReceiptText
                size={18}
              />

              <small>
                BETALNINGSVILLKOR
              </small>

              <p>
                {text(
                  offer,
                  "payment_terms",
                  "Enligt överenskommelse."
                )}
              </p>
            </article>

            <article>
              <CheckCircle2
                size={18}
              />

              <small>
                OFFERTVILLKOR
              </small>

              <p>
                {text(
                  offer,
                  "terms_text",
                  "Enligt offert."
                )}
              </p>
            </article>
          </div>


          <aside
            className={
              styles.price
            }
          >
            <div>
              <span>
                Delsumma
              </span>

              <strong>
                {money(
                  number(
                    offer,
                    "subtotal_before_discount"
                  ),
                  currency
                )}
              </strong>
            </div>


            {number(
              offer,
              "discount_amount"
            ) >
              0 && (
              <div>
                <span>
                  {text(
                    offer,
                    "discount_label",
                    "Rabatt"
                  )}
                </span>

                <strong>
                  −{" "}
                  {money(
                    number(
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
                {money(
                  number(
                    offer,
                    "vat_amount"
                  ),
                  currency
                )}
              </strong>
            </div>


            <div
              className={
                styles.grandTotal
              }
            >
              <span>
                Totalt att
                acceptera
              </span>

              <strong>
                {money(
                  number(
                    offer,
                    "total_inc_vat"
                  ),
                  currency
                )}
              </strong>
            </div>
          </aside>
        </section>


        <OfferResponsePanel
          token={
            token
          }
          offerNumber={
            text(
              offer,
              "offer_number",
              "Offert"
            )
          }
          currency={
            currency
          }
          baseTotalIncVat={
            number(
              offer,
              "total_inc_vat"
            )
          }
          currentStatus={
            String(
              offerData.status ??
              "sent"
            )
          }
          optionalItems={
            optional
              .map(
                (
                  item
                ) => ({
                  id:
                    text(
                      item,
                      "id"
                    ),

                  name:
                    text(
                      item,
                      "name",
                      "Tillägg"
                    ),

                  description:
                    text(
                      item,
                      "description"
                    ),

                  totalIncVat:
                    number(
                      item,
                      "total_inc_vat"
                    ),
                })
              )
              .filter(
                (
                  item
                ) =>
                  Boolean(
                    item.id
                  )
              )
          }
        />


        <footer
          className={
            styles.footer
          }
        >
          <strong>
            VORIX
          </strong>

          <span>
            Offerten är en låst
            digital kopia av den
            version som skickats.
          </span>
        </footer>
      </div>
    </main>
  );
}