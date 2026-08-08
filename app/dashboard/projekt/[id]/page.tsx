import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Eye,
  Gauge,
  UserRound,
} from "lucide-react";

import DeleteProjectButton from "@/components/dashboard/projects/detail/DeleteProjectButton";
import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "@/components/dashboard/projects/detail/ProjectDetail.module.css";

export const dynamic =
  "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type UnknownRow =
  Record<string, unknown>;

const statusLabels:
Record<string, string> = {
  planning: "Planering",
  ongoing: "Pågående",
  waiting_customer:
    "Väntar på kund",
  production:
    "I produktion",
  paused: "Pausad",
  completed: "Klar",
  cancelled: "Avbruten",
  archived: "Arkiverad",
};

const priorityLabels:
Record<string, string> = {
  low: "Låg",
  normal: "Normal",
  high: "Hög",
  urgent: "Brådskande",
};

const visibilityLabels:
Record<string, string> = {
  hidden:
    "Dold för kunden",
  immediate:
    "Synlig direkt",
  after_approval:
    "Synlig efter godkännande",
};

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
  const cleaned =
    textValue(value).trim();

  return cleaned || null;
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

function dateValue(
  value: unknown
) {
  const text =
    optionalText(value);

  if (!text) {
    return null;
  }

  const date =
    new Date(
      text.length === 10
        ? `${text}T12:00:00`
        : text
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function dateText(
  value: unknown
) {
  const text =
    optionalText(value);

  if (!text) {
    return "Ej angivet";
  }

  const date =
    dateValue(value);

  if (!date) {
    return text;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone:
        "Europe/Stockholm",
    }
  ).format(date);
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

function getInitials(
  value: string
) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) => word[0]
      )
      .join("")
      .toUpperCase() ||
    "VO"
  );
}

function getDeadlineText(
  value: unknown
) {
  const deadline =
    dateValue(value);

  if (!deadline) {
    return {
      text: "Ingen deadline",
      tone: "warning",
    };
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  deadline.setHours(
    0,
    0,
    0,
    0
  );

  const days =
    Math.round(
      (
        deadline.getTime() -
        today.getTime()
      ) /
        86400000
    );

  if (days < 0) {
    return {
      text:
        `${Math.abs(days)} dagar försenad`,
      tone: "danger",
    };
  }

  if (days === 0) {
    return {
      text: "Deadline idag",
      tone: "warning",
    };
  }

  if (days === 1) {
    return {
      text: "Deadline imorgon",
      tone: "warning",
    };
  }

  return {
    text:
      `${days} dagar kvar`,
    tone: "success",
  };
}

function getNextAction(
  status: string,
  progress: number,
  hasDeadline: boolean
) {
  if (!hasDeadline) {
    return {
      title:
        "Sätt en tydlig deadline",
      description:
        "Projektet saknar deadline. Lägg till ett slutdatum för att få bättre planering och uppföljning.",
    };
  }

  switch (status) {
    case "planning":
      return {
        title:
          "Planera nästa aktivitet",
        description:
          "Projektet är fortfarande i planering. Kontrollera tidsplan, team och nästa leverans.",
      };

    case "waiting_customer":
      return {
        title:
          "Följ upp kunden",
        description:
          "Projektet väntar på kunden. Kontrollera vad som saknas och följ upp vid behov.",
      };

    case "production":
      return {
        title:
          "Följ produktionen",
        description:
          "Projektet är i produktion. Kontrollera kommande deadline och att teamet ligger enligt plan.",
      };

    case "paused":
      return {
        title:
          "Granska varför projektet är pausat",
        description:
          "Bestäm om projektet ska återupptas, planeras om eller fortsätta vara pausat.",
      };

    case "completed":
      return {
        title:
          "Projektet är slutfört",
        description:
          "Kontrollera slutleverans, fakturering och att kunden har fått allt material.",
      };

    default:
      return {
        title:
          progress > 75
            ? "Förbered slutleverans"
            : "Fortsätt projektet",
        description:
          "Kontrollera nästa deadline, ansvarig person och vad som behöver göras härnäst.",
      };
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const {
    id,
  } =
    await params;

  const supabase =
    await createClient();

  const {
    data: projectData,
    error: projectError,
  } = await (
    supabase as any
  )
    .from("projects")
    .select("*")
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (projectError) {
    console.error(
      "Projektet kunde inte hämtas:",
      projectError
    );

    throw new Error(
      projectError.message ||
      "Projektet kunde inte hämtas."
    );
  }

  if (!projectData) {
    notFound();
  }

  const project =
    projectData as UnknownRow;

  const customerId =
    optionalText(
      project.customer_id
    );

  const ownerId =
    optionalText(
      project.owner_id
    );

  const [
    customerResult,
    ownerResult,
  ] = await Promise.all([
    customerId
      ? (supabase as any)
          .from("customers")
          .select(`
            id,
            customer_number,
            name,
            email,
            phone
          `)
          .eq(
            "id",
            customerId
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    ownerId
      ? (supabase as any)
          .from("profiles")
          .select(`
            id,
            full_name,
            email
          `)
          .eq(
            "id",
            ownerId
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),
  ]);

  if (
    customerResult.error
  ) {
    console.error(
      "Projektkunden kunde inte hämtas:",
      customerResult.error
    );
  }

  if (ownerResult.error) {
    console.error(
      "Projektägaren kunde inte hämtas:",
      ownerResult.error
    );
  }

  const customer =
    customerResult.data as
      | UnknownRow
      | null;

  const owner =
    ownerResult.data as
      | UnknownRow
      | null;

  const title =
    textValue(
      project.title,
      "Namnlöst projekt"
    );

  const projectNumber =
    textValue(
      project.project_number,
      id.slice(0, 8)
        .toUpperCase()
    );

  const status =
    textValue(
      project.status,
      "planning"
    );

  const priority =
    textValue(
      project.priority,
      "normal"
    );

  const visibility =
    textValue(
      project.customer_visibility,
      "hidden"
    );

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        numberValue(
          project.progress
        )
      )
    );

  const budget =
    numberValue(
      project.budget_ex_vat ??
      project.budget
    );

  const deadline =
    project.deadline ??
    project.end_date;

  const deadlineInfo =
    getDeadlineText(
      deadline
    );

  const nextAction =
    getNextAction(
      status,
      progress,
      Boolean(
        optionalText(
          deadline
        )
      )
    );

  const ownerName =
    owner
      ? textValue(
          owner.full_name ??
          owner.email,
          "Ej tilldelad"
        )
      : "Ej tilldelad";

  const customerName =
    customer
      ? textValue(
          customer.name,
          "Namnlös kund"
        )
      : "Ingen kund";

  return (
    <div
      className={styles.page}
    >
      <header
        className={styles.header}
      >
        <div
          className={styles.heading}
        >
          <Link
            href="/dashboard/projekt"
            className={
              styles.backButton
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={1.8}
            />

            Till alla projekt
          </Link>

          <div
            className={
              styles.titleMeta
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
              {projectNumber}
            </span>

            <span
              className={`${styles.statusPill} ${
                styles[
                  `status_${status}`
                ] ??
                ""
              }`}
            >
              {statusLabels[
                status
              ] || status}
            </span>
          </div>

          <h1>
            {title}
          </h1>

          <p>
            Hantera projektets status,
            tidsplan, kund,
            ekonomi och ansvar.
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Link
            href={`/dashboard/projekt/${id}/redigera`}
            className={
              styles.editProjectButton
            }
          >
            Redigera projekt
          </Link>

          <DeleteProjectButton
            projectId={id}
            projectTitle={title}
          />
        </div>
      </header>

      <ProjectWorkspaceTabs
        projectId={id}
      />

      <section
        className={styles.heroCard}
      >
        <div
          className={
            styles.heroTopArea
          }
        >
          <div
            className={
              styles.heroIdentity
            }
          >
            <div
              className={
                styles.heroIcon
              }
            >
              <BriefcaseBusiness
                size={28}
                strokeWidth={1.7}
              />
            </div>

            <div>
              <span>
                Projektstatus
              </span>

              <strong>
                {statusLabels[
                  status
                ] || status}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.progressBlock
            }
          >
            <span>
              Framsteg
            </span>

            <strong>
              {progress}%
            </strong>
          </div>
        </div>

        <div
          className={
            styles.progressTrack
          }
        >
          <span
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>

        <div
          className={
            styles.heroMetrics
          }
        >
          <div
            className={
              styles.metric
            }
          >
            <CalendarDays
              size={18}
            />

            <div>
              <span>
                Deadline
              </span>

              <strong>
                {dateText(
                  deadline
                )}
              </strong>

              <small
                className={
                  styles[
                    deadlineInfo.tone
                  ]
                }
              >
                {
                  deadlineInfo.text
                }
              </small>
            </div>
          </div>

          <div
            className={
              styles.metric
            }
          >
            <CircleDollarSign
              size={18}
            />

            <div>
              <span>
                Budget
              </span>

              <strong>
                {money(
                  budget
                )}
              </strong>

              <small>
                Exkl. moms
              </small>
            </div>
          </div>

          <div
            className={
              styles.metric
            }
          >
            <UserRound
              size={18}
            />

            <div>
              <span>
                Ansvarig
              </span>

              <strong>
                {ownerName}
              </strong>

              <small>
                Projektägare
              </small>
            </div>
          </div>

          <div
            className={
              styles.metric
            }
          >
            <Gauge
              size={18}
            />

            <div>
              <span>
                Prioritet
              </span>

              <strong>
                {priorityLabels[
                  priority
                ] || priority}
              </strong>

              <small>
                Projektets nivå
              </small>
            </div>
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
            styles.mainColumn
          }
        >
          <article
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <BriefcaseBusiness
                size={21}
              />

              <div>
                <h2>
                  Projektbeskrivning
                </h2>

                <p>
                  Syfte, omfattning och
                  viktig projektinformation.
                </p>
              </div>
            </div>

            <div
              className={
                styles.description
              }
            >
              {optionalText(
                project.description
              ) || (
                <span
                  className={
                    styles.muted
                  }
                >
                  Ingen beskrivning har
                  lagts till.
                </span>
              )}
            </div>
          </article>

          <article
            className={
              styles.nextActionCard
            }
          >
            <div
              className={
                styles.nextActionIcon
              }
            >
              <Gauge
                size={22}
              />
            </div>

            <div
              className={
                styles.nextActionContent
              }
            >
              <span>
                Rekommenderat nästa steg
              </span>

              <strong>
                {
                  nextAction.title
                }
              </strong>

              <p>
                {
                  nextAction.description
                }
              </p>
            </div>
          </article>

          <article
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <CalendarDays
                size={21}
              />

              <div>
                <h2>
                  Tidsplan
                </h2>

                <p>
                  Projektets viktigaste
                  datum och deadlines.
                </p>
              </div>
            </div>

            <div
              className={
                styles.infoGrid
              }
            >
              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  Startdatum
                </span>

                <strong>
                  {dateText(
                    project.start_date
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  Slutdatum
                </span>

                <strong>
                  {dateText(
                    project.end_date
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  Deadline
                </span>

                <strong>
                  {dateText(
                    deadline
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  Senast uppdaterad
                </span>

                <strong>
                  {dateText(
                    project.updated_at
                  )}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <aside
          className={
            styles.sideColumn
          }
        >
          <article
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <Building2
                size={21}
              />

              <div>
                <h2>Kund</h2>

                <p>
                  Kunden som projektet
                  tillhör.
                </p>
              </div>
            </div>

            {customer ? (
              <>
                <div
                  className={
                    styles.customer
                  }
                >
                  <span
                    className={
                      styles.customerAvatar
                    }
                  >
                    {getInitials(
                      customerName
                    )}
                  </span>

                  <div>
                    <strong>
                      {
                        customerName
                      }
                    </strong>

                    <span>
                      {textValue(
                        customer.customer_number,
                        "Saknar kundnummer"
                      )}
                    </span>

                    {optionalText(
                      customer.email
                    ) && (
                      <small>
                        {textValue(
                          customer.email
                        )}
                      </small>
                    )}

                    {optionalText(
                      customer.phone
                    ) && (
                      <small>
                        {textValue(
                          customer.phone
                        )}
                      </small>
                    )}
                  </div>
                </div>

                {customerId && (
                  <Link
                    href={`/dashboard/kunder/${customerId}`}
                    className={
                      styles.customerLink
                    }
                  >
                    Öppna kund
                  </Link>
                )}
              </>
            ) : (
              <span
                className={
                  styles.muted
                }
              >
                Ingen kund kunde hittas.
              </span>
            )}
          </article>

          <article
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <Gauge
                size={21}
              />

              <div>
                <h2>
                  Projektdetaljer
                </h2>

                <p>
                  Inställningar och
                  projektinformation.
                </p>
              </div>
            </div>

            <dl
              className={
                styles.detailList
              }
            >
              <div>
                <dt>
                  <Gauge
                    size={15}
                  />
                  Prioritet
                </dt>

                <dd>
                  {priorityLabels[
                    priority
                  ] || priority}
                </dd>
              </div>

              <div>
                <dt>
                  <Eye
                    size={15}
                  />
                  Kundsynlighet
                </dt>

                <dd>
                  {visibilityLabels[
                    visibility
                  ] || visibility}
                </dd>
              </div>

              <div>
                <dt>
                  <CircleDollarSign
                    size={15}
                  />
                  Budget
                </dt>

                <dd>
                  {money(
                    budget
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  <UserRound
                    size={15}
                  />
                  Projektägare
                </dt>

                <dd>
                  {ownerName}
                </dd>
              </div>

              <div>
                <dt>
                  <Clock3
                    size={15}
                  />
                  Skapad
                </dt>

                <dd>
                  {dateText(
                    project.created_at
                  )}
                </dd>
              </div>
            </dl>
          </article>
        </aside>
      </div>
    </div>
  );
}