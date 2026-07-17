import {
  Eye,
  FileUp,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import CreateDesignProposalForm from "@/components/dashboard/design-proposals/CreateDesignProposalForm";

import {
  getDesignProposalProjectOptions,
} from "@/lib/dashboard/design-proposals/get-design-proposal-project-options";

import styles from "./page.module.css";

export const metadata = {
  title:
    "Designförslag",
};

export default async function DesignProposalsPage() {
  const projects =
    await getDesignProposalProjectOptions();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span>
            DESIGN & FEEDBACK
          </span>

          <h1>
            Publicera designförslag
          </h1>

          <p>
            Ladda upp designmaterial,
            välj projekt och publicera
            det direkt till kundportalen.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.formCard}>
          <div className={styles.cardHeading}>
            <FileUp
              size={24}
              strokeWidth={1.6}
            />

            <div>
              <h2>
                Nytt designförslag
              </h2>

              <p>
                Fyll i informationen och
                välj vilka filer kunden
                ska granska.
              </p>
            </div>
          </div>

          <CreateDesignProposalForm
            projects={projects}
          />
        </section>

        <aside className={styles.infoCard}>
          <h2>
            Så fungerar det
          </h2>

          <div>
            <span>
              <FileUp size={21} />
            </span>

            <p>
              <strong>
                1. Ladda upp
              </strong>

              <small>
                Lägg till bilder, PDF eller
                en länk till Figma.
              </small>
            </p>
          </div>

          <div>
            <span>
              <Eye size={21} />
            </span>

            <p>
              <strong>
                2. Publicera
              </strong>

              <small>
                Förslaget visas endast för
                kunden som äger projektet.
              </small>
            </p>
          </div>

          <div>
            <span>
              <MessageSquare size={21} />
            </span>

            <p>
              <strong>
                3. Kunden svarar
              </strong>

              <small>
                Kunden kan godkänna,
                kommentera eller begära
                ändringar.
              </small>
            </p>
          </div>

          <div>
            <span>
              <ShieldCheck size={21} />
            </span>

            <p>
              <strong>
                Privat och säkert
              </strong>

              <small>
                Designfilerna ligger i ett
                privat filarkiv med
                kundstyrd behörighet.
              </small>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
