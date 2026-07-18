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

function dateText(
  value: unknown
) {
  const text =
    optionalText(value);

  if (!text) {
    return "Ej angivet";
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
      maximumFractionDigits: 2,
    }
  ).format(value);
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
        <div
          className={
            styles.heading
          }
        >
          <Link
            href="/dashboard/projekt"
            className={
              styles.backButton
            }
          >
            <ArrowLeft
              size={17}
            />

            Till projekt
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            {projectNumber}
          </span>

          <h1>{title}</h1>

          <p>
            Projektöversikt med kund,
            status, tidsplan och
            ekonomisk information.
          </p>
        </div>

        <DeleteProjectButton
          projectId={id}
          projectTitle={title}
        />
      </header>

      <section
        className={
          styles.heroCard
        }
      >
        <div
          className={
            styles.heroIcon
          }
        >
          <BriefcaseBusiness
            size={30}
          />
        </div>

        <div
          className={
            styles.heroContent
          }
        >
          <div
            className={
              styles.heroTop
            }
          >
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

            <div
              className={
                styles.progressValue
              }
            >
              {progress} %
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
                  Projektets omfattning
                  och interna information.
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
                  Projektets planerade
                  datum och deadline.
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
                    project.deadline ??
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
                  Senast uppdaterat
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
                  {textValue(
                    customer.name,
                    "K"
                  )
                    .slice(0, 2)
                    .toUpperCase()}
                </span>

                <div>
                  <strong>
                    {textValue(
                      customer.name,
                      "Namnlös kund"
                    )}
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
                </div>
              </div>
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
                <h2>Detaljer</h2>

                <p>
                  Projektets viktigaste
                  inställningar.
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
                  Budget exkl. moms
                </dt>

                <dd>
                  {money(budget)}
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
                  {owner
                    ? textValue(
                        owner.full_name ??
                        owner.email,
                        "Ej angiven"
                      )
                    : "Ej tilldelad"}
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
