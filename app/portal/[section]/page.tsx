import { notFound } from "next/navigation";

import styles from "@/components/customer-portal/layout/PortalLayout.module.css";

const sections: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  projekt: {
    eyebrow: "PROJEKT",
    title: "Dina projekt",
    description:
      "Här kommer du kunna följa projekt, tidslinjer, status och nästa steg.",
  },
  "design-feedback": {
    eyebrow: "DESIGN & FEEDBACK",
    title: "Granskning och återkoppling",
    description:
      "Här kommer designförslag, versionshistorik och godkännanden att samlas.",
  },
  filer: {
    eyebrow: "FILER",
    title: "Filer och dokument",
    description:
      "Här kommer du kunna öppna, ladda ner och dela filer med Xellens.",
  },
  offerter: {
    eyebrow: "OFFERTER",
    title: "Dina offerter",
    description:
      "Här kommer du kunna granska och acceptera offerter digitalt.",
  },
  fakturor: {
    eyebrow: "FAKTUROR",
    title: "Fakturor och betalningar",
    description:
      "Här kommer fakturor, PDF-filer och betalningsstatus att visas.",
  },
  moten: {
    eyebrow: "MÖTEN",
    title: "Möten och bokningar",
    description:
      "Här kommer du kunna se, boka och hantera möten.",
  },
  meddelanden: {
    eyebrow: "MEDDELANDEN",
    title: "Meddelanden",
    description:
      "Här kommer all kommunikation med Xellens att samlas.",
  },
  support: {
    eyebrow: "SUPPORT",
    title: "Supportärenden",
    description:
      "Här kommer du kunna skapa och följa supportärenden.",
  },
  notiser: {
    eyebrow: "NOTISER",
    title: "Dina notiser",
    description:
      "Här kommer viktiga uppdateringar och händelser att visas.",
  },
  installningar: {
    eyebrow: "INSTÄLLNINGAR",
    title: "Profil och inställningar",
    description:
      "Här kommer du kunna hantera profil, lösenord och notiser.",
  },
};

type PortalSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function PortalSectionPage({
  params,
}: PortalSectionPageProps) {
  const {
    section,
  } = await params;

  const page =
    sections[section];

  if (!page) {
    notFound();
  }

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <span>
            {page.eyebrow}
          </span>

          <h1>
            {page.title}
          </h1>

          <p>
            {page.description}
          </p>
        </div>
      </section>

      <section className={styles.comingPanel}>
        <div className={styles.comingIcon}>
          X
        </div>

        <span>
          NÄSTA DEL AV KUNDPORTALEN
        </span>

        <h2>
          {page.title}
        </h2>

        <p>
          Grundsidan är skapad och länken
          fungerar. Funktionen kopplas nu
          till kundens riktiga data.
        </p>
      </section>
    </>
  );
}
