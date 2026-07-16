"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  Plus,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type {
  CreateProjectOptions,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "@/lib/dashboard/projects/create-project-types";
import styles from "./ProjectTeam.module.css";

type ProjectTeamProps = {
  options: CreateProjectOptions;
  ownerId: string;
  teamMembers: ProjectTeamMemberDraft[];
  services: ProjectServiceDraft[];
  serviceAssignments: ProjectServiceAssignments;
  onOwnerChange: (ownerId: string) => void;
  onTeamChange: (
    members: ProjectTeamMemberDraft[]
  ) => void;
  onServiceAssignmentsChange: (
    assignments: ProjectServiceAssignments
  ) => void;
};

const roleOptions = [
  {
    value: "project_lead",
    label: "Projektledare",
  },
  {
    value: "account_manager",
    label: "Kundansvarig",
  },
  {
    value: "designer",
    label: "Designer",
  },
  {
    value: "developer",
    label: "Utvecklare",
  },
  {
    value: "seo",
    label: "SEO-specialist",
  },
  {
    value: "marketing",
    label: "Marknadsföring",
  },
  {
    value: "content",
    label: "Innehåll & copy",
  },
  {
    value: "photo_video",
    label: "Foto & video",
  },
  {
    value: "support",
    label: "Support",
  },
  {
    value: "observer",
    label: "Observatör",
  },
  {
    value: "other",
    label: "Annan roll",
  },
];

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "XA"
  );
}

export default function ProjectTeam({
  options,
  ownerId,
  teamMembers,
  services,
  serviceAssignments,
  onOwnerChange,
  onTeamChange,
  onServiceAssignmentsChange,
}: ProjectTeamProps) {
  const owner = options.team_members.find(
    (member) => member.id === ownerId
  );

  const selectedProfileIds = new Set(
    teamMembers.map(
      (member) => member.profileId
    )
  );

  const availableMembers =
    options.team_members.filter(
      (member) =>
        member.id !== ownerId &&
        !selectedProfileIds.has(member.id)
    );

  const selectedProfiles =
    teamMembers
      .map((assignment) => ({
        assignment,
        profile: options.team_members.find(
          (member) =>
            member.id ===
            assignment.profileId
        ),
      }))
      .filter(
        (
          item
        ): item is {
          assignment: ProjectTeamMemberDraft;
          profile: NonNullable<
            typeof item.profile
          >;
        } => Boolean(item.profile)
      );

  const serviceAssignees = [
    ...(owner ? [owner] : []),
    ...selectedProfiles.map(
      (item) => item.profile
    ),
  ].filter(
    (member, index, members) =>
      members.findIndex(
        (item) => item.id === member.id
      ) === index
  );

  function changeOwner(
    newOwnerId: string
  ) {
    const previousOwnerId = ownerId;

    onOwnerChange(newOwnerId);

    onTeamChange(
      teamMembers.filter(
        (member) =>
          member.profileId !== newOwnerId
      )
    );

    const nextAssignments =
      Object.fromEntries(
        Object.entries(
          serviceAssignments
        ).map(([serviceId, assignment]) => [
          serviceId,
          {
            ...assignment,
            assignedTo:
              assignment.assignedTo ===
                previousOwnerId &&
              newOwnerId
                ? newOwnerId
                : assignment.assignedTo,
          },
        ])
      );

    onServiceAssignmentsChange(
      nextAssignments
    );
  }

  function addMember(profileId: string) {
    if (
      !profileId ||
      profileId === ownerId ||
      selectedProfileIds.has(profileId)
    ) {
      return;
    }

    onTeamChange([
      ...teamMembers,
      {
        profileId,
        memberRole: "developer",
        responsibilities: "",
      },
    ]);
  }

  function updateMember(
    profileId: string,
    updates: Partial<ProjectTeamMemberDraft>
  ) {
    onTeamChange(
      teamMembers.map((member) =>
        member.profileId === profileId
          ? {
              ...member,
              ...updates,
            }
          : member
      )
    );
  }

  function removeMember(
    profileId: string
  ) {
    onTeamChange(
      teamMembers.filter(
        (member) =>
          member.profileId !== profileId
      )
    );

    const nextAssignments =
      Object.fromEntries(
        Object.entries(
          serviceAssignments
        ).map(([serviceId, assignment]) => [
          serviceId,
          {
            ...assignment,
            assignedTo:
              assignment.assignedTo ===
              profileId
                ? null
                : assignment.assignedTo,
          },
        ])
      );

    onServiceAssignmentsChange(
      nextAssignments
    );
  }

  function updateServiceAssignment(
    serviceId: string,
    updates: {
      assignedTo?: string | null;
      deadline?: string;
    }
  ) {
    const current =
      serviceAssignments[serviceId] ?? {
        assignedTo: null,
        deadline: "",
      };

    onServiceAssignmentsChange({
      ...serviceAssignments,
      [serviceId]: {
        ...current,
        ...updates,
      },
    });
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>4.</span>

          <div>
            <h2>Team och roller</h2>

            <p>
              Välj projektledare, lägg till
              medarbetare och fördela
              tjänsterna.
            </p>
          </div>
        </div>

        <strong>
          {teamMembers.length + (owner ? 1 : 0)}
          {" "}
          {teamMembers.length +
            (owner ? 1 : 0) ===
          1
            ? "person"
            : "personer"}
        </strong>
      </header>

      <section className={styles.ownerSection}>
        <header>
          <div className={styles.sectionIcon}>
            <Crown
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <h3>Projektledare</h3>

            <p>
              Personen som har huvudansvar
              för projektet.
            </p>
          </div>
        </header>

        {options.team_members.length ===
        0 ? (
          <div className={styles.emptyTeam}>
            Inga interna användare finns
            tillgängliga.
          </div>
        ) : (
          <div className={styles.ownerContent}>
            <label>
              <span>Välj projektledare</span>

              <select
                value={ownerId}
                onChange={(event) =>
                  changeOwner(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Ingen projektledare
                </option>

                {options.team_members.map(
                  (member) => (
                    <option
                      value={member.id}
                      key={member.id}
                    >
                      {member.full_name}
                    </option>
                  )
                )}
              </select>
            </label>

            {owner && (
              <article
                className={styles.ownerCard}
              >
                <span
                  className={styles.avatar}
                >
                  {getInitials(
                    owner.full_name
                  )}
                </span>

                <div>
                  <strong>
                    {owner.full_name}
                  </strong>

                  <span>{owner.email}</span>
                </div>

                <small>
                  Projektledare
                </small>
              </article>
            )}
          </div>
        )}
      </section>

      <section className={styles.membersSection}>
        <header>
          <div>
            <h3>Projektteam</h3>

            <p>
              Lägg till personer som ska
              arbeta med projektet.
            </p>
          </div>

          <span>
            {teamMembers.length} valda
          </span>
        </header>

        {availableMembers.length > 0 && (
          <div
            className={
              styles.availableMembers
            }
          >
            {availableMembers.map(
              (member) => (
                <article
                  className={
                    styles.availableCard
                  }
                  key={member.id}
                >
                  <span
                    className={styles.avatar}
                  >
                    {getInitials(
                      member.full_name
                    )}
                  </span>

                  <div>
                    <strong>
                      {member.full_name}
                    </strong>

                    <span>
                      {member.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addMember(member.id)
                    }
                    aria-label={`Lägg till ${member.full_name}`}
                  >
                    <Plus
                      size={16}
                      strokeWidth={1.8}
                    />
                    Lägg till
                  </button>
                </article>
              )
            )}
          </div>
        )}

        {selectedProfiles.length === 0 ? (
          <div className={styles.emptyState}>
            <UsersRound
              size={31}
              strokeWidth={1.4}
            />

            <strong>
              Inga ytterligare
              teammedlemmar
            </strong>

            <p>
              Projektledaren kan arbeta ensam,
              eller så kan fler personer
              läggas till senare.
            </p>
          </div>
        ) : (
          <div
            className={
              styles.selectedMembers
            }
          >
            {selectedProfiles.map(
              ({ profile, assignment }) => (
                <article
                  className={
                    styles.memberEditor
                  }
                  key={profile.id}
                >
                  <div
                    className={
                      styles.memberIdentity
                    }
                  >
                    <span
                      className={
                        styles.avatar
                      }
                    >
                      {getInitials(
                        profile.full_name
                      )}
                    </span>

                    <div>
                      <strong>
                        {profile.full_name}
                      </strong>

                      <span>
                        {profile.email}
                      </span>
                    </div>
                  </div>

                  <label>
                    <span>Roll</span>

                    <select
                      value={
                        assignment.memberRole
                      }
                      onChange={(event) =>
                        updateMember(
                          profile.id,
                          {
                            memberRole:
                              event.target
                                .value,
                          }
                        )
                      }
                    >
                      {roleOptions.map(
                        (role) => (
                          <option
                            value={
                              role.value
                            }
                            key={
                              role.value
                            }
                          >
                            {role.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label
                    className={
                      styles.responsibility
                    }
                  >
                    <span>
                      Ansvarsområde
                    </span>

                    <textarea
                      rows={2}
                      value={
                        assignment.responsibilities
                      }
                      onChange={(event) =>
                        updateMember(
                          profile.id,
                          {
                            responsibilities:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="Exempel: Ansvarar för design och kundfeedback."
                    />
                  </label>

                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      removeMember(
                        profile.id
                      )
                    }
                    aria-label={`Ta bort ${profile.full_name}`}
                  >
                    <Trash2
                      size={17}
                      strokeWidth={1.7}
                    />
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section
        className={
          styles.serviceAssignmentSection
        }
      >
        <header>
          <div>
            <h3>Fördela tjänster</h3>

            <p>
              Ange ansvarig person och
              eventuell intern deadline för
              varje tjänst.
            </p>
          </div>

          <BriefcaseBusiness
            size={22}
            strokeWidth={1.5}
          />
        </header>

        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <BriefcaseBusiness
              size={31}
              strokeWidth={1.4}
            />

            <strong>
              Inga tjänster att fördela
            </strong>

            <p>
              Lägg först till tjänster under
              steg två.
            </p>
          </div>
        ) : (
          <div
            className={styles.serviceList}
          >
            {services.map(
              (service, index) => {
                const assignment =
                  serviceAssignments[
                    service.id
                  ] ?? {
                    assignedTo: null,
                    deadline: "",
                  };

                return (
                  <article
                    className={
                      styles.serviceRow
                    }
                    key={service.id}
                  >
                    <span
                      className={
                        styles.serviceNumber
                      }
                    >
                      {index + 1}
                    </span>

                    <div
                      className={
                        styles.serviceInfo
                      }
                    >
                      <strong>
                        {service.name}
                      </strong>

                      <span>
                        {service.quantity}{" "}
                        {service.unitCode}
                      </span>
                    </div>

                    <label>
                      <span>
                        <UserRound
                          size={13}
                          strokeWidth={1.7}
                        />
                        Ansvarig
                      </span>

                      <select
                        value={
                          assignment.assignedTo ??
                          ""
                        }
                        onChange={(event) =>
                          updateServiceAssignment(
                            service.id,
                            {
                              assignedTo:
                                event.target
                                  .value ||
                                null,
                            }
                          )
                        }
                      >
                        <option value="">
                          Ej tilldelad
                        </option>

                        {serviceAssignees.map(
                          (member) => (
                            <option
                              value={
                                member.id
                              }
                              key={
                                member.id
                              }
                            >
                              {
                                member.full_name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label>
                      <span>
                        <CalendarDays
                          size={13}
                          strokeWidth={1.7}
                        />
                        Intern deadline
                      </span>

                      <input
                        type="date"
                        value={
                          assignment.deadline
                        }
                        onChange={(event) =>
                          updateServiceAssignment(
                            service.id,
                            {
                              deadline:
                                event.target
                                  .value,
                            }
                          )
                        }
                      />
                    </label>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </section>
  );
}
