"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleX,
  LoaderCircle,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  submitOfferResponse,
  type OfferResponseType,
} from "./actions";

import styles from "./OfferResponsePanel.module.css";


type OptionalItem = {
  id: string;

  name: string;

  description: string;

  totalIncVat: number;
};


type OfferResponsePanelProps = {
  token: string;

  offerNumber: string;

  currency: string;

  baseTotalIncVat: number;

  currentStatus: string;

  optionalItems:
    OptionalItem[];
};


type Feedback = {
  type:
    | "success"
    | "error";

  message: string;

  acceptedTotalIncVat?:
    number;
};


const finishedStatuses = [
  "accepted",
  "rejected",
  "changes_requested",
];


function statusText(
  status: string
) {
  switch (status) {
    case "accepted":
      return {
        title:
          "Offerten är accepterad",

        text:
          "Tack! Vorix har tagit emot ditt godkännande.",

        icon:
          "accepted",
      };

    case "rejected":
      return {
        title:
          "Offerten är avböjd",

        text:
          "Ditt svar har registrerats och Vorix har informerats.",

        icon:
          "rejected",
      };

    case "changes_requested":
      return {
        title:
          "Ändring har begärts",

        text:
          "Vorix har fått dina önskemål och kan nu ta fram en ny version.",

        icon:
          "changes",
      };

    default:
      return null;
  }
}


export default function OfferResponsePanel({
  token,
  offerNumber,
  currency,
  baseTotalIncVat,
  currentStatus,
  optionalItems,
}: OfferResponsePanelProps) {

  const [
    mode,
    setMode,
  ] =
    useState<
      OfferResponseType | null
    >(null);


  const [
    customerName,
    setCustomerName,
  ] =
    useState("");


  const [
    comment,
    setComment,
  ] =
    useState("");


  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<string[]>(
      []
    );


  const [
    acceptedConfirmed,
    setAcceptedConfirmed,
  ] =
    useState(false);


  const [
    feedback,
    setFeedback,
  ] =
    useState<Feedback | null>(
      null
    );


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const formatter =
    useMemo(
      () =>
        new Intl.NumberFormat(
          "sv-SE",
          {
            style:
              "currency",

            currency:
              currency ||
              "SEK",

            maximumFractionDigits:
              0,
          }
        ),
      [
        currency,
      ]
    );


  const selectedOptionalTotal =
    optionalItems
      .filter(
        (
          item
        ) =>
          selectedIds.includes(
            item.id
          )
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.totalIncVat,
        0
      );


  const acceptanceTotal =
    baseTotalIncVat +
    selectedOptionalTotal;


  const existingStatus =
    statusText(
      currentStatus
    );


  function toggleOptional(
    id: string
  ) {
    setSelectedIds(
      (
        current
      ) =>
        current.includes(
          id
        )
          ? current.filter(
              (
                item
              ) =>
                item !== id
            )
          : [
              ...current,
              id,
            ]
    );
  }


  function chooseMode(
    next:
      OfferResponseType
  ) {
    setMode(next);
    setFeedback(null);

    if (
      next !==
      "accepted"
    ) {
      setAcceptedConfirmed(
        false
      );
    }
  }


  function submit() {

    if (
      customerName
        .trim()
        .length <
      2
    ) {
      setFeedback({
        type:
          "error",

        message:
          "Fyll i ditt namn innan du skickar svaret.",
      });

      return;
    }


    if (
      mode ===
        "changes_requested" &&
      comment
        .trim()
        .length <
        2
    ) {
      setFeedback({
        type:
          "error",

        message:
          "Beskriv vad du vill ändra i offerten.",
      });

      return;
    }


    if (
      mode ===
        "accepted" &&
      !acceptedConfirmed
    ) {
      setFeedback({
        type:
          "error",

        message:
          "Bekräfta att du har läst offerten och vill acceptera den.",
      });

      return;
    }


    if (!mode) {
      return;
    }


    setFeedback(null);


    startTransition(
      () => {
        void (
          async () => {

            const result =
              await submitOfferResponse({
                token,

                responseType:
                  mode,

                customerName,

                comment,

                selectedOptionalItemIds:
                  mode ===
                    "accepted"
                    ? selectedIds
                    : [],
              });


            if (
              !result.ok
            ) {
              setFeedback({
                type:
                  "error",

                message:
                  result.error ||
                  "Svaret kunde inte skickas.",
              });

              return;
            }


            setFeedback({
              type:
                "success",

              message:
                result.message ||
                "Ditt svar är registrerat.",

              acceptedTotalIncVat:
                result.acceptedTotalIncVat,
            });

          }
        )();
      }
    );
  }


  if (
    existingStatus &&
    !feedback
  ) {
    return (
      <section
        className={
          styles.finished
        }
      >
        <div
          className={
            styles.finishedIcon
          }
        >
          {existingStatus.icon ===
          "accepted" ? (
            <CheckCircle2
              size={24}
            />
          ) : existingStatus.icon ===
            "changes" ? (
            <MessageSquareText
              size={24}
            />
          ) : (
            <CircleX
              size={24}
            />
          )}
        </div>

        <div>
          <span>
            OFFERTSVAR
          </span>

          <h2>
            {
              existingStatus.title
            }
          </h2>

          <p>
            {
              existingStatus.text
            }
          </p>
        </div>
      </section>
    );
  }


  if (
    feedback?.type ===
    "success"
  ) {
    return (
      <section
        className={
          styles.success
        }
      >
        <CheckCircle2
          size={30}
        />

        <span>
          SVARET ÄR REGISTRERAT
        </span>

        <h2>
          Tack för ditt svar
        </h2>

        <p>
          {
            feedback.message
          }
        </p>

        {mode ===
          "accepted" &&
          typeof feedback
            .acceptedTotalIncVat ===
            "number" && (
          <div
            className={
              styles.acceptedTotal
            }
          >
            <small>
              ACCEPTERAT TOTALBELOPP
            </small>

            <strong>
              {formatter.format(
                feedback
                  .acceptedTotalIncVat
              )}
            </strong>
          </div>
        )}
      </section>
    );
  }


  return (
    <section
      className={
        styles.section
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.number
          }
        >
          03
        </div>

        <div>
          <span>
            DITT SVAR
          </span>

          <h2>
            Hur vill du gå vidare?
          </h2>

          <p>
            Granska offerten och välj
            vad du vill göra.
          </p>
        </div>
      </header>


      {!mode ? (
        <div
          className={
            styles.actions
          }
        >
          <button
            type="button"
            className={
              styles.acceptAction
            }
            onClick={
              () =>
                chooseMode(
                  "accepted"
                )
            }
          >
            <span>
              <CheckCircle2
                size={21}
              />
            </span>

            <div>
              <strong>
                Acceptera offerten
              </strong>

              <small>
                Godkänn offertens
                omfattning och pris.
              </small>
            </div>
          </button>


          <button
            type="button"
            className={
              styles.changeAction
            }
            onClick={
              () =>
                chooseMode(
                  "changes_requested"
                )
            }
          >
            <span>
              <PenLine
                size={21}
              />
            </span>

            <div>
              <strong>
                Begär ändring
              </strong>

              <small>
                Skicka önskemål innan
                du accepterar.
              </small>
            </div>
          </button>


          <button
            type="button"
            className={
              styles.rejectAction
            }
            onClick={
              () =>
                chooseMode(
                  "rejected"
                )
            }
          >
            <span>
              <CircleX
                size={21}
              />
            </span>

            <div>
              <strong>
                Avböj offerten
              </strong>

              <small>
                Meddela Vorix att du
                inte går vidare.
              </small>
            </div>
          </button>
        </div>
      ) : (
        <div
          className={
            styles.form
          }
        >
          <button
            type="button"
            className={
              styles.back
            }
            onClick={
              () =>
                setMode(
                  null
                )
            }
            disabled={
              isPending
            }
          >
            <ChevronLeft
              size={15}
            />

            Byt val
          </button>


          <div
            className={
              styles.formTitle
            }
          >
            {mode ===
            "accepted" ? (
              <CheckCircle2
                size={22}
              />
            ) : mode ===
              "changes_requested" ? (
              <PenLine
                size={22}
              />
            ) : (
              <CircleX
                size={22}
              />
            )}

            <div>
              <span>
                {mode ===
                "accepted"
                  ? "ACCEPTERA"
                  : mode ===
                      "changes_requested"
                    ? "BEGÄR ÄNDRING"
                    : "AVBÖJ"}
              </span>

              <h3>
                {mode ===
                "accepted"
                  ? `Godkänn ${offerNumber}`
                  : mode ===
                      "changes_requested"
                    ? "Vad vill du ändra?"
                    : "Bekräfta att du vill avböja"}
              </h3>
            </div>
          </div>


          <label
            className={
              styles.field
            }
          >
            <span>
              Ditt namn
              <em>
                *
              </em>
            </span>

            <input
              type="text"
              value={
                customerName
              }
              maxLength={
                150
              }
              placeholder="För- och efternamn"
              onChange={
                (
                  event
                ) =>
                  setCustomerName(
                    event.target
                      .value
                  )
              }
            />
          </label>


          {mode ===
            "accepted" &&
            optionalItems.length >
              0 && (
            <div
              className={
                styles.options
              }
            >
              <div
                className={
                  styles.optionsHeader
                }
              >
                <div>
                  <Sparkles
                    size={18}
                  />

                  <div>
                    <strong>
                      Valbara tillägg
                    </strong>

                    <small>
                      Lägg till det du
                      vill beställa.
                    </small>
                  </div>
                </div>

                <span>
                  Frivilligt
                </span>
              </div>


              <div
                className={
                  styles.optionList
                }
              >
                {optionalItems.map(
                  (
                    item
                  ) => {
                    const active =
                      selectedIds.includes(
                        item.id
                      );

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        className={`${styles.option} ${
                          active
                            ? styles.optionActive
                            : ""
                        }`}
                        onClick={
                          () =>
                            toggleOptional(
                              item.id
                            )
                        }
                      >
                        <span
                          className={
                            styles.checkbox
                          }
                        >
                          {active && (
                            <Check
                              size={13}
                            />
                          )}
                        </span>

                        <div>
                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          {item.description && (
                            <small>
                              {
                                item.description
                              }
                            </small>
                          )}
                        </div>

                        <b>
                          +{" "}
                          {formatter.format(
                            item.totalIncVat
                          )}
                        </b>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}


          <label
            className={
              styles.field
            }
          >
            <span>
              {mode ===
              "changes_requested"
                ? "Vad vill du ändra? *"
                : mode ===
                    "rejected"
                  ? "Kommentar"
                  : "Kommentar till Vorix"}

            </span>

            <textarea
              value={
                comment
              }
              maxLength={
                5000
              }
              rows={5}
              placeholder={
                mode ===
                  "changes_requested"
                  ? "Beskriv vilka ändringar du önskar..."
                  : mode ===
                      "rejected"
                    ? "Berätta gärna varför du avböjer..."
                    : "Valfri kommentar..."
              }
              onChange={
                (
                  event
                ) =>
                  setComment(
                    event.target
                      .value
                  )
              }
            />
          </label>


          {mode ===
            "accepted" && (
            <>
              <div
                className={
                  styles.totalBox
                }
              >
                <div>
                  <span>
                    Grundoffert
                  </span>

                  <strong>
                    {formatter.format(
                      baseTotalIncVat
                    )}
                  </strong>
                </div>

                {selectedOptionalTotal >
                  0 && (
                  <div>
                    <span>
                      Valda tillägg
                    </span>

                    <strong>
                      +{" "}
                      {formatter.format(
                        selectedOptionalTotal
                      )}
                    </strong>
                  </div>
                )}

                <div
                  className={
                    styles.finalTotal
                  }
                >
                  <span>
                    Totalt att
                    acceptera
                  </span>

                  <strong>
                    {formatter.format(
                      acceptanceTotal
                    )}
                  </strong>
                </div>
              </div>


              <label
                className={
                  styles.confirm
                }
              >
                <input
                  type="checkbox"
                  checked={
                    acceptedConfirmed
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setAcceptedConfirmed(
                        event.target
                          .checked
                      )
                  }
                />

                <span
                  className={
                    styles.confirmBox
                  }
                >
                  {acceptedConfirmed && (
                    <Check
                      size={13}
                    />
                  )}
                </span>

                <p>
                  Jag bekräftar att jag
                  har läst offertens
                  omfattning, priser och
                  villkor och vill
                  acceptera denna
                  offertversion.
                </p>
              </label>
            </>
          )}


          {feedback?.type ===
            "error" && (
            <div
              className={
                styles.error
              }
            >
              <TriangleAlert
                size={17}
              />

              <span>
                {
                  feedback.message
                }
              </span>
            </div>
          )}


          <button
            type="button"
            className={
              mode ===
                "accepted"
                ? styles.submitAccept
                : mode ===
                    "changes_requested"
                  ? styles.submitChange
                  : styles.submitReject
            }
            onClick={
              submit
            }
            disabled={
              isPending
            }
          >
            {isPending ? (
              <>
                <LoaderCircle
                  size={18}
                  className={
                    styles.spinner
                  }
                />

                Skickar...
              </>
            ) : mode ===
              "accepted" ? (
              <>
                <ShieldCheck
                  size={18}
                />

                Acceptera offerten
              </>
            ) : mode ===
              "changes_requested" ? (
              <>
                <MessageSquareText
                  size={18}
                />

                Skicka ändringsbegäran
              </>
            ) : (
              <>
                <CircleX
                  size={18}
                />

                Avböj offerten
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}