import Link from "next/link";

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Plus,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "@/components/dashboard/projects/detail/ProjectEconomy.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


type Row =
  Record<string, unknown>;


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


function optionalText(
  value: unknown
) {
  const valueAsText =
    textValue(value).trim();

  return valueAsText || null;
}


function numberValue(
  ...values: unknown[]
) {
  for (
    const value
    of values
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const parsed =
      Number(value);

    if (
      Number.isFinite(
        parsed
      )
    ) {
      return parsed;
    }
  }

  return 0;
}


function money(
  value: number
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function dateText(
  value: unknown
) {
  const raw =
    optionalText(value);

  if (!raw) {
    return "Ej angivet";
  }

  const date =
    new Date(
      raw.length === 10
        ? `${raw}T12:00:00`
        : raw
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return raw;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone:
        "Europe/Stockholm",
    }
  ).format(date);
}


function normalizeOfferStatus(
  value: unknown
) {
  const status =
    textValue(value)
      .trim()
      .toLowerCase();

  if (
    [
      "accepted",
      "approved",
      "won",
      "vunnen",
      "godkand",
      "godkänd",
    ].includes(status)
  ) {
    return "accepted";
  }

  if (
    [
      "declined",
      "rejected",
      "lost",
      "avbojd",
      "avböjd",
    ].includes(status)
  ) {
    return "declined";
  }

  if (
    [
      "viewed",
      "opened",
      "öppnad",
      "oppnad",
    ].includes(status)
  ) {
    return "viewed";
  }

  if (
    [
      "answered",
      "replied",
      "responded",
      "besvarad",
    ].includes(status)
  ) {
    return "answered";
  }

  if (
    [
      "sent",
      "delivered",
      "skickad",
    ].includes(status)
  ) {
    return "sent";
  }

  if (
    [
      "expired",
      "utgången",
      "utgangen",
    ].includes(status)
  ) {
    return "expired";
  }

  if (
    [
      "archived",
      "arkiverad",
    ].includes(status)
  ) {
    return "archived";
  }

  return "draft";
}


function normalizeInvoiceStatus(
  row: Row
) {
  const rawStatus =
    textValue(
      row.status,
      "draft"
    )
      .trim()
      .toLowerCase();

  const total =
    numberValue(
      row.total_inc_vat
    );

  const paid =
    numberValue(
      row.amount_paid
    );

  const outstanding =
    Math.max(
      total - paid,
      0
    );

  if (
    [
      "cancelled",
      "canceled",
      "credited",
      "credit",
      "void",
      "makulerad",
    ].includes(
      rawStatus
    )
  ) {
    return "cancelled";
  }

  if (
    total > 0 &&
    outstanding <= 0
  ) {
    return "paid";
  }

  if (
    paid > 0 &&
    outstanding > 0
  ) {
    return "partial";
  }

  const dueDate =
    optionalText(
      row.due_date
    );

  if (
    dueDate &&
    [
      "sent",
      "overdue",
    ].includes(
      rawStatus
    )
  ) {
    const due =
      new Date(
        `${dueDate}T23:59:59`
      );

    if (
      due.getTime() <
      Date.now()
    ) {
      return "overdue";
    }
  }

  if (
    rawStatus ===
    "paid"
  ) {
    return "paid";
  }

  if (
    rawStatus ===
    "sent"
  ) {
    return "sent";
  }

  return "draft";
}


const offerStatusLabels:
Record<string, string> = {
  draft: "Utkast",
  sent: "Skickad",
  viewed: "Öppnad",
  answered: "Besvarad",
  accepted: "Godkänd",
  declined: "Avböjd",
  expired: "Utgången",
  archived: "Arkiverad",
};


const invoiceStatusLabels:
Record<string, string> = {
  draft: "Utkast",
  sent: "Skickad",
  partial: "Delbetald",
  paid: "Betald",
  overdue: "Förfallen",
  cancelled: "Makulerad",
};


export default async function ProjectEconomyPage({
  params,
}: Props) {
  const {
    id,
  } =
    await params;

  const supabase =
    await createClient();


  const [
    projectResult,
    offersResult,
    invoicesResult,
  ] =
    await Promise.all([
      (
        supabase as any
      )
        .from("projects")
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle(),

      (
        supabase as any
      )
        .from("offers")
        .select("*")
        .eq(
          "project_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),

      (
        supabase as any
      )
        .from("invoices")
        .select("*")
        .eq(
          "project_id",
          id
        )
        .order(
          "invoice_date",
          {
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),
    ]);


  if (
    projectResult.error
  ) {
    console.error(
      "Projektet kunde inte hämtas:",
      projectResult.error
    );

    throw new Error(
      projectResult.error.message
    );
  }


  if (
    !projectResult.data
  ) {
    notFound();
  }


  if (
    offersResult.error
  ) {
    console.error(
      "Projektets offerter kunde inte hämtas:",
      offersResult.error
    );
  }


  if (
    invoicesResult.error
  ) {
    console.error(
      "Projektets fakturor kunde inte hämtas:",
      invoicesResult.error
    );
  }


  const project =
    projectResult.data as Row;

  const rawOffers:
    Row[] =
      Array.isArray(
        offersResult.data
      )
        ? offersResult.data
        : [];

  const rawInvoices:
    Row[] =
      Array.isArray(
        invoicesResult.data
      )
        ? invoicesResult.data
        : [];


  const offers =
    rawOffers.map(
      (
        row,
        index
      ) => {
        const subtotal =
          numberValue(
            row.subtotal_ex_vat,
            row.subtotal,
            row.amount_ex_vat,
            row.total_ex_vat
          );

        const vat =
          numberValue(
            row.vat_amount,
            row.tax_amount,
            row.moms_amount
          );

        const storedTotal =
          numberValue(
            row.total_inc_vat,
            row.total_amount,
            row.grand_total,
            row.total
          );

        return {
          id:
            textValue(
              row.id
            ),

          number:
            textValue(
              row.offer_number ??
              row.quote_number ??
              row.number ??
              row.reference,
              `OFFERT-${index + 1}`
            ),

          title:
            textValue(
              row.title ??
              row.subject ??
              row.name,
              "Offert"
            ),

          status:
            normalizeOfferStatus(
              row.status
            ),

          subtotal,

          total:
            storedTotal ||
            subtotal +
              vat,

          validUntil:
            optionalText(
              row.valid_until ??
              row.expires_at ??
              row.expiry_date
            ),

          createdAt:
            optionalText(
              row.created_at
            ),
        };
      }
    );


  const invoices =
    rawInvoices.map(
      (row) => {
        const total =
          numberValue(
            row.total_inc_vat
          );

        const paid =
          numberValue(
            row.amount_paid
          );

        return {
          id:
            textValue(
              row.id
            ),

          number:
            textValue(
              row.invoice_number,
              "Saknar nummer"
            ),

          title:
            textValue(
              row.title,
              "Faktura"
            ),

          status:
            normalizeInvoiceStatus(
              row
            ),

          subtotal:
            numberValue(
              row.subtotal_ex_vat
            ),

          total,

          paid,

          outstanding:
            Math.max(
              total - paid,
              0
            ),

          invoiceDate:
            optionalText(
              row.invoice_date
            ),

          dueDate:
            optionalText(
              row.due_date
            ),
        };
      }
    );


  const activeInvoices =
    invoices.filter(
      (invoice) =>
        invoice.status !==
        "cancelled"
    );


  const acceptedOffers =
    offers.filter(
      (offer) =>
        offer.status ===
        "accepted"
    );


  const budget =
    numberValue(
      project.budget_ex_vat,
      project.budget
    );


  const acceptedOfferValue =
    acceptedOffers.reduce(
      (
        total,
        offer
      ) =>
        total +
        offer.subtotal,
      0
    );


  const invoicedExVat =
    activeInvoices.reduce(
      (
        total,
        invoice
      ) =>
        total +
        invoice.subtotal,
      0
    );


  const invoicedIncVat =
    activeInvoices.reduce(
      (
        total,
        invoice
      ) =>
        total +
        invoice.total,
      0
    );


  const paidIncVat =
    activeInvoices.reduce(
      (
        total,
        invoice
      ) =>
        total +
        invoice.paid,
      0
    );


  const outstandingIncVat =
    activeInvoices.reduce(
      (
        total,
        invoice
      ) =>
        total +
        invoice.outstanding,
      0
    );


  const targetExVat =
    acceptedOfferValue > 0
      ? acceptedOfferValue
      : budget;


  const remainingToInvoice =
    Math.max(
      targetExVat -
      invoicedExVat,
      0
    );


  const invoiceProgress =
    targetExVat > 0
      ? Math.min(
          100,
          Math.round(
            (
              invoicedExVat /
              targetExVat
            ) *
              100
          )
        )
      : 0;


  const paidProgress =
    invoicedIncVat > 0
      ? Math.min(
          100,
          Math.round(
            (
              paidIncVat /
              invoicedIncVat
            ) *
              100
          )
        )
      : 0;


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
            href={`/dashboard/projekt/${id}`}
            className={
              styles.back
            }
          >
            <ArrowLeft
              size={17}
            />

            Till översikt
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            {textValue(
              project.project_number
            )}
          </span>

          <h1>
            Ekonomi
          </h1>

          <p>
            Projektets budget,
            offerter, fakturering
            och betalningar för{" "}
            <strong>
              {textValue(
                project.title
              )}
            </strong>.
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Link
            href="/dashboard/offerter/ny"
            className={
              styles.secondaryButton
            }
          >
            <FileText
              size={17}
            />

            Ny offert
          </Link>

          <Link
            href="/dashboard/fakturor/ny"
            className={
              styles.primaryButton
            }
          >
            <Plus
              size={17}
            />

            Ny faktura
          </Link>
        </div>
      </header>


      <ProjectWorkspaceTabs
        projectId={id}
      />


      <section
        className={
          styles.kpis
        }
      >
        <article>
          <span
            className={
              styles.kpiIcon
            }
          >
            <CircleDollarSign
              size={20}
            />
          </span>

          <div>
            <small>
              Budget
            </small>

            <strong>
              {money(
                budget
              )}
            </strong>

            <p>
              Exkl. moms
            </p>
          </div>
        </article>

        <article>
          <span
            className={
              styles.kpiIcon
            }
          >
            <CheckCircle2
              size={20}
            />
          </span>

          <div>
            <small>
              Godkända offerter
            </small>

            <strong>
              {money(
                acceptedOfferValue
              )}
            </strong>

            <p>
              Exkl. moms
            </p>
          </div>
        </article>

        <article>
          <span
            className={
              styles.kpiIcon
            }
          >
            <ReceiptText
              size={20}
            />
          </span>

          <div>
            <small>
              Fakturerat
            </small>

            <strong>
              {money(
                invoicedExVat
              )}
            </strong>

            <p>
              Exkl. moms
            </p>
          </div>
        </article>

        <article>
          <span
            className={
              styles.kpiIcon
            }
          >
            <WalletCards
              size={20}
            />
          </span>

          <div>
            <small>
              Betalt
            </small>

            <strong>
              {money(
                paidIncVat
              )}
            </strong>

            <p>
              Inkl. moms
            </p>
          </div>
        </article>

        <article>
          <span
            className={
              styles.remainingIcon
            }
          >
            <TrendingUp
              size={20}
            />
          </span>

          <div>
            <small>
              Kvar att fakturera
            </small>

            <strong>
              {money(
                remainingToInvoice
              )}
            </strong>

            <p>
              {acceptedOfferValue > 0
                ? "Mot godkänd offert"
                : "Mot projektbudget"}
            </p>
          </div>
        </article>
      </section>


      <section
        className={
          styles.progressCard
        }
      >
        <div
          className={
            styles.progressHeader
          }
        >
          <div>
            <span>
              Projektets fakturering
            </span>

            <strong>
              {invoiceProgress}%
            </strong>
          </div>

          <p>
            {money(
              invoicedExVat
            )}{" "}
            av{" "}
            {money(
              targetExVat
            )}{" "}
            exkl. moms
          </p>
        </div>

        <div
          className={
            styles.progressTrack
          }
        >
          <span
            style={{
              width:
                `${invoiceProgress}%`,
            }}
          />
        </div>

        <div
          className={
            styles.paymentRow
          }
        >
          <div>
            <Banknote
              size={17}
            />

            <span>
              Betalningsgrad
            </span>

            <strong>
              {paidProgress}%
            </strong>
          </div>

          <div>
            <Clock3
              size={17}
            />

            <span>
              Utestående
            </span>

            <strong>
              {money(
                outstandingIncVat
              )}
            </strong>
          </div>
        </div>
      </section>


      <div
        className={
          styles.contentGrid
        }
      >
        <section
          className={
            styles.panel
          }
        >
          <header
            className={
              styles.panelHeader
            }
          >
            <div>
              <FileText
                size={21}
              />

              <div>
                <h2>
                  Offerter
                </h2>

                <p>
                  Offerter kopplade
                  till projektet.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/offerter"
            >
              Alla offerter
            </Link>
          </header>

          {offers.length === 0 ? (
            <div
              className={
                styles.empty
              }
            >
              <FileText
                size={25}
              />

              <strong>
                Inga offerter kopplade
              </strong>

              <p>
                Skapa en offert och
                koppla den till projektet.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.rows
              }
            >
              {offers.map(
                (
                  offer
                ) => (
                  <article
                    key={
                      offer.id
                    }
                    className={
                      styles.row
                    }
                  >
                    <div
                      className={
                        styles.rowMain
                      }
                    >
                      <strong>
                        {
                          offer.number
                        }
                      </strong>

                      <span>
                        {
                          offer.title
                        }
                      </span>
                    </div>

                    <span
                      className={`${styles.status} ${
                        styles[
                          `status_${offer.status}`
                        ]
                      }`}
                    >
                      {
                        offerStatusLabels[
                          offer.status
                        ]
                      }
                    </span>

                    <div
                      className={
                        styles.rowDate
                      }
                    >
                      <small>
                        Giltig till
                      </small>

                      <span>
                        {dateText(
                          offer.validUntil
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        styles.rowAmount
                      }
                    >
                      <strong>
                        {money(
                          offer.subtotal
                        )}
                      </strong>

                      <span>
                        exkl. moms
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>


        <section
          className={
            styles.panel
          }
        >
          <header
            className={
              styles.panelHeader
            }
          >
            <div>
              <ReceiptText
                size={21}
              />

              <div>
                <h2>
                  Fakturor
                </h2>

                <p>
                  Fakturering och
                  betalningsstatus.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/fakturor"
            >
              Alla fakturor
            </Link>
          </header>

          {invoices.length === 0 ? (
            <div
              className={
                styles.empty
              }
            >
              <ReceiptText
                size={25}
              />

              <strong>
                Inga fakturor ännu
              </strong>

              <p>
                Projektet har ännu
                inte fakturerats.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.rows
              }
            >
              {invoices.map(
                (
                  invoice
                ) => (
                  <article
                    key={
                      invoice.id
                    }
                    className={
                      styles.invoiceRow
                    }
                  >
                    <div
                      className={
                        styles.rowMain
                      }
                    >
                      <strong>
                        {
                          invoice.number
                        }
                      </strong>

                      <span>
                        {
                          invoice.title
                        }
                      </span>
                    </div>

                    <span
                      className={`${styles.status} ${
                        styles[
                          `invoice_${invoice.status}`
                        ]
                      }`}
                    >
                      {
                        invoiceStatusLabels[
                          invoice.status
                        ]
                      }
                    </span>

                    <div
                      className={
                        styles.rowDate
                      }
                    >
                      <small>
                        Förfallodatum
                      </small>

                      <span>
                        {dateText(
                          invoice.dueDate
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        styles.invoiceAmounts
                      }
                    >
                      <div>
                        <small>
                          Faktura
                        </small>

                        <strong>
                          {money(
                            invoice.total
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Betalt
                        </small>

                        <strong
                          className={
                            styles.paid
                          }
                        >
                          {money(
                            invoice.paid
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Kvar
                        </small>

                        <strong
                          className={
                            invoice.outstanding >
                            0
                              ? styles.outstanding
                              : ""
                          }
                        >
                          {money(
                            invoice.outstanding
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}