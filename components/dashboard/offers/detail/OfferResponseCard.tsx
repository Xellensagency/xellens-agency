import Link from "next/link";

import {
  CheckCircle2,
  CircleX,
  MessageSquareText,
  PenLine,
  UserRound,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import CreateProjectFromOfferButton from "./CreateProjectFromOfferButton";

import styles from "./OfferResponseCard.module.css";


type OfferResponseCardProps = {
  offerId: string;
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
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}


function textValue(
  value: unknown,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}


function numberValue(
  value: unknown
) {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
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
    return "Datum saknas";
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


export default async function OfferResponseCard({
  offerId,
}: OfferResponseCardProps) {

  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "offer_responses"
      )
      .select(
        [
          "id",
          "offer_id",
          "version_number",
          "response_type",
          "customer_name",
          "comment",
          "selected_optional_items",
          "base_total_inc_vat",
          "selected_optional_total_inc_vat",
          "accepted_total_inc_vat",
          "currency",
          "created_at",
        ].join(",")
      )
      .eq(
        "offer_id",
        offerId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (error) {
    console.error(
      "Kundens offertsvar kunde inte hämtas:",
      error
    );

    return null;
  }


  if (!data) {
    return null;
  }


  const response =
    data as UnknownRow;


  const responseType =
    textValue(
      response.response_type
    );


  const customerName =
    textValue(
      response.customer_name,
      "Kund"
    );


  const comment =
    textValue(
      response.comment
    );


  const currency =
    textValue(
      response.currency,
      "SEK"
    );


  const versionNumber =
    numberValue(
      response.version_number
    );


  const baseTotal =
    numberValue(
      response.base_total_inc_vat
    );


  const optionalTotal =
    numberValue(
      response.selected_optional_total_inc_vat
    );


  const acceptedTotal =
    numberValue(
      response.accepted_total_inc_vat
    );


  const optionalItems =
    asArray(
      response.selected_optional_items
    )
      .map(
        asObject
      );


  const isAccepted =
    responseType ===
    "accepted";


  const isRejected =
    responseType ===
    "rejected";


  const isChangesRequested =
    responseType ===
    "changes_requested";


  return (
    <section
      className={`${styles.card} ${
        isAccepted
          ? styles.accepted
          : isRejected
            ? styles.rejected
            : styles.changes
      }`}
    >
      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.icon
          }
        >
          {isAccepted ? (
            <CheckCircle2
              size={19}
            />
          ) : isRejected ? (
            <CircleX
              size={19}
            />
          ) : (
            <MessageSquareText
              size={19}
            />
          )}
        </div>

        <div
          className={
            styles.heading
          }
        >
          <small>
            KUNDENS SVAR
          </small>

          <h3>
            {isAccepted
              ? "Offerten accepterad"
              : isRejected
                ? "Offerten avböjd"
                : "Ändring begärd"}
          </h3>

          <p>
            Version{" "}
            {versionNumber ||
              "–"}
            {" · "}
            {formatDateTime(
              response.created_at
                ? String(
                    response.created_at
                  )
                : null
            )}
          </p>
        </div>
      </header>


      <div
        className={
          styles.customer
        }
      >
        <UserRound
          size={16}
        />

        <div>
          <small>
            SVAR FRÅN
          </small>

          <strong>
            {customerName}
          </strong>
        </div>
      </div>


      {comment && (
        <div
          className={
            styles.comment
          }
        >
          <small>
            {isChangesRequested
              ? "ÖNSKADE ÄNDRINGAR"
              : "KOMMENTAR"}
          </small>

          <p>
            {comment}
          </p>
        </div>
      )}


      {isAccepted && (
        <>
          <div
            className={
              styles.priceSummary
            }
          >
            <div>
              <span>
                Grundoffert
              </span>

              <strong>
                {formatCurrency(
                  baseTotal,
                  currency
                )}
              </strong>
            </div>

            {optionalTotal >
              0 && (
              <div>
                <span>
                  Valda tillägg
                </span>

                <strong>
                  +{" "}
                  {formatCurrency(
                    optionalTotal,
                    currency
                  )}
                </strong>
              </div>
            )}

            <div
              className={
                styles.total
              }
            >
              <span>
                Accepterat totalt
              </span>

              <strong>
                {formatCurrency(
                  acceptedTotal,
                  currency
                )}
              </strong>
            </div>
          </div>


          {optionalItems.length >
            0 && (
            <div
              className={
                styles.selectedOptions
              }
            >
              <small>
                VALDA TILLÄGG
              </small>

              <div>
                {optionalItems.map(
                  (
                    item,
                    index
                  ) => (
                    <article
                      key={
                        textValue(
                          item.id,
                          String(index)
                        )
                      }
                    >
                      <CheckCircle2
                        size={13}
                      />

                      <span>
                        {textValue(
                          item.name,
                          "Tillägg"
                        )}
                      </span>

                      <strong>
                        {formatCurrency(
                          numberValue(
                            item.total_inc_vat
                          ),
                          currency
                        )}
                      </strong>
                    </article>
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}


      {isChangesRequested && (
        <div
          className={
            styles.actionArea
          }
        >
          <div>
            <PenLine
              size={16}
            />

            <p>
              Redigera den aktuella
              offerten. När du skickar
              den igen skapas nästa
              låsta version automatiskt.
            </p>
          </div>

          <Link
            href={`/dashboard/offerter/${offerId}/redigera`}
            className={
              styles.primaryAction
            }
          >
            <PenLine
              size={15}
            />

            Redigera & skicka ny version
          </Link>
        </div>
      )}


      {isAccepted && (
        <div
          className={
            styles.nextStep
          }
        >
          <CheckCircle2
            size={16}
          />

          <div
            className={
              styles.nextStepContent
            }
          >
            <strong>
              Redo för projekt
            </strong>

            <p>
              Kund, accepterad omfattning,
              priser och valda tillägg förs
              över till ett nytt projekt.
            </p>

            <CreateProjectFromOfferButton
              offerId={
                offerId
              }
            />
          </div>
        </div>
      )}


      {isRejected && (
        <div
          className={
            styles.nextStep
          }
        >
          <CircleX
            size={16}
          />

          <div>
            <strong>
              Ärendet är avslutat
            </strong>

            <p>
              Kunden har avböjt
              denna offertversion.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}