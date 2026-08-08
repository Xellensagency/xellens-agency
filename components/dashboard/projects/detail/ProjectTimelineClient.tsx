"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createMilestoneAction,
  deleteMilestoneAction,
  toggleMilestoneCompletedAction,
  updateMilestoneAction,
  type MilestoneInput,
} from "@/app/dashboard/projekt/[id]/tidsplan/actions";

import styles from "./ProjectTimelineClient.module.css";


export type TimelineMilestone = {
  id: string;

  title: string;

  description: string;

  milestoneType:
    MilestoneInput["milestoneType"];

  status:
    MilestoneInput["status"];

  dueDate: string;

  dueTime: string;

  assignedTo:
    string | null;

  assignedName:
    string | null;

  reminderMinutes:
    number;

  customerVisible:
    boolean;

  completedAt:
    string | null;
};


export type TimelineTeamMember = {
  id: string;

  fullName: string;
};


type Props = {
  projectId: string;

  startDate: string;

  endDate: string;

  deadline: string;

  milestones:
    TimelineMilestone[];

  teamMembers:
    TimelineTeamMember[];
};


type FormState = {
  title: string;

  description: string;

  milestoneType:
    MilestoneInput["milestoneType"];

  status:
    MilestoneInput["status"];

  dueDate: string;

  dueTime: string;

  assignedTo: string;

  reminderMinutes: string;

  customerVisible:
    boolean;
};


function emptyForm(
  fallbackDate: string
): FormState {
  return {
    title: "",

    description: "",

    milestoneType:
      "delivery",

    status:
      "pending",

    dueDate:
      fallbackDate,

    dueTime:
      "12:00",

    assignedTo:
      "",

    reminderMinutes:
      "1440",

    customerVisible:
      true,
  };
}


function parseDate(
  value: string
) {
  return new Date(
    `${value}T12:00:00`
  );
}


function formatDate(
  value: string
) {
  if (!value) {
    return "Ej satt";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    }
  ).format(
    parseDate(
      value
    )
  );
}


function getToday() {
  const now =
    new Date();

  now.setHours(
    0,
    0,
    0,
    0
  );

  return now;
}


function isOverdue(
  milestone:
    TimelineMilestone
) {
  if (
    milestone.completedAt ||
    !milestone.dueDate
  ) {
    return false;
  }

  return (
    parseDate(
      milestone.dueDate
    ).getTime() <
    getToday().getTime()
  );
}


function typeLabel(
  type:
    TimelineMilestone[
      "milestoneType"
    ]
) {
  switch (type) {
    case "delivery":
      return "Leverans";

    case "feedback":
      return "Feedback";

    case "meeting":
      return "Möte";

    case "task":
      return "Uppgift";

    default:
      return "Annat";
  }
}


export default function ProjectTimelineClient({
  projectId,
  startDate,
  endDate,
  deadline,
  milestones,
  teamMembers,
}: Props) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const fallbackDate =
    deadline ||
    endDate ||
    startDate ||
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm(
        fallbackDate
      )
    );


  const sorted =
    useMemo(
      () =>
        [...milestones]
          .sort(
            (
              first,
              second
            ) =>
              first.dueDate
                .localeCompare(
                  second.dueDate
                )
          ),
      [
        milestones,
      ]
    );


  const completedCount =
    milestones.filter(
      (
        item
      ) =>
        Boolean(
          item.completedAt
        )
    ).length;


  const overdueCount =
    milestones.filter(
      isOverdue
    ).length;


  const nextMilestone =
    sorted.find(
      (
        item
      ) =>
        !item.completedAt
    ) ??
    null;


  function resetForm() {
    setEditingId(
      null
    );

    setForm(
      emptyForm(
        fallbackDate
      )
    );

    setFormOpen(
      false
    );

    setError("");
  }


  function editMilestone(
    milestone:
      TimelineMilestone
  ) {
    setEditingId(
      milestone.id
    );

    setForm({
      title:
        milestone.title,

      description:
        milestone.description,

      milestoneType:
        milestone.milestoneType,

      status:
        milestone.status,

      dueDate:
        milestone.dueDate,

      dueTime:
        milestone.dueTime ||
        "12:00",

      assignedTo:
        milestone.assignedTo ||
        "",

      reminderMinutes:
        String(
          milestone
            .reminderMinutes
        ),

      customerVisible:
        milestone.customerVisible,
    });

    setFormOpen(
      true
    );

    setError("");
  }


  function saveMilestone() {
    if (
      !form.title.trim() ||
      !form.dueDate
    ) {
      setError(
        "Titel och datum måste anges."
      );

      return;
    }


    const input:
      MilestoneInput = {
        title:
          form.title,

        description:
          form.description,

        milestoneType:
          form.milestoneType,

        status:
          form.status,

        dueDate:
          form.dueDate,

        dueTime:
          form.dueTime,

        assignedTo:
          form.assignedTo ||
          null,

        reminderMinutes:
          Number(
            form.reminderMinutes
          ) || 0,

        customerVisible:
          form.customerVisible,
      };


    startTransition(
      async () => {
        const result =
          editingId
            ? await updateMilestoneAction(
                projectId,
                editingId,
                input
              )
            : await createMilestoneAction(
                projectId,
                input
              );


        if (!result.ok) {
          setError(
            result.error
          );

          return;
        }


        resetForm();

        router.refresh();
      }
    );
  }


  function toggleDone(
    milestone:
      TimelineMilestone
  ) {
    startTransition(
      async () => {
        const result =
          await toggleMilestoneCompletedAction(
            projectId,
            milestone.id,
            !milestone.completedAt
          );


        if (!result.ok) {
          setError(
            result.error
          );

          return;
        }


        router.refresh();
      }
    );
  }


  function remove(
    milestone:
      TimelineMilestone
  ) {
    const confirmed =
      window.confirm(
        `Ta bort milstolpen "${milestone.title}"?`
      );


    if (!confirmed) {
      return;
    }


    startTransition(
      async () => {
        const result =
          await deleteMilestoneAction(
            projectId,
            milestone.id
          );


        if (!result.ok) {
          setError(
            result.error
          );

          return;
        }


        router.refresh();
      }
    );
  }


  return (
    <div
      className={
        styles.workspace
      }
    >
      <section
        className={
          styles.stats
        }
      >
        <article>
          <span>
            <CalendarDays
              size={20}
            />
          </span>

          <div>
            <small>
              Projektperiod
            </small>

            <strong>
              {startDate
                ? formatDate(
                    startDate
                  )
                : "Ej satt"}
            </strong>

            <p>
              till{" "}
              {endDate
                ? formatDate(
                    endDate
                  )
                : "ej satt"}
            </p>
          </div>
        </article>


        <article>
          <span>
            <Target
              size={20}
            />
          </span>

          <div>
            <small>
              Nästa milstolpe
            </small>

            <strong>
              {nextMilestone
                ? formatDate(
                    nextMilestone
                      .dueDate
                  )
                : "Ingen"}
            </strong>

            <p>
              {nextMilestone
                ?.title ??
                "Inget väntar"}
            </p>
          </div>
        </article>


        <article>
          <span>
            <Clock3
              size={20}
            />
          </span>

          <div>
            <small>
              Försenade
            </small>

            <strong>
              {overdueCount}
            </strong>

            <p>
              milstolpar
            </p>
          </div>
        </article>


        <article>
          <span>
            <CheckCircle2
              size={20}
            />
          </span>

          <div>
            <small>
              Klara
            </small>

            <strong>
              {completedCount}
            </strong>

            <p>
              av{" "}
              {
                milestones.length
              }
            </p>
          </div>
        </article>
      </section>


      <section
        className={
          styles.topbar
        }
      >
        <div>
          <span>
            Projektplan
          </span>

          <h2>
            Tidsplan & milstolpar
          </h2>

          <p>
            Följ leveranser,
            feedback, möten och
            interna deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(
              null
            );

            setForm(
              emptyForm(
                fallbackDate
              )
            );

            setFormOpen(
              true
            );
          }}
        >
          <Plus
            size={17}
          />

          Ny milstolpe
        </button>
      </section>


      {error && (
        <div
          className={
            styles.error
          }
        >
          {error}
        </div>
      )}


      {formOpen && (
        <section
          className={
            styles.editor
          }
        >
          <header>
            <div>
              <span>
                {editingId
                  ? "Redigera"
                  : "Ny milstolpe"}
              </span>

              <h3>
                {editingId
                  ? "Uppdatera milstolpe"
                  : "Lägg till i tidsplanen"}
              </h3>
            </div>

            <button
              type="button"
              onClick={
                resetForm
              }
              className={
                styles.closeButton
              }
            >
              <X
                size={18}
              />
            </button>
          </header>


          <div
            className={
              styles.formGrid
            }
          >
            <label
              className={
                styles.full
              }
            >
              <span>
                Titel
              </span>

              <input
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      title:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />
            </label>


            <label>
              <span>
                Typ
              </span>

              <select
                value={
                  form
                    .milestoneType
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      milestoneType:
                        event
                          .target
                          .value as FormState["milestoneType"],
                    })
                  )
                }
              >
                <option value="delivery">
                  Leverans
                </option>

                <option value="feedback">
                  Feedback
                </option>

                <option value="meeting">
                  Möte
                </option>

                <option value="task">
                  Uppgift
                </option>

                <option value="other">
                  Annat
                </option>
              </select>
            </label>


            <label>
              <span>
                Status
              </span>

              <select
                value={
                  form.status
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      status:
                        event
                          .target
                          .value as FormState["status"],
                    })
                  )
                }
              >
                <option value="pending">
                  Kommande
                </option>

                <option value="in_progress">
                  Pågår
                </option>
              </select>
            </label>


            <label>
              <span>
                Datum
              </span>

              <input
                type="date"
                value={
                  form.dueDate
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      dueDate:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />
            </label>


            <label>
              <span>
                Tid
              </span>

              <input
                type="time"
                value={
                  form.dueTime
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      dueTime:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />
            </label>


            <label>
              <span>
                Ansvarig
              </span>

              <select
                value={
                  form
                    .assignedTo
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      assignedTo:
                        event
                          .target
                          .value,
                    })
                  )
                }
              >
                <option value="">
                  Ej tilldelad
                </option>

                {teamMembers.map(
                  (
                    member
                  ) => (
                    <option
                      key={
                        member.id
                      }
                      value={
                        member.id
                      }
                    >
                      {
                        member.fullName
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              <span>
                Påminnelse
              </span>

              <select
                value={
                  form
                    .reminderMinutes
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      reminderMinutes:
                        event
                          .target
                          .value,
                    })
                  )
                }
              >
                <option value="0">
                  Ingen
                </option>

                <option value="60">
                  1 timme innan
                </option>

                <option value="1440">
                  1 dag innan
                </option>

                <option value="2880">
                  2 dagar innan
                </option>

                <option value="10080">
                  1 vecka innan
                </option>
              </select>
            </label>


            <label
              className={
                styles.full
              }
            >
              <span>
                Beskrivning
              </span>

              <textarea
                rows={4}
                value={
                  form
                    .description
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />
            </label>


            <label
              className={
                styles.checkbox
              }
            >
              <input
                type="checkbox"
                checked={
                  form
                    .customerVisible
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      customerVisible:
                        event
                          .target
                          .checked,
                    })
                  )
                }
              />

              <span>
                Synlig för kunden
              </span>
            </label>
          </div>


          <footer>
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={
                resetForm
              }
            >
              Avbryt
            </button>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              disabled={
                pending
              }
              onClick={
                saveMilestone
              }
            >
              <Check
                size={17}
              />

              {pending
                ? "Sparar..."
                : editingId
                  ? "Spara ändringar"
                  : "Lägg till milstolpe"}
            </button>
          </footer>
        </section>
      )}


      <section
        className={
          styles.timelineCard
        }
      >
        <div
          className={
            styles.timeline
          }
        >
          {startDate && (
            <article
              className={
                styles.fixedEvent
              }
            >
              <div
                className={
                  styles.rail
                }
              >
                <span>
                  <Flag
                    size={17}
                  />
                </span>

                <i />
              </div>

              <div
                className={
                  styles.eventContent
                }
              >
                <span
                  className={
                    styles.kicker
                  }
                >
                  Projekt
                </span>

                <h3>
                  Projektstart
                </h3>

                <p>
                  Projektets planerade
                  start.
                </p>

                <strong>
                  {formatDate(
                    startDate
                  )}
                </strong>
              </div>
            </article>
          )}


          {sorted.map(
            (
              milestone
            ) => {
              const overdue =
                isOverdue(
                  milestone
                );

              const completed =
                Boolean(
                  milestone
                    .completedAt
                );


              return (
                <article
                  key={
                    milestone.id
                  }
                  className={
                    styles
                      .milestone
                  }
                >
                  <div
                    className={
                      styles.rail
                    }
                  >
                    <span
                      className={
                        completed
                          ? styles
                              .doneIcon
                          : overdue
                            ? styles
                                .overdueIcon
                            : styles
                                .normalIcon
                      }
                    >
                      {completed
                        ? (
                          <CheckCircle2
                            size={18}
                          />
                        )
                        : (
                          <CalendarDays
                            size={18}
                          />
                        )}
                    </span>

                    <i />
                  </div>


                  <div
                    className={
                      styles
                        .milestoneCard
                    }
                  >
                    <div
                      className={
                        styles
                          .milestoneTop
                      }
                    >
                      <div>
                        <div
                          className={
                            styles
                              .badges
                          }
                        >
                          <span>
                            {typeLabel(
                              milestone
                                .milestoneType
                            )}
                          </span>

                          <span
                            className={
                              completed
                                ? styles
                                    .doneBadge
                                : overdue
                                  ? styles
                                      .overdueBadge
                                  : styles
                                      .statusBadge
                            }
                          >
                            {completed
                              ? "Klar"
                              : overdue
                                ? "Försenad"
                                : milestone.status ===
                                    "in_progress"
                                  ? "Pågår"
                                  : "Kommande"}
                          </span>
                        </div>

                        <h3>
                          {
                            milestone
                              .title
                          }
                        </h3>
                      </div>


                      <div
                        className={
                          styles
                            .itemActions
                        }
                      >
                        <button
                          type="button"
                          title="Redigera"
                          onClick={() =>
                            editMilestone(
                              milestone
                            )
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          title={
                            completed
                              ? "Återöppna"
                              : "Markera klar"
                          }
                          onClick={() =>
                            toggleDone(
                              milestone
                            )
                          }
                        >
                          <Check
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          title="Ta bort"
                          onClick={() =>
                            remove(
                              milestone
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </div>


                    {milestone.description && (
                      <p
                        className={
                          styles
                            .description
                        }
                      >
                        {
                          milestone
                            .description
                        }
                      </p>
                    )}


                    <div
                      className={
                        styles
                          .meta
                      }
                    >
                      <span>
                        <CalendarDays
                          size={15}
                        />

                        {formatDate(
                          milestone
                            .dueDate
                        )}

                        {milestone.dueTime
                          ? ` · ${milestone.dueTime.slice(
                              0,
                              5
                            )}`
                          : ""}
                      </span>

                      <span>
                        <UserRound
                          size={15}
                        />

                        {milestone
                          .assignedName ??
                          "Ej tilldelad"}
                      </span>

                      <span>
                        {milestone
                          .customerVisible
                          ? (
                            <Eye
                              size={15}
                            />
                          )
                          : (
                            <EyeOff
                              size={15}
                            />
                          )}

                        {milestone
                          .customerVisible
                          ? "Synlig för kund"
                          : "Endast intern"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            }
          )}


          {(deadline ||
            endDate) && (
            <article
              className={
                styles.fixedEvent
              }
            >
              <div
                className={
                  styles.rail
                }
              >
                <span>
                  <Target
                    size={17}
                  />
                </span>
              </div>

              <div
                className={
                  styles.eventContent
                }
              >
                <span
                  className={
                    styles.kicker
                  }
                >
                  Projekt
                </span>

                <h3>
                  Slutleverans
                </h3>

                <p>
                  Projektets nuvarande
                  slutdatum.
                </p>

                <strong>
                  {formatDate(
                    deadline ||
                    endDate
                  )}
                </strong>
              </div>
            </article>
          )}


          {!startDate &&
            milestones.length ===
              0 &&
            !deadline &&
            !endDate && (
              <div
                className={
                  styles.empty
                }
              >
                <CalendarDays
                  size={28}
                />

                <h3>
                  Ingen tidsplan ännu
                </h3>

                <p>
                  Lägg till projektets
                  första milstolpe.
                </p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}