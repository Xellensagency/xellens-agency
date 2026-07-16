"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
  Pencil,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

import type {
  CreateProjectOptions,
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "@/lib/dashboard/projects/create-project-types";

import styles from "./ProjectConfirmation.module.css";

type ProjectConfirmationProps = {
  options: CreateProjectOptions;
  draft: ProjectDraft;
  services: ProjectServiceDraft[];
  milestones: ProjectMilestoneDraft[];
  ownerId: string;
  teamMembers: ProjectTeamMemberDraft[];
  serviceAssignments: ProjectServiceAssignments;
  onEditStep: (step: number) => void;
};

const currencyFormatter = new Intl.NumberFormat(
  "sv-SE",
  {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }
);

const priorityLabels: Record<
  ProjectDraft["priority"],
  string
> = {
  low: "Låg",
  normal: "Normal",
  high: "Hög",
  urgent: "Brådskande",
};

const statusLabels: Record<
  ProjectDraft["status"],
  string
> = {
  planning: "Planering",
  ongoing: "Pågående",
  waiting_customer: "Väntar på kund",
  production: "Produktion",
  paused: "Pausat",
};

const visibilityLabels: Record<
  ProjectDraft["customerVisibility"],
  string
> = {
  hidden: "Dolt för kunden",
  immediate: "Visas direkt",
  after_approval: "Visas efter godkännande",
};

function calculateServiceSubtotal(
  service: ProjectServiceDraft
) {
  return (
    service.quantity *
    service.unitPriceExVat *
    (1 - service.discountPercent / 100)
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Ej valt";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(
    new Date(`${value}T12:00:00`)
  );
}

export default function ProjectConfirmation({
  options,
  draft,
  services,
  milestones,
  ownerId,
  teamMembers,
  serviceAssignments,
  onEditStep,
}: ProjectConfirmationProps) {
  const customer = options.customers.find(
    (item) => item.id === draft.customerId
  );

  const contact = customer?.contacts.find(
    (item) => item.id === draft.contactId
  );

  const categories = options.categories.filter(
    (item) =>
      draft.categoryIds.includes(item.id)
  );

  const owner = options.team_members.find(
    (item) => item.id === ownerId
  );

  const selectedTeam = teamMembers
    .map((teamMember) => {
      const profile = options.team_members.find(
        (item) =>
          item.id === teamMember.profileId
      );

      if (!profile) {
        return null;
      }

      return {
        ...teamMember,
        profile,
      };
    })
    .filter(
      (
        item
      ): item is NonNullable<typeof item> =>
        item !== null
    );

  const servicesSubtotal = services.reduce(
    (sum, service) =>
      sum + calculateServiceSubtotal(service),
    0
  );

  const servicesVat = services.reduce(
    (sum, service) =>
      sum +
      calculateServiceSubtotal(service) *
        (service.vatRate / 100),
    0
  );

  const validationErrors: string[] = [];

  if (!draft.title.trim()) {
    validationErrors.push(
      "Projektets namn saknas."
    );
  }

  if (!draft.customerId) {
    validationErrors.push(
      "Ingen kund är vald."
    );
  }

  if (draft.categoryIds.length === 0) {
    validationErrors.push(
      "Minst en projektkategori måste väljas."
    );
  }

  if (!draft.description.trim()) {
    validationErrors.push(
      "Projektbeskrivning saknas."
    );
  }

  if (!ownerId) {
    validationErrors.push(
      "Ingen projektledare är vald."
    );
  }

  if (
    draft.startDate &&
    draft.endDate &&
    draft.endDate < draft.startDate
  ) {
    validationErrors.push(
      "Slutdatum kan inte vara före startdatum."
    );
  }

  const isReady =
    validationErrors.length === 0;

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <CheckCircle2
            size={25}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <span className={styles.eyebrow}>
            Steg 5 av 5
          </span>

          <h2>Bekräfta projektet</h2>

          <p>
            Kontrollera att allt stämmer
            innan projektet skapas.
          </p>
        </div>
      </header>

      {isReady ? (
        <div className={styles.successBox}>
          <CheckCircle2
            size={20}
            strokeWidth={1.9}
          />

          <div>
            <strong>
              Projektet är redo att skapas
            </strong>

            <span>
              Alla obligatoriska uppgifter
              är ifyllda.
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.errorBox}>
          <AlertCircle
            size={20}
            strokeWidth={1.9}
          />

          <div>
            <strong>
              Några uppgifter behöver
              kompletteras
            </strong>

            <ul>
              {validationErrors.map(
                (error) => (
                  <li key={error}>
                    {error}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <FolderKanban size={20} />

              <h3>Projektinformation</h3>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(1)}
            >
              <Pencil size={15} />
              Ändra
            </button>
          </div>

          <dl className={styles.details}>
            <div>
              <dt>Projektnamn</dt>
              <dd>
                {draft.title || "Ej angivet"}
              </dd>
            </div>

            <div>
              <dt>Kund</dt>
              <dd>
                {customer?.name || "Ej vald"}
              </dd>
            </div>

            <div>
              <dt>Kontaktperson</dt>
              <dd>
                {contact?.full_name ||
                  "Ej vald"}
              </dd>
            </div>

            <div>
              <dt>Kategorier</dt>
              <dd>
                {categories.length > 0
                  ? categories
                      .map(
                        (category) =>
                          category.name
                      )
                      .join(", ")
                  : "Ej valda"}
              </dd>
            </div>

            <div>
              <dt>Prioritet</dt>
              <dd>
                {
                  priorityLabels[
                    draft.priority
                  ]
                }
              </dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                {statusLabels[draft.status]}
              </dd>
            </div>

            <div>
              <dt>Kundportal</dt>
              <dd>
                {
                  visibilityLabels[
                    draft.customerVisibility
                  ]
                }
              </dd>
            </div>
          </dl>

          <div
            className={
              styles.descriptionBox
            }
          >
            <span>Beskrivning</span>

            <p>
              {draft.description ||
                "Ingen beskrivning angiven."}
            </p>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <Wrench size={20} />

              <h3>Tjänster och omfattning</h3>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(2)}
            >
              <Pencil size={15} />
              Ändra
            </button>
          </div>

          {services.length === 0 ? (
            <p className={styles.emptyText}>
              Inga tjänster är tillagda.
            </p>
          ) : (
            <div className={styles.serviceList}>
              {services.map((service) => (
                <div
                  key={service.id}
                  className={styles.serviceRow}
                >
                  <div>
                    <strong>
                      {service.name}
                    </strong>

                    <span>
                      {service.quantity} ×{" "}
                      {currencyFormatter.format(
                        service.unitPriceExVat
                      )}
                    </span>
                  </div>

                  <strong>
                    {currencyFormatter.format(
                      calculateServiceSubtotal(
                        service
                      )
                    )}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className={styles.totals}>
            <div>
              <span>Exkl. moms</span>
              <strong>
                {currencyFormatter.format(
                  servicesSubtotal
                )}
              </strong>
            </div>

            <div>
              <span>Moms</span>
              <strong>
                {currencyFormatter.format(
                  servicesVat
                )}
              </strong>
            </div>

            <div className={styles.totalRow}>
              <span>Totalt inkl. moms</span>
              <strong>
                {currencyFormatter.format(
                  servicesSubtotal +
                    servicesVat
                )}
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <CalendarDays size={20} />

              <h3>Tidsplan och milstolpar</h3>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(3)}
            >
              <Pencil size={15} />
              Ändra
            </button>
          </div>

          <dl className={styles.details}>
            <div>
              <dt>Startdatum</dt>
              <dd>
                {formatDate(
                  draft.startDate
                )}
              </dd>
            </div>

            <div>
              <dt>Slutdatum</dt>
              <dd>
                {formatDate(draft.endDate)}
              </dd>
            </div>

            <div>
              <dt>Budget exkl. moms</dt>
              <dd>
                {draft.budgetExVat
                  ? currencyFormatter.format(
                      Number(
                        draft.budgetExVat
                      )
                    )
                  : "Ej angiven"}
              </dd>
            </div>
          </dl>

          {milestones.length > 0 && (
            <div
              className={
                styles.milestoneList
              }
            >
              {milestones.map(
                (milestone) => (
                  <div key={milestone.id}>
                    <span
                      className={
                        styles.milestoneDot
                      }
                    />

                    <div>
                      <strong>
                        {milestone.title}
                      </strong>

                      <span>
                        {formatDate(
                          milestone.dueDate
                        )}
                        {milestone.dueTime
                          ? ` kl. ${milestone.dueTime}`
                          : ""}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <UsersRound size={20} />

              <h3>Projektteam</h3>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(4)}
            >
              <Pencil size={15} />
              Ändra
            </button>
          </div>

          <div className={styles.ownerBox}>
            <div className={styles.avatar}>
              <UserRound size={20} />
            </div>

            <div>
              <span>Projektledare</span>

              <strong>
                {owner?.full_name ||
                  "Ej vald"}
              </strong>
            </div>
          </div>

          {selectedTeam.length > 0 && (
            <div className={styles.teamList}>
              {selectedTeam.map((member) => (
                <div
                  key={member.profileId}
                >
                  <div>
                    <strong>
                      {
                        member.profile
                          .full_name
                      }
                    </strong>

                    <span>
                      {member.memberRole}
                    </span>
                  </div>

                  {member.responsibilities && (
                    <p>
                      {
                        member.responsibilities
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {services.length > 0 && (
            <div
              className={
                styles.assignmentList
              }
            >
              <h4>Tjänsteansvar</h4>

              {services.map((service) => {
                const assignment =
                  serviceAssignments[
                    service.id
                  ];

                const assignedMember =
                  options.team_members.find(
                    (member) =>
                      member.id ===
                      assignment?.assignedTo
                  );

                return (
                  <div key={service.id}>
                    <span>
                      {service.name}
                    </span>

                    <strong>
                      {assignedMember?.full_name ||
                        "Ej tilldelad"}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>

      <div className={styles.readySummary}>
        <CircleDollarSign
          size={22}
          strokeWidth={1.8}
        />

        <div>
          <span>Projektvärde exkl. moms</span>

          <strong>
            {currencyFormatter.format(
              servicesSubtotal
            )}
          </strong>
        </div>
      </div>
    </section>
  );
}
