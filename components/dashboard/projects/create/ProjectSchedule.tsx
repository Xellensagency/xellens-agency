"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  Clock3,
  Plus,
} from "lucide-react";
import type {
  CreateProjectOptions,
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectMilestoneType,
} from "@/lib/dashboard/projects/create-project-types";
import MilestoneEditor from "./MilestoneEditor";
import styles from "./ProjectSchedule.module.css";

type ProjectScheduleProps = {
  options: CreateProjectOptions;
  draft: ProjectDraft;
  milestones: ProjectMilestoneDraft[];
  onDraftChange: (
    field: "startDate" | "endDate",
    value: string
  ) => void;
  onChange: (
    milestones: ProjectMilestoneDraft[]
  ) => void;
};

type NewMilestoneForm = {
  title: string;
  description: string;
  milestoneType: ProjectMilestoneType;
  dueDate: string;
  dueTime: string;
  assignedTo: string;
  reminderMinutes: string;
  customerVisible: boolean;
};

function getLocalDate() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

function createMilestoneId() {
  return crypto.randomUUID();
}

function createInitialForm(
  draft: ProjectDraft
): NewMilestoneForm {
  return {
    title: "",
    description: "",
    milestoneType: "delivery",
    dueDate:
      draft.endDate ||
      draft.startDate ||
      getLocalDate(),
    dueTime: "12:00",
    assignedTo: "",
    reminderMinutes: "1440",
    customerVisible: true,
  };
}

export default function ProjectSchedule({
  options,
  draft,
  milestones,
  onDraftChange,
  onChange,
}: ProjectScheduleProps) {
  const [form, setForm] =
    useState<NewMilestoneForm>(
      createInitialForm(draft)
    );

  const sortedMilestones = useMemo(
    () =>
      [...milestones].sort((first, second) => {
        const firstValue =
          `${first.dueDate}T${
            first.dueTime || "00:00"
          }`;

        const secondValue =
          `${second.dueDate}T${
            second.dueTime || "00:00"
          }`;

        return firstValue.localeCompare(
          secondValue
        );
      }),
    [milestones]
  );

  function updateForm(
    updates: Partial<NewMilestoneForm>
  ) {
    setForm((current) => ({
      ...current,
      ...updates,
    }));
  }

  function addMilestone() {
    const title = form.title.trim();

    if (!title || !form.dueDate) {
      return;
    }

    const milestone: ProjectMilestoneDraft = {
      id: createMilestoneId(),
      title,
      description:
        form.description.trim(),
      milestoneType:
        form.milestoneType,
      status: "pending",
      dueDate: form.dueDate,
      dueTime: form.dueTime || "12:00",
      assignedTo:
        form.assignedTo || null,
      reminderMinutes:
        Number(form.reminderMinutes) || 0,
      customerVisible:
        form.customerVisible,
    };

    onChange([
      ...milestones,
      milestone,
    ]);

    setForm({
      ...createInitialForm(draft),
      dueDate: form.dueDate,
      assignedTo: form.assignedTo,
      reminderMinutes:
        form.reminderMinutes,
    });
  }

  function updateMilestone(
    id: string,
    updates: Partial<ProjectMilestoneDraft>
  ) {
    onChange(
      milestones.map((milestone) =>
        milestone.id === id
          ? {
              ...milestone,
              ...updates,
            }
          : milestone
      )
    );
  }

  function removeMilestone(id: string) {
    onChange(
      milestones.filter(
        (milestone) =>
          milestone.id !== id
      )
    );
  }

  const durationText =
    draft.startDate && draft.endDate
      ? `${draft.startDate} → ${draft.endDate}`
      : "Projektperioden är inte komplett";

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>3.</span>

          <div>
            <h2>
              Tidsplan och deadlines
            </h2>

            <p>
              Planera projektperiod,
              leveranser, feedback och möten.
            </p>
          </div>
        </div>

        <strong>
          {milestones.length}{" "}
          {milestones.length === 1
            ? "deadline"
            : "deadlines"}
        </strong>
      </header>

      <section className={styles.periodPanel}>
        <div className={styles.periodIntro}>
          <CalendarRange
            size={23}
            strokeWidth={1.6}
          />

          <div>
            <strong>Projektperiod</strong>
            <span>{durationText}</span>
          </div>
        </div>

        <label>
          <span>Startdatum</span>

          <input
            type="date"
            value={draft.startDate}
            onChange={(event) =>
              onDraftChange(
                "startDate",
                event.target.value
              )
            }
          />
        </label>

        <label>
          <span>Förväntat slutdatum</span>

          <input
            type="date"
            value={draft.endDate}
            min={
              draft.startDate ||
              undefined
            }
            onChange={(event) =>
              onDraftChange(
                "endDate",
                event.target.value
              )
            }
          />
        </label>
      </section>

      <section className={styles.addSection}>
        <header>
          <div>
            <h3>Lägg till deadline</h3>

            <p>
              Exempelvis designleverans,
              kundfeedback eller slutmöte.
            </p>
          </div>

          <Clock3
            size={22}
            strokeWidth={1.5}
          />
        </header>

        <div className={styles.addGrid}>
          <label
            className={styles.titleField}
          >
            <span>
              Titel <em>*</em>
            </span>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateForm({
                  title: event.target.value,
                })
              }
              placeholder="Exempel: Första designleveransen"
            />
          </label>

          <label>
            <span>Typ</span>

            <select
              value={form.milestoneType}
              onChange={(event) =>
                updateForm({
                  milestoneType:
                    event.target
                      .value as ProjectMilestoneType,
                })
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
            <span>Datum</span>

            <input
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                updateForm({
                  dueDate:
                    event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Tid</span>

            <input
              type="time"
              value={form.dueTime}
              onChange={(event) =>
                updateForm({
                  dueTime:
                    event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Ansvarig</span>

            <select
              value={form.assignedTo}
              onChange={(event) =>
                updateForm({
                  assignedTo:
                    event.target.value,
                })
              }
            >
              <option value="">
                Ej tilldelad
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

          <label>
            <span>Påminnelse</span>

            <select
              value={form.reminderMinutes}
              onChange={(event) =>
                updateForm({
                  reminderMinutes:
                    event.target.value,
                })
              }
            >
              <option value="0">
                Ingen påminnelse
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
              styles.descriptionField
            }
          >
            <span>Beskrivning</span>

            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                updateForm({
                  description:
                    event.target.value,
                })
              }
              placeholder="Beskriv vad som ska vara klart."
            />
          </label>

          <label
            className={styles.checkbox}
          >
            <input
              type="checkbox"
              checked={
                form.customerVisible
              }
              onChange={(event) =>
                updateForm({
                  customerVisible:
                    event.target.checked,
                })
              }
            />

            <span>
              Visa deadlinen för kunden
            </span>
          </label>
        </div>

        <button
          type="button"
          className={styles.addButton}
          disabled={
            !form.title.trim() ||
            !form.dueDate
          }
          onClick={addMilestone}
        >
          <Plus
            size={17}
            strokeWidth={1.8}
          />

          Lägg till i tidsplanen
        </button>
      </section>

      <section className={styles.timelineSection}>
        <header>
          <div>
            <h3>Projektets tidsplan</h3>

            <p>
              Alla deadlines kan redigeras
              innan projektet skapas.
            </p>
          </div>
        </header>

        {sortedMilestones.length === 0 ? (
          <div className={styles.emptyState}>
            <CalendarRange
              size={31}
              strokeWidth={1.4}
            />

            <strong>
              Inga deadlines ännu
            </strong>

            <p>
              Lägg till projektets första
              leverans, möte eller uppgift.
            </p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {sortedMilestones.map(
              (milestone) => (
                <MilestoneEditor
                  key={milestone.id}
                  milestone={milestone}
                  options={options}
                  onChange={(updates) =>
                    updateMilestone(
                      milestone.id,
                      updates
                    )
                  }
                  onRemove={() =>
                    removeMilestone(
                      milestone.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
}

