"use client";

import {
  Bell,
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  Trash2,
  UserRound,
} from "lucide-react";
import type {
  CreateProjectOptions,
  ProjectMilestoneDraft,
} from "@/lib/dashboard/projects/create-project-types";
import styles from "./ProjectSchedule.module.css";

type MilestoneEditorProps = {
  milestone: ProjectMilestoneDraft;
  options: CreateProjectOptions;
  onChange: (
    updates: Partial<ProjectMilestoneDraft>
  ) => void;
  onRemove: () => void;
};

const typeOptions = [
  {
    value: "delivery",
    label: "Leverans",
  },
  {
    value: "feedback",
    label: "Feedback",
  },
  {
    value: "meeting",
    label: "Möte",
  },
  {
    value: "task",
    label: "Uppgift",
  },
  {
    value: "other",
    label: "Annat",
  },
];

const reminderOptions = [
  {
    value: 0,
    label: "Ingen påminnelse",
  },
  {
    value: 30,
    label: "30 minuter innan",
  },
  {
    value: 60,
    label: "1 timme innan",
  },
  {
    value: 180,
    label: "3 timmar innan",
  },
  {
    value: 1440,
    label: "1 dag innan",
  },
  {
    value: 2880,
    label: "2 dagar innan",
  },
  {
    value: 10080,
    label: "1 vecka innan",
  },
];

export default function MilestoneEditor({
  milestone,
  options,
  onChange,
  onRemove,
}: MilestoneEditorProps) {
  return (
    <article className={styles.milestone}>
      <div className={styles.timelineMarker}>
        <span />
      </div>

      <div className={styles.milestoneContent}>
        <div className={styles.milestoneHeading}>
          <div>
            <strong>
              {milestone.title ||
                "Namnlös deadline"}
            </strong>

            <span>
              {milestone.dueDate ||
                "Datum saknas"}
              {milestone.dueTime
                ? ` · ${milestone.dueTime}`
                : ""}
            </span>
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={`Ta bort ${milestone.title}`}
          >
            <Trash2
              size={17}
              strokeWidth={1.7}
            />
          </button>
        </div>

        <div className={styles.editorGrid}>
          <label
            className={styles.titleField}
          >
            <span>Titel</span>

            <input
              type="text"
              value={milestone.title}
              onChange={(event) =>
                onChange({
                  title: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Typ</span>

            <select
              value={milestone.milestoneType}
              onChange={(event) =>
                onChange({
                  milestoneType:
                    event.target
                      .value as ProjectMilestoneDraft["milestoneType"],
                })
              }
            >
              {typeOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              <CalendarDays
                size={13}
                strokeWidth={1.7}
              />
              Datum
            </span>

            <input
              type="date"
              value={milestone.dueDate}
              onChange={(event) =>
                onChange({
                  dueDate: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>
              <Clock3
                size={13}
                strokeWidth={1.7}
              />
              Tid
            </span>

            <input
              type="time"
              value={milestone.dueTime}
              onChange={(event) =>
                onChange({
                  dueTime: event.target.value,
                })
              }
            />
          </label>

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
                milestone.assignedTo ?? ""
              }
              onChange={(event) =>
                onChange({
                  assignedTo:
                    event.target.value ||
                    null,
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
            <span>
              <Bell
                size={13}
                strokeWidth={1.7}
              />
              Påminnelse
            </span>

            <select
              value={
                milestone.reminderMinutes
              }
              onChange={(event) =>
                onChange({
                  reminderMinutes: Number(
                    event.target.value
                  ),
                })
              }
            >
              {reminderOptions.map(
                (option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>

          <label
            className={styles.descriptionField}
          >
            <span>Beskrivning</span>

            <textarea
              rows={3}
              value={milestone.description}
              onChange={(event) =>
                onChange({
                  description:
                    event.target.value,
                })
              }
              placeholder="Vad ska vara klart eller levereras?"
            />
          </label>
        </div>

        <button
          type="button"
          className={`${styles.visibilityButton} ${
            milestone.customerVisible
              ? styles.visible
              : ""
          }`}
          onClick={() =>
            onChange({
              customerVisible:
                !milestone.customerVisible,
            })
          }
        >
          {milestone.customerVisible ? (
            <Eye
              size={15}
              strokeWidth={1.8}
            />
          ) : (
            <EyeOff
              size={15}
              strokeWidth={1.8}
            />
          )}

          {milestone.customerVisible
            ? "Synlig för kunden"
            : "Dold för kunden"}
        </button>
      </div>
    </article>
  );
}
