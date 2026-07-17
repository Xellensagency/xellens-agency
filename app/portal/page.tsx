import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Clock3,
  Download,
  FileImage,
  FileText,
  Folder,
  MessageSquare,
  Send,
  UploadCloud,
} from "lucide-react";

import {
  getCurrentPortalContext,
} from "@/lib/customer-portal/get-current-portal-context";

import styles from "./page.module.css";

const progressSteps = [
  {
    label: "Offert godkänd",
    date: "20 maj",
    state: "done",
  },
  {
    label: "Planering",
    date: "21 maj",
    state: "done",
  },
  {
    label: "Design",
    date: "Pågående",
    state: "current",
  },
  {
    label: "Utveckling",
    date: "",
    state: "future",
  },
  {
    label: "Testning",
    date: "",
    state: "future",
  },
  {
    label: "Leverans",
    date: "",
    state: "future",
  },
] as const;

const timeline = [
  {
    title: "Offert godkänd",
    date: "20 maj 2026 kl. 10:15",
    text: "",
    state: "done",
  },
  {
    title: "Designförslag skickat",
    date: "21 maj 2026 kl. 14:32",
    text:
      "Vi har skickat det första designförslaget för din hemsida.",
    state: "current",
  },
  {
    title: "Din feedback",
    date: "",
    text:
      "Väntar på din feedback på designen.",
    state: "feedback",
  },
  {
    title: "Utveckling påbörjas",
    date: "",
    text:
      "När designen är godkänd.",
    state: "future",
  },
  {
    title: "Hemsidan lanseras",
    date: "",
    text:
      "Beräknad leverans: 20 juni 2026",
    state: "future",
  },
] as const;

export default async function PortalDashboardPage() {
  const context =
    await getCurrentPortalContext();

  const firstName =
    context.contactName
      .split(/\s+/)
      .filter(Boolean)[0] ||
    "välkommen";

  return (
    <div className={styles.page}>
      <section className={styles.welcome}>
        <h1>
          Hej {firstName}!{" "}
          <span aria-hidden="true">
            👋
          </span>
        </h1>

        <p>
          Välkommen till din kundportal.
          Här har du full koll på ditt
          projekt.
        </p>
      </section>

      <div className={styles.topGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.projectHero}>
            <div className={styles.heroContent}>
              <span>
                AKTIVT PROJEKT
              </span>

              <h2>
                Ny hemsida
              </h2>

              <strong>
                {context.customerName}
              </strong>

              <p>
                En modern och responsiv
                hemsida med fokus på
                konvertering och
                användarvänlighet.
              </p>

              <Link href="/portal/projekt">
                Visa projekt

                <ArrowRight
                  size={17}
                  strokeWidth={1.7}
                />
              </Link>
            </div>

            <div
              className={
                styles.devicePreview
              }
              aria-hidden="true"
            >
              <div className={styles.laptop}>
                <div className={styles.browserBar}>
                  <i />
                  <i />
                  <i />
                </div>

                <div className={styles.browserContent}>
                  <small>
                    NORDIC SKIN
                  </small>

                  <strong>
                    Din nya digitala
                    upplevelse
                  </strong>

                  <span>
                    Boka behandling
                  </span>
                </div>
              </div>

              <div className={styles.phone}>
                <div className={styles.phoneScreen}>
                  <small>
                    NORDIC
                  </small>

                  <strong>
                    SKIN
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.progressCard}>
            <div className={styles.cardHeading}>
              <h2>
                Projektets framsteg
              </h2>

              <span className={styles.percent}>
                45%
              </span>
            </div>

            <div className={styles.progressSteps}>
              {progressSteps.map(
                (
                  step,
                  index
                ) => (
                  <div
                    key={step.label}
                    className={
                      styles.progressStep
                    }
                  >
                    <div
                      className={`${styles.stepIcon} ${
                        step.state ===
                        "done"
                          ? styles.stepDone
                          : step.state ===
                              "current"
                            ? styles.stepCurrent
                            : styles.stepFuture
                      }`}
                    >
                      {step.state ===
                      "future" ? (
                        <Circle
                          size={16}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Check
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    {index <
                      progressSteps.length -
                        1 && (
                      <span
                        className={`${styles.stepLine} ${
                          index < 2
                            ? styles.stepLineActive
                            : ""
                        }`}
                      />
                    )}

                    <strong>
                      {step.label}
                    </strong>

                    {step.date && (
                      <small>
                        {step.date}
                      </small>
                    )}
                  </div>
                )
              )}
            </div>
          </section>

          <div className={styles.middleGrid}>
            <section className={styles.designCard}>
              <div className={styles.cardHeading}>
                <h2>
                  Designförslag #1
                </h2>

                <span
                  className={
                    styles.feedbackBadge
                  }
                >
                  VÄNTAR PÅ DIN FEEDBACK
                </span>
              </div>

              <div
                className={
                  styles.designPreview
                }
              >
                <div
                  className={
                    styles.designLaptop
                  }
                >
                  <small>
                    NORDIC SKIN
                  </small>

                  <strong>
                    Skönhet möter
                    resultat
                  </strong>
                </div>

                <div
                  className={
                    styles.designPhone
                  }
                >
                  NS
                </div>
              </div>

              <p>
                Skickat 21 maj 2026 kl.
                14:32
              </p>

              <div className={styles.designActions}>
                <Link
                  href="/portal/design-feedback"
                  className={
                    styles.primaryAction
                  }
                >
                  Granska & kommentera

                  <ArrowRight
                    size={16}
                  />
                </Link>

                <Link
                  href="/portal/filer"
                  className={
                    styles.secondaryAction
                  }
                >
                  <Download
                    size={15}
                  />

                  Ladda ner
                </Link>
              </div>
            </section>

            <section className={styles.tasksCard}>
              <h2>
                Uppgifter
              </h2>

              <div className={styles.taskList}>
                <div>
                  <CheckCircle2
                    className={
                      styles.taskDone
                    }
                    size={20}
                  />

                  <span>
                    Samla in material
                    <small>
                      Klart
                    </small>
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    className={
                      styles.taskDone
                    }
                    size={20}
                  />

                  <span>
                    Planering & struktur
                    <small>
                      Klart
                    </small>
                  </span>
                </div>

                <div>
                  <Clock3
                    className={
                      styles.taskCurrent
                    }
                    size={20}
                  />

                  <span>
                    Designförslag #1
                    <small>
                      Väntar på din
                      feedback
                    </small>
                  </span>
                </div>

                {[
                  "Revidering",
                  "Utveckling",
                  "Testning",
                  "Lansering",
                ].map(
                  (task) => (
                    <div key={task}>
                      <Circle
                        className={
                          styles.taskFuture
                        }
                        size={20}
                      />

                      <span>
                        {task}
                        <small>
                          Väntar
                        </small>
                      </span>
                    </div>
                  )
                )}
              </div>

              <Link
                href="/portal/projekt"
                className={styles.fullButton}
              >
                Visa alla uppgifter

                <ArrowRight
                  size={16}
                />
              </Link>
            </section>

            <section className={styles.shortcutsCard}>
              <h2>
                Snabba genvägar
              </h2>

              <div className={styles.shortcutList}>
                <Link href="/portal/filer">
                  <span>
                    <UploadCloud
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Ladda upp filer
                    </strong>

                    <small>
                      Dela material med oss
                    </small>
                  </div>
                </Link>

                <Link href="/portal/moten">
                  <span>
                    <CalendarDays
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Boka möte
                    </strong>

                    <small>
                      Välj tid i kalendern
                    </small>
                  </div>
                </Link>

                <Link href="/portal/meddelanden">
                  <span>
                    <MessageSquare
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Skicka meddelande
                    </strong>

                    <small>
                      Chatta med teamet
                    </small>
                  </div>
                </Link>

                <Link href="/portal/support">
                  <span
                    className={
                      styles.purpleIcon
                    }
                  >
                    <CircleHelp
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Vanliga frågor
                    </strong>

                    <small>
                      Få svar på vanliga
                      frågor
                    </small>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>

        <aside className={styles.timelineCard}>
          <h2>
            Tidslinje
          </h2>

          <div className={styles.timeline}>
            {timeline.map(
              (
                item,
                index
              ) => (
                <div
                  key={item.title}
                  className={
                    styles.timelineItem
                  }
                >
                  <div
                    className={`${styles.timelineIcon} ${
                      item.state ===
                      "done"
                        ? styles.timelineDone
                        : item.state ===
                            "current"
                          ? styles.timelineCurrent
                          : item.state ===
                              "feedback"
                            ? styles.timelineFeedback
                            : styles.timelineFuture
                    }`}
                  >
                    {item.state ===
                    "done" ? (
                      <Check
                        size={17}
                      />
                    ) : item.state ===
                      "current" ? (
                      <Send
                        size={16}
                      />
                    ) : item.state ===
                      "feedback" ? (
                      <MessageSquare
                        size={15}
                      />
                    ) : (
                      <Clock3
                        size={15}
                      />
                    )}
                  </div>

                  {index <
                    timeline.length -
                      1 && (
                    <span
                      className={
                        styles.timelineLine
                      }
                    />
                  )}

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    {item.date && (
                      <small>
                        {item.date}
                      </small>
                    )}

                    {item.text && (
                      <p>
                        {item.text}
                      </p>
                    )}

                    {item.state ===
                      "current" && (
                      <Link
                        href="/portal/design-feedback"
                      >
                        Granska design
                      </Link>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <Link
            href="/portal/projekt"
            className={styles.fullButton}
          >
            Visa hela tidslinjen

            <ArrowRight
              size={16}
            />
          </Link>
        </aside>
      </div>

      <div className={styles.bottomGrid}>
        <section className={styles.bottomCard}>
          <h2>
            Filer
          </h2>

          <div className={styles.fileList}>
            <div>
              <span className={styles.folderIcon}>
                <Folder
                  size={18}
                  fill="currentColor"
                />
              </span>

              <strong>
                Bilder & logotyper
              </strong>

              <small>
                8 filer
              </small>

              <time>
                21 maj 2026
              </time>
            </div>

            <div>
              <span className={styles.pdfIcon}>
                <FileText
                  size={17}
                />
              </span>

              <strong>
                Projektbrief.pdf
              </strong>

              <small>
                245 KB
              </small>

              <time>
                20 maj 2026
              </time>
            </div>

            <div>
              <span className={styles.imageIcon}>
                <FileImage
                  size={17}
                />
              </span>

              <strong>
                Designförslag_v1.psd
              </strong>

              <small>
                32,5 MB
              </small>

              <time>
                21 maj 2026
              </time>
            </div>
          </div>

          <Link
            href="/portal/filer"
            className={styles.fullButton}
          >
            Visa alla filer

            <ArrowRight
              size={16}
            />
          </Link>
        </section>

        <section className={styles.bottomCard}>
          <div className={styles.cardHeading}>
            <h2>
              Fakturor
            </h2>

            <Link
              href="/portal/fakturor"
              className={
                styles.headingLink
              }
            >
              Visa alla
            </Link>
          </div>

          <div className={styles.invoiceList}>
            <div>
              <span className={styles.paidBadge}>
                BETALD
              </span>

              <p>
                <strong>
                  Faktura #2026-001
                </strong>

                <small>
                  20 maj 2026
                </small>
              </p>

              <b>
                15 000 kr
              </b>

              <Link
                href="/portal/fakturor"
                aria-label="Ladda ner faktura"
              >
                <Download
                  size={17}
                />
              </Link>
            </div>

            <div>
              <span className={styles.waitingBadge}>
                VÄNTAR
              </span>

              <p>
                <strong>
                  Faktura #2026-002
                </strong>

                <small>
                  Förfaller 20 juni 2026
                </small>
              </p>

              <b>
                34 875 kr
              </b>

              <Link
                href="/portal/fakturor"
                aria-label="Öppna faktura"
              >
                <Download
                  size={17}
                />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.bottomCard}>
          <div className={styles.cardHeading}>
            <h2>
              Meddelanden
            </h2>

            <Link
              href="/portal/meddelanden"
              className={
                styles.headingLink
              }
            >
              Visa alla
            </Link>
          </div>

          <div className={styles.messageList}>
            <div>
              <span className={styles.messageAvatar}>
                AE
              </span>

              <p>
                <strong>
                  Alexander Ekelöf
                </strong>

                <small>
                  Hej! Här kommer
                  designförslaget som vi...
                </small>
              </p>

              <time>
                14:32
              </time>
            </div>

            <div>
              <span className={styles.messageAvatar}>
                AT
              </span>

              <p>
                <strong>
                  {context.contactName}
                </strong>

                <small>
                  Tack! Jag kollar igenom
                  det och återkommer...
                </small>
              </p>

              <time>
                14:45
              </time>
            </div>

            <div>
              <span className={styles.messageAvatar}>
                AE
              </span>

              <p>
                <strong>
                  Alexander Ekelöf
                </strong>

                <small>
                  Perfekt! Hör av dig om du
                  har några frågor.
                </small>
              </p>

              <time>
                14:47
              </time>
            </div>
          </div>

          <Link
            href="/portal/meddelanden"
            className={styles.fullButton}
          >
            Öppna meddelanden

            <ArrowRight
              size={16}
            />
          </Link>
        </section>
      </div>
    </div>
  );
}
