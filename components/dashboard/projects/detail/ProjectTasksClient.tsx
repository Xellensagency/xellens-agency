"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  addChecklistItemAction,
  createProjectTaskAction,
  deleteProjectTaskAction,
  toggleChecklistItemAction,
  updateProjectTaskStatusAction,
} from "@/app/dashboard/projekt/[id]/uppgifter/actions";

import styles from "./ProjectTasksClient.module.css";


type TeamMember = {
  id: string;
  full_name: string;
};


type ChecklistItem = {
  id: string;
  title: string;
  is_completed: boolean;
};


type Task = {
  id: string;
  title: string;
  description: string | null;

  status:
    | "todo"
    | "in_progress"
    | "blocked"
    | "done";

  priority:
    | "low"
    | "normal"
    | "high"
    | "urgent";

  due_date: string | null;

  assignee_id: string | null;

  assignee:
    | {
        full_name: string;
      }
    | null;

  checklist:
    ChecklistItem[];
};


type Props = {
  projectId: string;
  tasks: Task[];
  teamMembers: TeamMember[];
};


const statusLabels = {
  todo: "Att göra",
  in_progress: "Pågår",
  blocked: "Blockerad",
  done: "Klar",
};


const priorityLabels = {
  low: "Låg",
  normal: "Normal",
  high: "Hög",
  urgent: "Brådskande",
};


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
        (part) =>
          part[0]
      )
      .join("")
      .toUpperCase() ||
    "VO"
  );
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "Ingen deadline";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      `${value}T12:00:00`
    )
  );
}


export default function ProjectTasksClient({
  projectId,
  tasks,
  teamMembers,
}: Props) {
  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const todoCount =
    tasks.filter(
      (task) =>
        task.status === "todo"
    ).length;

  const progressCount =
    tasks.filter(
      (task) =>
        task.status ===
        "in_progress"
    ).length;

  const blockedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "blocked"
    ).length;

  const doneCount =
    tasks.filter(
      (task) =>
        task.status === "done"
    ).length;


  function handleCreate(
    formData: FormData
  ) {
    setError("");

    const title =
      String(
        formData.get(
          "title"
        ) ?? ""
      );

    const description =
      String(
        formData.get(
          "description"
        ) ?? ""
      );

    const priority =
      String(
        formData.get(
          "priority"
        ) ?? "normal"
      ) as
        | "low"
        | "normal"
        | "high"
        | "urgent";

    const dueDate =
      String(
        formData.get(
          "dueDate"
        ) ?? ""
      );

    const assigneeId =
      String(
        formData.get(
          "assigneeId"
        ) ?? ""
      );

    startTransition(
      async () => {
        const result =
          await createProjectTaskAction({
            projectId,
            title,
            description,
            priority,
            dueDate,
            assigneeId,
          });

        if (!result.ok) {
          setError(
            result.error
          );

          return;
        }

        setCreating(false);
      }
    );
  }


  return (
    <div className={styles.workspace}>
      <section className={styles.stats}>
        <article>
          <span className={styles.todoIcon}>
            <Circle size={18} />
          </span>

          <div>
            <small>
              Att göra
            </small>

            <strong>
              {todoCount}
            </strong>
          </div>
        </article>

        <article>
          <span className={styles.progressIcon}>
            <Clock3 size={18} />
          </span>

          <div>
            <small>
              Pågår
            </small>

            <strong>
              {progressCount}
            </strong>
          </div>
        </article>

        <article>
          <span className={styles.blockedIcon}>
            <AlertTriangle size={18} />
          </span>

          <div>
            <small>
              Blockerade
            </small>

            <strong>
              {blockedCount}
            </strong>
          </div>
        </article>

        <article>
          <span className={styles.doneIcon}>
            <CheckCircle2 size={18} />
          </span>

          <div>
            <small>
              Klara
            </small>

            <strong>
              {doneCount}
            </strong>
          </div>
        </article>
      </section>


      <section className={styles.toolbar}>
        <div>
          <span>
            Projektarbete
          </span>

          <h2>
            Uppgifter
          </h2>

          <p>
            Planera arbetet, tilldela ansvar
            och följ vad som är klart.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            setCreating(
              (current) =>
                !current
            )
          }
        >
          <Plus size={18} />

          Ny uppgift
        </button>
      </section>


      {creating && (
        <form
          action={handleCreate}
          className={styles.createCard}
        >
          <div className={styles.createHeader}>
            <div>
              <span>
                Ny uppgift
              </span>

              <h3>
                Lägg till arbete i projektet
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setCreating(false)
              }
              className={styles.closeButton}
            >
              Avbryt
            </button>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.fullField}>
              <span>
                Uppgift *
              </span>

              <input
                name="title"
                placeholder="Exempel: Skapa design för startsidan"
                required
              />
            </label>

            <label className={styles.fullField}>
              <span>
                Beskrivning
              </span>

              <textarea
                name="description"
                placeholder="Vad ska göras och vad behöver teamet veta?"
              />
            </label>

            <label>
              <span>
                Ansvarig
              </span>

              <select name="assigneeId">
                <option value="">
                  Ej tilldelad
                </option>

                {teamMembers.map(
                  (member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.full_name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>
                Prioritet
              </span>

              <select
                name="priority"
                defaultValue="normal"
              >
                <option value="low">
                  Låg
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="high">
                  Hög
                </option>

                <option value="urgent">
                  Brådskande
                </option>
              </select>
            </label>

            <label>
              <span>
                Deadline
              </span>

              <input
                type="date"
                name="dueDate"
              />
            </label>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={pending}
            >
              <Plus size={17} />

              {pending
                ? "Skapar..."
                : "Skapa uppgift"}
            </button>
          </div>
        </form>
      )}


      {tasks.length === 0 ? (
        <section className={styles.empty}>
          <span>
            <ListChecks
              size={28}
            />
          </span>

          <h3>
            Inga uppgifter ännu
          </h3>

          <p>
            Lägg till projektets första
            uppgift för att börja planera
            arbetet.
          </p>

          <button
            type="button"
            onClick={() =>
              setCreating(true)
            }
          >
            <Plus size={17} />

            Skapa första uppgiften
          </button>
        </section>
      ) : (
        <section className={styles.taskList}>
          {tasks.map(
            (task) => {
              const completedItems =
                task.checklist.filter(
                  (item) =>
                    item.is_completed
                ).length;

              const checklistProgress =
                task.checklist.length > 0
                  ? Math.round(
                      (
                        completedItems /
                        task.checklist.length
                      ) *
                        100
                    )
                  : 0;

              return (
                <article
                  key={task.id}
                  className={`${styles.taskCard} ${
                    task.status === "done"
                      ? styles.completedTask
                      : ""
                  }`}
                >
                  <div className={styles.taskTop}>
                    <div className={styles.taskTitle}>
                      <span
                        className={`${styles.statusDot} ${
                          styles[
                            `status_${task.status}`
                          ]
                        }`}
                      />

                      <div>
                        <h3>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      title="Ta bort uppgift"
                      onClick={() =>
                        startTransition(
                          async () => {
                            await deleteProjectTaskAction(
                              projectId,
                              task.id
                            );
                          }
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>


                  <div className={styles.meta}>
                    <label className={styles.statusSelect}>
                      <span>
                        Status
                      </span>

                      <select
                        value={task.status}
                        onChange={(event) => {
                          const status =
                            event.target.value as
                              | "todo"
                              | "in_progress"
                              | "blocked"
                              | "done";

                          startTransition(
                            async () => {
                              await updateProjectTaskStatusAction(
                                projectId,
                                task.id,
                                status
                              );
                            }
                          );
                        }}
                      >
                        {Object.entries(
                          statusLabels
                        ).map(
                          ([
                            value,
                            label,
                          ]) => (
                            <option
                              key={value}
                              value={value}
                            >
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <div className={styles.metaItem}>
                      <CalendarDays size={16} />

                      <div>
                        <span>
                          Deadline
                        </span>

                        <strong>
                          {formatDate(
                            task.due_date
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <UserRound size={16} />

                      <div>
                        <span>
                          Ansvarig
                        </span>

                        <strong>
                          {task.assignee
                            ?.full_name ??
                            "Ej tilldelad"}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.priority}>
                      <span>
                        Prioritet
                      </span>

                      <strong
                        className={
                          styles[
                            `priority_${task.priority}`
                          ]
                        }
                      >
                        {
                          priorityLabels[
                            task.priority
                          ]
                        }
                      </strong>
                    </div>
                  </div>


                  <div className={styles.checklist}>
                    <header>
                      <div>
                        <ListChecks size={17} />

                        <strong>
                          Checklista
                        </strong>
                      </div>

                      <span>
                        {completedItems}/
                        {task.checklist.length}
                      </span>
                    </header>

                    {task.checklist.length > 0 && (
                      <div className={styles.checkProgress}>
                        <span
                          style={{
                            width:
                              `${checklistProgress}%`,
                          }}
                        />
                      </div>
                    )}

                    <div className={styles.checkItems}>
                      {task.checklist.map(
                        (item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`${styles.checkItem} ${
                              item.is_completed
                                ? styles.checked
                                : ""
                            }`}
                            onClick={() =>
                              startTransition(
                                async () => {
                                  await toggleChecklistItemAction(
                                    projectId,
                                    item.id,
                                    !item.is_completed
                                  );
                                }
                              )
                            }
                          >
                            <span className={styles.checkbox}>
                              {item.is_completed && (
                                <Check size={13} />
                              )}
                            </span>

                            <span>
                              {item.title}
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    <form
                      className={styles.addChecklist}
                      action={(formData) => {
                        const title =
                          String(
                            formData.get(
                              "checkTitle"
                            ) ?? ""
                          );

                        startTransition(
                          async () => {
                            await addChecklistItemAction(
                              projectId,
                              task.id,
                              title
                            );
                          }
                        );
                      }}
                    >
                      <input
                        name="checkTitle"
                        placeholder="Lägg till punkt..."
                        required
                      />

                      <button
                        type="submit"
                        disabled={pending}
                      >
                        <Plus size={16} />
                      </button>
                    </form>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </div>
  );
}