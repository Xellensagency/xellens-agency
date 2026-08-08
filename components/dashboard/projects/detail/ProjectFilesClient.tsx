"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  Check,
  Download,
  Eye,
  EyeOff,
  File,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  deleteProjectFileAction,
  toggleProjectFileVisibilityAction,
  uploadProjectFilesAction,
} from "@/app/dashboard/projekt/[id]/filer/actions";

import styles from "./ProjectFilesClient.module.css";


type ProjectFile = {
  id: string;
  folder: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  customer_visible: boolean;
  created_at: string;

  uploaded_by_name:
    string | null;

  signed_url:
    string | null;
};


type Props = {
  projectId: string;

  files:
    ProjectFile[];
};


const folders = [
  {
    value: "all",
    label: "Alla filer",
  },
  {
    value: "customer",
    label: "Kundmaterial",
  },
  {
    value: "design",
    label: "Design",
  },
  {
    value: "delivery",
    label: "Leveranser",
  },
  {
    value: "agreement",
    label: "Avtal",
  },
  {
    value: "other",
    label: "Övrigt",
  },
];


const folderLabels:
Record<string, string> = {
  customer:
    "Kundmaterial",

  design:
    "Design",

  delivery:
    "Leveranser",

  agreement:
    "Avtal",

  other:
    "Övrigt",
};


function formatSize(
  bytes: number
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}


function getFileIcon(
  mimeType:
    string | null,
  fileName: string
) {
  if (
    mimeType?.startsWith(
      "image/"
    )
  ) {
    return FileImage;
  }

  if (
    mimeType ===
      "application/pdf" ||
    fileName
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    return FileText;
  }

  if (
    fileName
      .toLowerCase()
      .endsWith(".zip") ||
    fileName
      .toLowerCase()
      .endsWith(".rar")
  ) {
    return FileArchive;
  }

  return File;
}


export default function ProjectFilesClient({
  projectId,
  files,
}: Props) {
  const [
    folder,
    setFolder,
  ] =
    useState("all");

  const [
    uploadOpen,
    setUploadOpen,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const filteredFiles =
    useMemo(
      () =>
        folder === "all"
          ? files
          : files.filter(
              (file) =>
                file.folder ===
                folder
            ),
      [
        files,
        folder,
      ]
    );


  function handleUpload(
    formData: FormData
  ) {
    setError("");
    setSuccess("");

    formData.set(
      "projectId",
      projectId
    );

    startTransition(
      async () => {
        const result =
          await uploadProjectFilesAction(
            formData
          );

        if (!result.ok) {
          setError(result.error ?? "Åtgärden kunde inte genomföras.");

          return;
        }

        setSuccess(
          result.count === 1
            ? "Filen är uppladdad."
            : `${result.count} filer är uppladdade.`
        );

        setUploadOpen(
          false
        );
      }
    );
  }


  return (
    <div className={styles.workspace}>
      <section className={styles.summary}>
        <article>
          <span>
            <FolderOpen size={20} />
          </span>

          <div>
            <small>
              Totalt
            </small>

            <strong>
              {files.length}
            </strong>

            <p>filer</p>
          </div>
        </article>

        <article>
          <span>
            <Eye size={20} />
          </span>

          <div>
            <small>
              Kundportal
            </small>

            <strong>
              {
                files.filter(
                  (file) =>
                    file.customer_visible
                ).length
              }
            </strong>

            <p>
              markerade
            </p>
          </div>
        </article>

        <article>
          <span>
            <FileImage size={20} />
          </span>

          <div>
            <small>
              Design
            </small>

            <strong>
              {
                files.filter(
                  (file) =>
                    file.folder ===
                    "design"
                ).length
              }
            </strong>

            <p>
              filer
            </p>
          </div>
        </article>

        <article>
          <span>
            <Check size={20} />
          </span>

          <div>
            <small>
              Leveranser
            </small>

            <strong>
              {
                files.filter(
                  (file) =>
                    file.folder ===
                    "delivery"
                ).length
              }
            </strong>

            <p>
              filer
            </p>
          </div>
        </article>
      </section>


      <section className={styles.toolbar}>
        <div>
          <span>
            Projektfiler
          </span>

          <h2>
            Filer & dokument
          </h2>

          <p>
            Samla projektets material,
            design, avtal och leveranser
            på samma plats.
          </p>
        </div>

        <button
          type="button"
          className={styles.uploadButton}
          onClick={() =>
            setUploadOpen(
              (current) =>
                !current
            )
          }
        >
          <Plus size={18} />

          Ladda upp filer
        </button>
      </section>


      {uploadOpen && (
        <form
          action={handleUpload}
          className={styles.uploadCard}
        >
          <div className={styles.uploadIntro}>
            <span className={styles.uploadIcon}>
              <UploadCloud size={25} />
            </span>

            <div>
              <span>
                Ny uppladdning
              </span>

              <h3>
                Lägg till projektfiler
              </h3>

              <p>
                Max 10 filer åt gången och
                25 MB per fil.
              </p>
            </div>
          </div>

          <label className={styles.filePicker}>
            <UploadCloud size={23} />

            <strong>
              Välj filer
            </strong>

            <span>
              PDF, bilder, dokument, kalkylark,
              presentationer och ZIP
            </span>

            <input
              type="file"
              name="files"
              multiple
              required
            />
          </label>

          <label className={styles.folderSelect}>
            <span>
              Lägg filerna i
            </span>

            <select
              name="folder"
              defaultValue="other"
            >
              <option value="customer">
                Kundmaterial
              </option>

              <option value="design">
                Design
              </option>

              <option value="delivery">
                Leveranser
              </option>

              <option value="agreement">
                Avtal
              </option>

              <option value="other">
                Övrigt
              </option>
            </select>
          </label>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.uploadActions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() =>
                setUploadOpen(false)
              }
            >
              Avbryt
            </button>

            <button
              type="submit"
              className={styles.confirmUpload}
              disabled={pending}
            >
              <UploadCloud size={17} />

              {pending
                ? "Laddar upp..."
                : "Ladda upp"}
            </button>
          </div>
        </form>
      )}


      {success && (
        <div className={styles.success}>
          <Check size={17} />

          {success}
        </div>
      )}


      <section className={styles.browser}>
        <div className={styles.folderTabs}>
          {folders.map(
            (item) => (
              <button
                key={item.value}
                type="button"
                className={
                  folder ===
                  item.value
                    ? styles.activeFolder
                    : ""
                }
                onClick={() =>
                  setFolder(
                    item.value
                  )
                }
              >
                {item.label}

                <span>
                  {item.value === "all"
                    ? files.length
                    : files.filter(
                        (file) =>
                          file.folder ===
                          item.value
                      ).length}
                </span>
              </button>
            )
          )}
        </div>


        {filteredFiles.length === 0 ? (
          <div className={styles.empty}>
            <span>
              <FolderOpen size={29} />
            </span>

            <h3>
              Inga filer här ännu
            </h3>

            <p>
              Ladda upp projektets material
              så samlas allt på samma plats.
            </p>

            <button
              type="button"
              onClick={() =>
                setUploadOpen(true)
              }
            >
              <Plus size={17} />

              Ladda upp första filen
            </button>
          </div>
        ) : (
          <div className={styles.fileList}>
            {filteredFiles.map(
              (file) => {
                const Icon =
                  getFileIcon(
                    file.mime_type,
                    file.file_name
                  );

                return (
                  <article
                    key={file.id}
                    className={styles.fileRow}
                  >
                    <span className={styles.fileIcon}>
                      <Icon
                        size={21}
                        strokeWidth={1.7}
                      />
                    </span>

                    <div className={styles.fileInfo}>
                      <strong>
                        {file.file_name}
                      </strong>

                      <span>
                        {
                          folderLabels[
                            file.folder
                          ] ??
                          "Övrigt"
                        }
                        {" · "}
                        {formatSize(
                          Number(
                            file.size_bytes
                          )
                        )}
                      </span>
                    </div>

                    <div className={styles.uploaded}>
                      <span>
                        Uppladdad av
                      </span>

                      <strong>
                        {file.uploaded_by_name ??
                          "Vorix"}
                      </strong>
                    </div>

                    <time className={styles.date}>
                      {formatDate(
                        file.created_at
                      )}
                    </time>

                    <button
                      type="button"
                      className={`${styles.visibility} ${
                        file.customer_visible
                          ? styles.visible
                          : ""
                      }`}
                      title={
                        file.customer_visible
                          ? "Markerad som synlig för kunden"
                          : "Inte synlig för kunden"
                      }
                      onClick={() =>
                        startTransition(
                          async () => {
                            await toggleProjectFileVisibilityAction(
                              projectId,
                              file.id,
                              !file.customer_visible
                            );
                          }
                        )
                      }
                    >
                      {file.customer_visible ? (
                        <Eye size={17} />
                      ) : (
                        <EyeOff size={17} />
                      )}

                      <span>
                        {file.customer_visible
                          ? "Kund"
                          : "Intern"}
                      </span>
                    </button>

                    {file.signed_url ? (
                      <a
                        href={file.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.download}
                        title="Öppna fil"
                      >
                        <Download size={18} />
                      </a>
                    ) : (
                      <span className={styles.downloadDisabled}>
                        <Download size={18} />
                      </span>
                    )}

                    <button
                      type="button"
                      className={styles.delete}
                      title="Ta bort fil"
                      onClick={() => {
                        const approved =
                          window.confirm(
                            `Ta bort "${file.file_name}"?`
                          );

                        if (!approved) {
                          return;
                        }

                        startTransition(
                          async () => {
                            await deleteProjectFileAction(
                              projectId,
                              file.id
                            );
                          }
                        );
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}