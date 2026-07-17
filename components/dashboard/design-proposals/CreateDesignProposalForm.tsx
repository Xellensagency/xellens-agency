"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ExternalLink,
  FileImage,
  Send,
  UploadCloud,
} from "lucide-react";

import {
  createDesignProposalAction,
  initialCreateDesignProposalState,
} from "@/app/dashboard/designforslag/actions";

import type {
  DesignProposalProjectOption,
} from "@/lib/dashboard/design-proposals/get-design-proposal-project-options";

import styles from "./CreateDesignProposalForm.module.css";

type CreateDesignProposalFormProps = {
  projects:
    DesignProposalProjectOption[];
};

export default function CreateDesignProposalForm({
  projects,
}: CreateDesignProposalFormProps) {
  const formRef =
    useRef<HTMLFormElement>(
      null
    );

  const [
    fileNames,
    setFileNames,
  ] = useState<string[]>([]);

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    createDesignProposalAction,
    initialCreateDesignProposalState
  );

  useEffect(() => {
    if (
      state.status ===
      "success"
    ) {
      formRef.current?.reset();
      setFileNames([]);
    }
  }, [
    state.status,
    state.message,
  ]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={styles.form}
    >
      <div className={styles.fieldGrid}>
        <label className={styles.fullField}>
          <span>
            Projekt
          </span>

          <select
            name="projectId"
            required
            defaultValue=""
          >
            <option
              value=""
              disabled
            >
              Välj projekt
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.projectNumber} –{" "}
                  {project.title} –{" "}
                  {project.customerName}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span>
            Titel
          </span>

          <input
            name="title"
            placeholder="Exempel: Designförslag startsida"
            required
          />
        </label>

        <label>
          <span>
            Versionsnamn
          </span>

          <input
            name="versionLabel"
            defaultValue="Version 1"
            placeholder="Version 1"
            required
          />
        </label>

        <label className={styles.fullField}>
          <span>
            Meddelande till kunden
          </span>

          <textarea
            name="summary"
            rows={5}
            placeholder="Beskriv vad kunden ska granska och vad som har förändrats."
          />
        </label>

        <label className={styles.fullField}>
          <span>
            Figma- eller prototyplänk
          </span>

          <div className={styles.inputWithIcon}>
            <ExternalLink
              size={19}
              strokeWidth={1.7}
            />

            <input
              type="url"
              name="externalUrl"
              placeholder="https://..."
            />
          </div>
        </label>
      </div>

      <label className={styles.uploadArea}>
        <UploadCloud
          size={34}
          strokeWidth={1.5}
        />

        <strong>
          Ladda upp designfiler
        </strong>

        <span>
          PNG, JPG, WEBP eller PDF.
          Högst 8 filer och 50 MB
          per fil.
        </span>

        <input
          type="file"
          name="files"
          accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
          multiple
          onChange={(event) => {
            setFileNames(
              Array.from(
                event.target.files ??
                []
              ).map(
                (file) =>
                  file.name
              )
            );
          }}
        />
      </label>

      {fileNames.length > 0 && (
        <div className={styles.fileList}>
          {fileNames.map(
            (fileName) => (
              <div key={fileName}>
                <FileImage
                  size={18}
                  strokeWidth={1.7}
                />

                <span>
                  {fileName}
                </span>
              </div>
            )
          )}
        </div>
      )}

      <label className={styles.publishOption}>
        <input
          type="checkbox"
          name="publishNow"
          value="yes"
          defaultChecked
        />

        <span>
          <strong>
            Publicera direkt i
            kundportalen
          </strong>

          <small>
            Kunden kan se och lämna
            feedback på förslaget direkt.
          </small>
        </span>
      </label>

      {state.message && (
        <div
          className={`${styles.message} ${
            state.status ===
            "success"
              ? styles.success
              : styles.error
          }`}
          role="status"
        >
          {state.message}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={
            pending ||
            projects.length === 0
          }
        >
          <Send
            size={19}
            strokeWidth={1.8}
          />

          {pending
            ? "Laddar upp..."
            : "Spara designförslag"}
        </button>
      </div>
    </form>
  );
}
