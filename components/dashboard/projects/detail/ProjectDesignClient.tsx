"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  ExternalLink,
  Eye,
  EyeOff,
  FileImage,
  ImageIcon,
  Layers3,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

import CreateDesignProposalForm from "@/components/dashboard/design-proposals/CreateDesignProposalForm";

import {
  deleteProjectDesignAction,
  publishProjectDesignAction,
  unpublishProjectDesignAction,
} from "@/app/dashboard/projekt/[id]/design/actions";

import type {
  DesignProposalProjectOption,
} from "@/lib/dashboard/design-proposals/get-design-proposal-project-options";

import styles from "./ProjectDesignClient.module.css";


type DesignProposal = {
  id: string;

  title: string;

  version_label: string;

  summary:
    string | null;

  external_url:
    string | null;

  status: string;

  customer_visible:
    boolean;

  published_at:
    string | null;

  created_at: string;

  created_by_name:
    string | null;

  file_count: number;

  primary_file_name:
    string | null;

  primary_file_url:
    string | null;
};


type Props = {
  project:
    DesignProposalProjectOption;

  proposals:
    DesignProposal[];
};


const formatter =
  new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );


export default function ProjectDesignClient({
  project,
  proposals,
}: Props) {
  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      proposals.length === 0
    );

  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const publishedCount =
    proposals.filter(
      (proposal) =>
        proposal.status ===
        "published"
    ).length;

  const draftCount =
    proposals.filter(
      (proposal) =>
        proposal.status ===
        "draft"
    ).length;

  const customerVisible =
    proposals.filter(
      (proposal) =>
        proposal.customer_visible
    ).length;


  return (
    <div className={styles.workspace}>
      <section className={styles.stats}>
        <article>
          <span>
            <Layers3 size={20} />
          </span>

          <div>
            <small>
              Versioner
            </small>

            <strong>
              {proposals.length}
            </strong>
          </div>
        </article>

        <article>
          <span>
            <Send size={20} />
          </span>

          <div>
            <small>
              Publicerade
            </small>

            <strong>
              {publishedCount}
            </strong>
          </div>
        </article>

        <article>
          <span>
            <ImageIcon size={20} />
          </span>

          <div>
            <small>
              Utkast
            </small>

            <strong>
              {draftCount}
            </strong>
          </div>
        </article>

        <article>
          <span>
            <Eye size={20} />
          </span>

          <div>
            <small>
              Synliga för kund
            </small>

            <strong>
              {customerVisible}
            </strong>
          </div>
        </article>
      </section>


      <section className={styles.toolbar}>
        <div>
          <span>
            Design & feedback
          </span>

          <h2>
            Designförslag
          </h2>

          <p>
            Skapa versioner, publicera
            designmaterial och följ vad
            kunden kan granska.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            setCreateOpen(
              (current) =>
                !current
            )
          }
        >
          <Plus size={18} />

          Nytt designförslag
        </button>
      </section>


      {createOpen && (
        <section className={styles.createCard}>
          <header className={styles.createHeading}>
            <div>
              <span>
                Ny version
              </span>

              <h3>
                Lägg till designförslag
              </h3>

              <p>
                Projektet är redan valt.
                Lägg bara till version,
                filer och information.
              </p>
            </div>

            {proposals.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setCreateOpen(false)
                }
              >
                Stäng
              </button>
            )}
          </header>

          <CreateDesignProposalForm
            projects={[project]}
            initialProjectId={
              project.id
            }
            lockProject
          />
        </section>
      )}


      {proposals.length === 0 ? (
        !createOpen && (
          <section className={styles.empty}>
            <span>
              <FileImage size={30} />
            </span>

            <h3>
              Inga designförslag ännu
            </h3>

            <p>
              Skapa projektets första
              designversion och publicera
              den när den är redo.
            </p>
          </section>
        )
      ) : (
        <section className={styles.list}>
          {proposals.map(
            (proposal) => (
              <article
                key={proposal.id}
                className={styles.proposal}
              >
                <div className={styles.preview}>
                  {proposal.primary_file_url ? (
                    proposal.primary_file_name
                      ?.toLowerCase()
                      .endsWith(".pdf") ? (
                      <a
                        href={
                          proposal.primary_file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={
                          styles.pdfPreview
                        }
                      >
                        <FileImage
                          size={31}
                        />

                        <span>
                          PDF
                        </span>
                      </a>
                    ) : (
                      <a
                        href={
                          proposal.primary_file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={
                          styles.imagePreview
                        }
                      >
                        <img
                          src={
                            proposal.primary_file_url
                          }
                          alt=""
                        />
                      </a>
                    )
                  ) : (
                    <div
                      className={
                        styles.noPreview
                      }
                    >
                      <FileImage
                        size={30}
                      />

                      <span>
                        Ingen bildfil
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.content}>
                  <div className={styles.versionRow}>
                    <span className={styles.version}>
                      {
                        proposal.version_label
                      }
                    </span>

                    <span
                      className={`${styles.status} ${
                        proposal.status ===
                        "published"
                          ? styles.published
                          : styles.draft
                      }`}
                    >
                      {proposal.status ===
                      "published"
                        ? "Publicerad"
                        : "Utkast"}
                    </span>
                  </div>

                  <h3>
                    {proposal.title}
                  </h3>

                  {proposal.summary && (
                    <p>
                      {proposal.summary}
                    </p>
                  )}

                  <div className={styles.meta}>
                    <span>
                      {
                        proposal.file_count
                      }{" "}
                      filer
                    </span>

                    <span>
                      Skapad{" "}
                      {formatter.format(
                        new Date(
                          proposal.created_at
                        )
                      )}
                    </span>

                    {proposal.created_by_name && (
                      <span>
                        {
                          proposal.created_by_name
                        }
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.visibility
                    }
                  >
                    {proposal.customer_visible ? (
                      <>
                        <Eye size={15} />

                        Synlig för kunden
                      </>
                    ) : (
                      <>
                        <EyeOff size={15} />

                        Endast internt
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  {proposal.external_url && (
                    <a
                      href={
                        proposal.external_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      title="Öppna prototyp"
                    >
                      <ExternalLink
                        size={17}
                      />

                      Prototyp
                    </a>
                  )}

                  {proposal.status ===
                  "published" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(
                          async () => {
                            await unpublishProjectDesignAction(
                              project.id,
                              proposal.id
                            );
                          }
                        )
                      }
                    >
                      <EyeOff
                        size={17}
                      />

                      Dra tillbaka
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      className={
                        styles.publishButton
                      }
                      onClick={() =>
                        startTransition(
                          async () => {
                            await publishProjectDesignAction(
                              project.id,
                              proposal.id
                            );
                          }
                        )
                      }
                    >
                      <Send
                        size={17}
                      />

                      Publicera
                    </button>
                  )}

                  <button
                    type="button"
                    className={
                      styles.deleteButton
                    }
                    disabled={pending}
                    onClick={() => {
                      const approved =
                        window.confirm(
                          `Ta bort ${proposal.version_label} – ${proposal.title}?`
                        );

                      if (!approved) {
                        return;
                      }

                      startTransition(
                        async () => {
                          await deleteProjectDesignAction(
                            project.id,
                            proposal.id
                          );
                        }
                      );
                    }}
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}
    </div>
  );
}