import Link from "next/link";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleDollarSign,
  PackageCheck,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ProjectWorkspaceTabs from "@/components/dashboard/projects/detail/ProjectWorkspaceTabs";

import {
  addProjectMemberAction,
  removeProjectMemberAction,
  updateProjectMemberAction,
  updateProjectServiceAssignmentAction,
} from "./actions";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "./ProjectResources.module.css";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function text(
  value: unknown
) {
  return value == null
    ? ""
    : String(
        value
      );
}


function money(
  value: number
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style:
        "currency",

      currency:
        "SEK",

      maximumFractionDigits:
        0,
    }
  ).format(
    value
  );
}


export default async function ProjectResourcesPage({
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
    teamResult,
    servicesResult,
    profilesResult,
  ] =
    await Promise.all([
      (
        supabase as any
      )
        .from("projects")
        .select(
          "id, project_number, title, owner_id"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle(),

      (
        supabase as any
      )
        .from(
          "project_team_members"
        )
        .select("*")
        .eq(
          "project_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        ),

      (
        supabase as any
      )
        .from(
          "project_services"
        )
        .select("*")
        .eq(
          "project_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        ),

      (
        supabase as any
      )
        .from("profiles")
        .select(
          "id, full_name, email, role, is_active"
        )
        .order(
          "full_name",
          {
            ascending: true,
          }
        ),
    ]);


  if (
    projectResult.error
  ) {
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
    teamResult.error
  ) {
    throw new Error(
      teamResult.error.message
    );
  }


  if (
    servicesResult.error
  ) {
    throw new Error(
      servicesResult.error.message
    );
  }


  const profiles =
    profilesResult.data ??
    [];


  const profileMap =
    new Map<string, any>(
      profiles.map(
        (
          profile: any
        ) => [
          String(
            profile.id
          ),

          profile,
        ]
      )
    );


  const team =
    teamResult.data ??
    [];


  const services =
    servicesResult.data ??
    [];


  const totalValue =
    services.reduce(
      (
        total: number,
        service: any
      ) => {
        const quantity =
          Number(
            service.quantity ??
            1
          );

        const price =
          Number(
            service
              .unit_price_ex_vat ??
            0
          );

        const discount =
          Number(
            service
              .discount_percent ??
            0
          );

        return (
          total +
          quantity *
            price *
            (
              1 -
              discount /
                100
            )
        );
      },
      0
    );


  const unassigned =
    services.filter(
      (
        service: any
      ) =>
        !service.assigned_to
    ).length;


  const teamProfileIds =
    new Set(
      team.map(
        (
          member: any
        ) =>
          String(
            member.profile_id
          )
      )
    );


  const availableProfiles =
    profiles.filter(
      (
        profile: any
      ) =>
        profile.is_active &&
        !teamProfileIds.has(
          String(
            profile.id
          )
        )
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
          {text(
            projectResult.data
              .project_number
          )}
        </span>

        <h1>
          Team & tjänster
        </h1>

        <p>
          Resurser, ansvar och
          leveranser för{" "}
          <strong>
            {text(
              projectResult.data
                .title
            )}
          </strong>.
        </p>
      </header>


      <ProjectWorkspaceTabs
        projectId={id}
      />


      <section
        className={
          styles.stats
        }
      >
        <article>
          <Users
            size={21}
          />

          <div>
            <small>
              Projektteam
            </small>

            <strong>
              {team.length}
            </strong>

            <p>
              personer
            </p>
          </div>
        </article>


        <article>
          <PackageCheck
            size={21}
          />

          <div>
            <small>
              Tjänster
            </small>

            <strong>
              {services.length}
            </strong>

            <p>
              i projektet
            </p>
          </div>
        </article>


        <article>
          <CircleDollarSign
            size={21}
          />

          <div>
            <small>
              Tjänstevärde
            </small>

            <strong>
              {money(
                totalValue
              )}
            </strong>

            <p>
              exkl. moms
            </p>
          </div>
        </article>


        <article>
          <BriefcaseBusiness
            size={21}
          />

          <div>
            <small>
              Saknar ansvarig
            </small>

            <strong>
              {unassigned}
            </strong>

            <p>
              tjänster
            </p>
          </div>
        </article>
      </section>


      <div
        className={
          styles.columns
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
              <span>
                Projektteam
              </span>

              <h2>
                Personer & roller
              </h2>

              <p>
                Se vem som ansvarar
                för vad i projektet.
              </p>
            </div>
          </header>


          {availableProfiles.length >
            0 && (
            <form
              action={
                addProjectMemberAction
              }
              className={
                styles.addMember
              }
            >
              <input
                type="hidden"
                name="projectId"
                value={id}
              />

              <div>
                <UserPlus
                  size={18}
                />

                <strong>
                  Lägg till teammedlem
                </strong>
              </div>

              <select
                name="profileId"
                required
                defaultValue=""
              >
                <option
                  value=""
                  disabled
                >
                  Välj person
                </option>

                {availableProfiles.map(
                  (
                    profile: any
                  ) => (
                    <option
                      key={
                        profile.id
                      }
                      value={
                        profile.id
                      }
                    >
                      {text(
                        profile.full_name
                      )}
                    </option>
                  )
                )}
              </select>

              <input
                name="memberRole"
                placeholder="Roll, t.ex. Designer"
              />

              <input
                name="responsibilities"
                placeholder="Ansvar i projektet"
              />

              <button
                type="submit"
              >
                Lägg till
              </button>
            </form>
          )}


          <div
            className={
              styles.teamList
            }
          >
            {team.map(
              (
                member: any
              ) => {
                const profile =
                  profileMap.get(
                    String(
                      member
                        .profile_id
                    )
                  );

                const isOwner =
                  String(
                    projectResult
                      .data
                      .owner_id ??
                    ""
                  ) ===
                  String(
                    member
                      .profile_id
                  );


                return (
                  <article
                    key={
                      member.id
                    }
                    className={
                      styles.teamCard
                    }
                  >
                    <div
                      className={
                        styles.person
                      }
                    >
                      <span>
                        {text(
                          profile
                            ?.full_name
                        )
                          .split(
                            /\s+/
                          )
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              name
                            ) =>
                              name[0]
                          )
                          .join(
                            ""
                          )
                          .toUpperCase()}
                      </span>

                      <div>
                        <strong>
                          {text(
                            profile
                              ?.full_name
                          ) ||
                            "Okänd användare"}
                        </strong>

                        <small>
                          {text(
                            profile
                              ?.email
                          )}
                        </small>
                      </div>

                      {isOwner && (
                        <em>
                          Projektägare
                        </em>
                      )}
                    </div>


                    <form
                      action={
                        updateProjectMemberAction
                      }
                      className={
                        styles
                          .memberForm
                      }
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={id}
                      />

                      <input
                        type="hidden"
                        name="memberId"
                        value={
                          member.id
                        }
                      />

                      <label>
                        <span>
                          Roll
                        </span>

                        <input
                          name="memberRole"
                          defaultValue={
                            text(
                              member
                                .member_role
                            )
                          }
                        />
                      </label>

                      <label>
                        <span>
                          Ansvar
                        </span>

                        <input
                          name="responsibilities"
                          defaultValue={
                            text(
                              member
                                .responsibilities
                            )
                          }
                        />
                      </label>

                      <button
                        type="submit"
                      >
                        <Save
                          size={15}
                        />

                        Spara
                      </button>
                    </form>


                    {!isOwner && (
                      <form
                        action={
                          removeProjectMemberAction
                        }
                      >
                        <input
                          type="hidden"
                          name="projectId"
                          value={id}
                        />

                        <input
                          type="hidden"
                          name="memberId"
                          value={
                            member.id
                          }
                        />

                        <button
                          type="submit"
                          className={
                            styles
                              .removeButton
                          }
                        >
                          <Trash2
                            size={15}
                          />

                          Ta bort från team
                        </button>
                      </form>
                    )}
                  </article>
                );
              }
            )}


            {team.length ===
              0 && (
              <div
                className={
                  styles.empty
                }
              >
                Inga teammedlemmar
                är tillagda ännu.
              </div>
            )}
          </div>
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
              <span>
                Leverans
              </span>

              <h2>
                Tjänster i projektet
              </h2>

              <p>
                Pris, ansvarig och
                deadline per tjänst.
              </p>
            </div>
          </header>


          <div
            className={
              styles.serviceList
            }
          >
            {services.map(
              (
                service: any
              ) => {
                const quantity =
                  Number(
                    service
                      .quantity ??
                    1
                  );

                const unitPrice =
                  Number(
                    service
                      .unit_price_ex_vat ??
                    0
                  );

                const discount =
                  Number(
                    service
                      .discount_percent ??
                    0
                  );

                const total =
                  quantity *
                  unitPrice *
                  (
                    1 -
                    discount /
                      100
                  );


                return (
                  <article
                    key={
                      service.id
                    }
                    className={
                      styles
                        .serviceCard
                    }
                  >
                    <div
                      className={
                        styles
                          .serviceTop
                      }
                    >
                      <div>
                        <span>
                          {service
                            .is_optional
                            ? "Tillval"
                            : "Tjänst"}
                        </span>

                        <h3>
                          {text(
                            service.name
                          )}
                        </h3>

                        {service
                          .description && (
                          <p>
                            {text(
                              service
                                .description
                            )}
                          </p>
                        )}
                      </div>

                      <strong>
                        {money(
                          total
                        )}
                      </strong>
                    </div>


                    <div
                      className={
                        styles
                          .serviceMeta
                      }
                    >
                      <span>
                        {quantity} ×{" "}
                        {money(
                          unitPrice
                        )}
                      </span>

                      {discount >
                        0 && (
                        <span>
                          Rabatt{" "}
                          {discount}%
                        </span>
                      )}

                      <span>
                        {service
                          .customer_visible
                          ? "Synlig för kund"
                          : "Endast intern"}
                      </span>
                    </div>


                    <form
                      action={
                        updateProjectServiceAssignmentAction
                      }
                      className={
                        styles
                          .assignmentForm
                      }
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={id}
                      />

                      <input
                        type="hidden"
                        name="serviceId"
                        value={
                          service.id
                        }
                      />

                      <label>
                        <span>
                          Ansvarig
                        </span>

                        <select
                          name="assignedTo"
                          defaultValue={
                            text(
                              service
                                .assigned_to
                            )
                          }
                        >
                          <option value="">
                            Ej tilldelad
                          </option>

                          {profiles
                            .filter(
                              (
                                profile: any
                              ) =>
                                profile
                                  .is_active
                            )
                            .map(
                              (
                                profile: any
                              ) => (
                                <option
                                  key={
                                    profile.id
                                  }
                                  value={
                                    profile.id
                                  }
                                >
                                  {text(
                                    profile
                                      .full_name
                                  )}
                                </option>
                              )
                            )}
                        </select>
                      </label>

                      <label>
                        <span>
                          Deadline
                        </span>

                        <input
                          type="date"
                          name="deadline"
                          defaultValue={
                            text(
                              service
                                .deadline
                            ).slice(
                              0,
                              10
                            )
                          }
                        />
                      </label>

                      <button
                        type="submit"
                      >
                        <Save
                          size={15}
                        />

                        Spara
                      </button>
                    </form>
                  </article>
                );
              }
            )}


            {services.length ===
              0 && (
              <div
                className={
                  styles.empty
                }
              >
                Projektet har inga
                registrerade tjänster
                ännu.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}