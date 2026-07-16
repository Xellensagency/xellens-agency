"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  FileText,
  Link2,
  MapPin,
  Save,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  deleteCalendarEventAction,
  updateCalendarEventAction,
} from "@/app/dashboard/kalender/actions";

import type {
  CalendarEventEditData,
  CalendarEventType,
} from "@/lib/dashboard/calendar/calendar-types";

import styles from "../create/CreateCalendarEventForm.module.css";

type EditCalendarEventFormProps = {
  data: CalendarEventEditData;
};

type FormState = {
  title: string;
  eventType: CalendarEventType;
  description: string;

  customerId: string;
  projectId: string;

  date: string;
  startTime: string;
  endTime: string;

  locationType:
    | "none"
    | "physical"
    | "online"
    | "meeting_room";

  locationName: string;
  meetingUrl: string;

  reminder: string;

  status:
    | "scheduled"
    | "completed"
    | "cancelled";
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const eventTypes: Array<{
  value: CalendarEventType;
  label: string;
}> = [
  {
    value: "meeting",
    label: "Möte",
  },
  {
    value: "customer_meeting",
    label: "Kundmöte",
  },
  {
    value: "workshop",
    label: "Workshop",
  },
  {
    value: "deadline",
    label: "Deadline",
  },
  {
    value: "follow_up",
    label: "Uppföljning",
  },
  {
    value: "internal",
    label: "Internt",
  },
];

function localDateValue(
  value: string
) {
  const date = new Date(value);

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function localTimeValue(
  value: string
) {
  const date = new Date(value);

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export default function EditCalendarEventForm({
  data,
}: EditCalendarEventFormProps) {
  const router = useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<FormState>({
    title: data.event.title,

    eventType:
      data.event.eventType,

    description:
      data.event.description || "",

    customerId:
      data.event.customerId || "",

    projectId:
      data.event.projectId || "",

    date:
      localDateValue(
        data.event.startAt
      ),

    startTime:
      localTimeValue(
        data.event.startAt
      ),

    endTime:
      localTimeValue(
        data.event.endAt
      ),

    locationType:
      data.event.locationType,

    locationName:
      data.event.locationName || "",

    meetingUrl:
      data.event.meetingUrl || "",

    reminder: String(
      data.event
        .reminderMinutes[0] ?? 60
    ),

    status:
      data.event.status,
  });

  const filteredProjects =
    useMemo(() => {
      if (!form.customerId) {
        return data.options.projects;
      }

      return data.options.projects.filter(
        (project) =>
          !project.customerId ||
          project.customerId ===
            form.customerId
      );
    }, [
      data.options.projects,
      form.customerId,
    ]);

  function updateForm<
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function handleCustomerChange(
    customerId: string
  ) {
    setForm((current) => {
      const project =
        data.options.projects.find(
          (item) =>
            item.id ===
            current.projectId
        );

      return {
        ...current,
        customerId,

        projectId:
          project &&
          customerId &&
          project.customerId &&
          project.customerId !==
            customerId
            ? ""
            : current.projectId,
      };
    });
  }

  function handleProjectChange(
    projectId: string
  ) {
    const project =
      data.options.projects.find(
        (item) =>
          item.id === projectId
      );

    setForm((current) => ({
      ...current,
      projectId,

      customerId:
        project?.customerId ||
        current.customerId,
    }));
  }

  function handleSave() {
    if (!form.title.trim()) {
      setFeedback({
        type: "error",
        message:
          "Ange händelsens titel.",
      });

      return;
    }

    const startDate =
      new Date(
        `${form.date}T${form.startTime}:00`
      );

    const endDate =
      new Date(
        `${form.date}T${form.endTime}:00`
      );

    if (
      endDate.getTime() <=
      startDate.getTime()
    ) {
      setFeedback({
        type: "error",
        message:
          "Sluttiden måste vara efter starttiden.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await updateCalendarEventAction({
            eventId:
              data.event.id,

            title:
              form.title,

            eventType:
              form.eventType,

            description:
              form.description,

            customerId:
              form.customerId,

            projectId:
              form.projectId,

            startAt:
              startDate.toISOString(),

            endAt:
              endDate.toISOString(),

            locationType:
              form.locationType,

            locationName:
              form.locationName,

            meetingUrl:
              form.meetingUrl,

            reminderMinutes: [
              Number(
                form.reminder
              ) || 60,
            ],

            status:
              form.status,
          });

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Händelsen kunde inte uppdateras.",
          });

          return;
        }

        setFeedback({
          type: "success",
          message:
            "Händelsen är uppdaterad.",
        });

        router.refresh();
      })();
    });
  }

  function handleDelete() {
    const confirmed =
      window.confirm(
        `Vill du verkligen ta bort "${data.event.title}"?`
      );

    if (!confirmed) {
      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await deleteCalendarEventAction(
            data.event.id
          );

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Händelsen kunde inte tas bort.",
          });

          return;
        }

        router.push(
          "/dashboard/kalender"
        );

        router.refresh();
      })();
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link
          href="/dashboard/kalender"
          className={styles.backButton}
        >
          <ArrowLeft size={17} />
          Till kalendern
        </Link>

        <div
          className={
            styles.topbarActions
          }
        >
          <button
            type="button"
            className={
              styles.deleteButton
            }
            disabled={isSaving}
            onClick={handleDelete}
          >
            <Trash2 size={17} />
            Ta bort
          </button>

          <button
            type="button"
            className={styles.saveButton}
            disabled={isSaving}
            onClick={handleSave}
          >
            <Save size={17} />

            {isSaving
              ? "Sparar..."
              : "Spara ändringar"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={[
            styles.feedback,
            feedback.type ===
            "success"
              ? styles.success
              : styles.error,
          ].join(" ")}
        >
          {feedback.type ===
          "success" ? (
            <BadgeCheck size={18} />
          ) : (
            <TriangleAlert
              size={18}
            />
          )}

          <span>
            {feedback.message}
          </span>
        </div>
      )}

      <section className={styles.hero}>
        <span>
          <CalendarDays size={23} />
        </span>

        <div>
          <small>Kalender</small>

          <h1>Redigera händelse</h1>

          <p>
            Uppdatera tid, kund, projekt,
            plats och status.
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <section className={styles.card}>
            <header>
              <FileText size={19} />

              <div>
                <h2>Grunduppgifter</h2>
                <p>Titel, typ och status.</p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label
                className={
                  styles.fullWidth
                }
              >
                <span>Händelsens titel</span>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Händelsetyp</span>

                <select
                  value={form.eventType}
                  onChange={(event) =>
                    updateForm(
                      "eventType",
                      event.target
                        .value as CalendarEventType
                    )
                  }
                >
                  {eventTypes.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Status</span>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target
                        .value as FormState["status"]
                    )
                  }
                >
                  <option value="scheduled">
                    Planerad
                  </option>

                  <option value="completed">
                    Genomförd
                  </option>

                  <option value="cancelled">
                    Inställd
                  </option>
                </select>
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>Beskrivning</span>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <Clock3 size={19} />

              <div>
                <h2>Datum och tid</h2>
                <p>Ändra start och slut.</p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Datum</span>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateForm(
                      "date",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Starttid</span>

                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    updateForm(
                      "startTime",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Sluttid</span>

                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    updateForm(
                      "endTime",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Påminnelse</span>

                <select
                  value={form.reminder}
                  onChange={(event) =>
                    updateForm(
                      "reminder",
                      event.target.value
                    )
                  }
                >
                  <option value="15">
                    15 minuter före
                  </option>

                  <option value="30">
                    30 minuter före
                  </option>

                  <option value="60">
                    1 timme före
                  </option>

                  <option value="1440">
                    1 dag före
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <Users size={19} />

              <div>
                <h2>Kund och projekt</h2>
                <p>Ändra kopplingarna.</p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Kund</span>

                <select
                  value={form.customerId}
                  onChange={(event) =>
                    handleCustomerChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Ingen kund
                  </option>

                  {data.options.customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Projekt</span>

                <select
                  value={form.projectId}
                  onChange={(event) =>
                    handleProjectChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Inget projekt
                  </option>

                  {filteredProjects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <MapPin size={19} />

              <div>
                <h2>Plats</h2>
                <p>Fysisk eller digital.</p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Platstyp</span>

                <select
                  value={form.locationType}
                  onChange={(event) =>
                    updateForm(
                      "locationType",
                      event.target
                        .value as FormState["locationType"]
                    )
                  }
                >
                  <option value="none">
                    Ingen plats
                  </option>

                  <option value="physical">
                    Fysisk plats
                  </option>

                  <option value="meeting_room">
                    Mötesrum
                  </option>

                  <option value="online">
                    Online
                  </option>
                </select>
              </label>

              <label>
                <span>Platsnamn</span>

                <input
                  value={form.locationName}
                  onChange={(event) =>
                    updateForm(
                      "locationName",
                      event.target.value
                    )
                  }
                />
              </label>

              {form.locationType ===
                "online" && (
                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>Möteslänk</span>

                  <div
                    className={
                      styles.iconInput
                    }
                  >
                    <Link2 size={16} />

                    <input
                      type="url"
                      value={form.meetingUrl}
                      onChange={(event) =>
                        updateForm(
                          "meetingUrl",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </label>
              )}
            </div>
          </section>
        </main>

        <aside className={styles.summaryColumn}>
          <section className={styles.summaryCard}>
            <header>
              <CalendarDays size={19} />

              <div>
                <h2>Händelsen</h2>
                <p>Aktuell sammanfattning.</p>
              </div>
            </header>

            <div className={styles.previewIcon}>
              <CalendarDays size={26} />
            </div>

            <h3>
              {form.title ||
                "Namnlös händelse"}
            </h3>

            <span className={styles.typeBadge}>
              {
                eventTypes.find(
                  (item) =>
                    item.value ===
                    form.eventType
                )?.label
              }
            </span>

            <dl>
              <div>
                <dt>Datum</dt>
                <dd>{form.date}</dd>
              </div>

              <div>
                <dt>Tid</dt>
                <dd>
                  {form.startTime}–
                  {form.endTime}
                </dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{form.status}</dd>
              </div>
            </dl>

            <div className={styles.readyStatus}>
              <BadgeCheck size={17} />
              Redo att uppdateras
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
