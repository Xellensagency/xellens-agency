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
  TriangleAlert,
  Users,
  Video,
} from "lucide-react";

import {
  createCalendarEventAction,
} from "@/app/dashboard/kalender/actions";

import type {
  CalendarCreateOptions,
  CalendarEventType,
} from "@/lib/dashboard/calendar/calendar-types";

import styles from "./CreateCalendarEventForm.module.css";

type CreateCalendarEventFormProps = {
  options: CalendarCreateOptions;
  defaultDate: string;
};

type EventFormState = {
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

function formatPreviewDate(
  date: string
) {
  if (!date) {
    return "Datum saknas";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}

export default function CreateCalendarEventForm({
  options,
  defaultDate,
}: CreateCalendarEventFormProps) {
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
  ] = useState<EventFormState>({
    title: "",
    eventType: "meeting",
    description: "",

    customerId: "",
    projectId: "",

    date: defaultDate,
    startTime: "09:00",
    endTime: "10:00",

    locationType: "none",
    locationName: "",
    meetingUrl: "",

    reminder: "60",
  });

  const filteredProjects =
    useMemo(() => {
      if (!form.customerId) {
        return options.projects;
      }

      return options.projects.filter(
        (project) =>
          !project.customerId ||
          project.customerId ===
            form.customerId
      );
    }, [
      form.customerId,
      options.projects,
    ]);

  const selectedCustomer =
    options.customers.find(
      (customer) =>
        customer.id ===
        form.customerId
    );

  const selectedProject =
    options.projects.find(
      (project) =>
        project.id ===
        form.projectId
    );

  function updateForm<
    K extends keyof EventFormState
  >(
    field: K,
    value: EventFormState[K]
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
      const currentProject =
        options.projects.find(
          (project) =>
            project.id ===
            current.projectId
        );

      const keepProject =
        !currentProject ||
        !customerId ||
        !currentProject.customerId ||
        currentProject.customerId ===
          customerId;

      return {
        ...current,
        customerId,
        projectId: keepProject
          ? current.projectId
          : "",
      };
    });

    setFeedback(null);
  }

  function handleProjectChange(
    projectId: string
  ) {
    const project =
      options.projects.find(
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

    setFeedback(null);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setFeedback({
        type: "error",
        message:
          "Ange händelsens titel.",
      });

      return;
    }

    if (
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      setFeedback({
        type: "error",
        message:
          "Ange datum, starttid och sluttid.",
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

    if (
      form.locationType ===
        "online" &&
      form.meetingUrl.trim() &&
      !form.meetingUrl
        .trim()
        .startsWith("http")
    ) {
      setFeedback({
        type: "error",
        message:
          "Möteslänken måste börja med http eller https.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await createCalendarEventAction({
            title: form.title,

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
          });

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Händelsen kunde inte sparas.",
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

        <button
          type="button"
          className={styles.saveButton}
          disabled={isSaving}
          onClick={handleSubmit}
        >
          <Save size={17} />

          {isSaving
            ? "Sparar..."
            : "Skapa händelse"}
        </button>
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

          <h1>Ny händelse</h1>

          <p>
            Skapa möten, kundmöten,
            workshops, deadlines och
            uppföljningar.
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

                <p>
                  Titel, händelsetyp och
                  beskrivning.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Händelsens titel
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={form.title}
                  placeholder="Exempel: Projektmöte med kunden"
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
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    )
                  )}
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
                  value={
                    form.description
                  }
                  placeholder="Agenda, information eller anteckningar..."
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

                <p>
                  Ange när händelsen börjar
                  och slutar.
                </p>
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
                  value={
                    form.startTime
                  }
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

                <p>
                  Koppla händelsen till rätt
                  kund eller projekt.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Kund</span>

                <select
                  value={
                    form.customerId
                  }
                  onChange={(event) =>
                    handleCustomerChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Ingen kund
                  </option>

                  {options.customers.map(
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

                <p>
                  Ange fysisk plats,
                  mötesrum eller onlinelänk.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Platstyp</span>

                <select
                  value={
                    form.locationType
                  }
                  onChange={(event) =>
                    updateForm(
                      "locationType",
                      event.target
                        .value as EventFormState["locationType"]
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
                <span>
                  Plats eller mötesrum
                </span>

                <input
                  type="text"
                  value={
                    form.locationName
                  }
                  placeholder={
                    form.locationType ===
                    "online"
                      ? "Exempel: Microsoft Teams"
                      : "Adress eller mötesrum"
                  }
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
                      value={
                        form.meetingUrl
                      }
                      placeholder="https://teams.microsoft.com/..."
                      onChange={(event) =>
                        updateForm(
                          "meetingUrl",
                          event.target
                            .value
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
                <h2>Sammanfattning</h2>

                <p>
                  Kontrollera händelsen före
                  den sparas.
                </p>
              </div>
            </header>

            <div className={styles.previewIcon}>
              {form.locationType ===
              "online" ? (
                <Video size={26} />
              ) : (
                <CalendarDays
                  size={26}
                />
              )}
            </div>

            <h3>
              {form.title.trim() ||
                "Namnlös händelse"}
            </h3>

            <span className={styles.typeBadge}>
              {
                eventTypes.find(
                  (type) =>
                    type.value ===
                    form.eventType
                )?.label
              }
            </span>

            <dl>
              <div>
                <dt>Datum</dt>

                <dd>
                  {formatPreviewDate(
                    form.date
                  )}
                </dd>
              </div>

              <div>
                <dt>Tid</dt>

                <dd>
                  {form.startTime}–
                  {form.endTime}
                </dd>
              </div>

              <div>
                <dt>Kund</dt>

                <dd>
                  {selectedCustomer?.name ||
                    "Ingen kund"}
                </dd>
              </div>

              <div>
                <dt>Projekt</dt>

                <dd>
                  {selectedProject?.name ||
                    "Inget projekt"}
                </dd>
              </div>

              <div>
                <dt>Plats</dt>

                <dd>
                  {form.locationName ||
                    (form.locationType ===
                    "online"
                      ? "Online"
                      : "Ej angiven")}
                </dd>
              </div>
            </dl>

            <div className={styles.readyStatus}>
              <BadgeCheck size={17} />

              <span>
                Redo att läggas in i
                kalendern
              </span>
            </div>
          </section>

          <button
            type="button"
            className={
              styles.mobileSaveButton
            }
            disabled={isSaving}
            onClick={handleSubmit}
          >
            <Save size={17} />

            {isSaving
              ? "Sparar..."
              : "Skapa händelse"}
          </button>
        </aside>
      </div>
    </div>
  );
}
