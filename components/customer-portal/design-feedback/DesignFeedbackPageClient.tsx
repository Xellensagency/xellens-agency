"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Check,
  Download,
  Eye,
  FileImage,
  FileText,
  MessageSquare,
  PencilLine,
  RotateCcw,
  Send,
  ThumbsUp,
  UploadCloud,
} from "lucide-react";

import styles from "./DesignFeedbackPageClient.module.css";

type DesignFeedbackPageClientProps = {
  contactName: string;
  customerName: string;
};

type FeedbackAction =
  | "approve"
  | "changes"
  | "comment"
  | "return"
  | null;

type CommentItem = {
  id: number;
  name: string;
  role: "customer" | "xellens";
  initials: string;
  time: string;
  message: string;
};

const designFiles = [
  {
    name: "Designförslag_v1.png",
    size: "3,2 MB",
    type: "Bild",
  },
  {
    name: "Designförslag_mobil.png",
    size: "1,8 MB",
    type: "Bild",
  },
  {
    name: "Designpresentation.pdf",
    size: "4,6 MB",
    type: "PDF",
  },
  {
    name: "Projektbrief.pdf",
    size: "245 KB",
    type: "PDF",
  },
];

export default function DesignFeedbackPageClient({
  contactName,
  customerName,
}: DesignFeedbackPageClientProps) {
  const [
    selectedVersion,
    setSelectedVersion,
  ] = useState(0);

  const [
    selectedAction,
    setSelectedAction,
  ] = useState<FeedbackAction>(null);

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "activity" | "files"
  >("activity");

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    comments,
    setComments,
  ] = useState<CommentItem[]>([
    {
      id: 1,
      name: contactName,
      role: "customer",
      initials: contactName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      time: "21 maj 2026, 16:20",
      message:
        "Hej! Älskar verkligen stilen. Kan vi byta bilden i hero-sektionen och kanske göra knappen lite större?",
    },
    {
      id: 2,
      name: "Alexander Ekelöf",
      role: "xellens",
      initials: "AE",
      time: "21 maj 2026, 16:35",
      message:
        "Absolut! Vi uppdaterar bilden och gör knappen större. Återkommer snart med en ny version.",
    },
  ]);

  function submitComment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanComment =
      comment.trim();

    if (!cleanComment) {
      return;
    }

    setComments((current) => [
      ...current,
      {
        id: Date.now(),
        name: contactName,
        role: "customer",
        initials: contactName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        time: "Nu",
        message: cleanComment,
      },
    ]);

    setComment("");
  }

  return (
    <div className={styles.page}>
      <section className={styles.heading}>
        <div className={styles.titleRow}>
          <h1>
            Designförslag #1
          </h1>

          <span className={styles.statusBadge}>
            VÄNTAR PÅ DIN FEEDBACK
          </span>
        </div>

        <p>
          Skickat 21 maj 2026 kl. 14:32 av
          Alexander Ekelöf
        </p>
      </section>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <section className={styles.previewSection}>
            <div className={styles.previewColumn}>
              <div className={styles.designPreview}>
                <div className={styles.siteNavigation}>
                  <strong>
                    NORDIC SKIN
                  </strong>

                  <nav>
                    <span>Hem</span>
                    <span>Behandlingar</span>
                    <span>Om oss</span>
                    <span>Resultat</span>
                    <span>Kontakt</span>
                  </nav>

                  <button type="button">
                    Boka konsultation
                  </button>
                </div>

                <div className={styles.siteHero}>
                  <div className={styles.siteHeroText}>
                    <small>
                      NORDIC SKIN
                    </small>

                    <h2>
                      NORDIC SKIN
                    </h2>

                    <p>
                      Skapa den bästa versionen av
                      din hud med vetenskapliga och
                      naturliga metoder.
                    </p>

                    <button type="button">
                      Boka konsultation
                    </button>
                  </div>

                  <div className={styles.portrait}>
                    <div
                      className={
                        styles.portraitHair
                      }
                    />

                    <div
                      className={
                        styles.portraitFace
                      }
                    />

                    <div
                      className={
                        styles.portraitBody
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.thumbnails}>
                {[0, 1, 2, 3].map(
                  (version) => (
                    <button
                      key={version}
                      type="button"
                      onClick={() =>
                        setSelectedVersion(
                          version
                        )
                      }
                      className={
                        selectedVersion ===
                        version
                          ? styles.activeThumbnail
                          : ""
                      }
                      aria-label={`Visa designbild ${
                        version + 1
                      }`}
                    >
                      {version === 3 ? (
                        <div
                          className={
                            styles.documentThumbnail
                          }
                        >
                          <FileText
                            size={23}
                          />

                          <span>
                            Presentation
                          </span>
                        </div>
                      ) : (
                        <div
                          className={
                            styles.miniDesign
                          }
                        >
                          <small>
                            NORDIC SKIN
                          </small>

                          <strong>
                            Design{" "}
                            {version + 1}
                          </strong>
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            <aside className={styles.aboutCard}>
              <h2>
                Om detta förslag
              </h2>

              <p>
                Detta är det första
                designförslaget för din nya
                hemsida. Vi har fokuserat på en
                modern, ren och användarvänlig
                design som speglar{" "}
                {customerName}s varumärke.
              </p>

              <div className={styles.divider} />

              <h3>
                Nyckelfunktioner
              </h3>

              <ul>
                <li>
                  <Check size={16} />
                  Modern och minimalistisk design
                </li>

                <li>
                  <Check size={16} />
                  Responsiv på alla enheter
                </li>

                <li>
                  <Check size={16} />
                  Tydlig call-to-action
                </li>

                <li>
                  <Check size={16} />
                  Optimerad för konvertering
                </li>

                <li>
                  <Check size={16} />
                  SEO-vänlig struktur
                </li>
              </ul>
            </aside>
          </section>

          <section className={styles.feedbackPanel}>
            <div className={styles.panelHeading}>
              <h2>
                Vad vill du göra?
              </h2>

              <p>
                Din feedback hjälper oss att skapa
                den perfekta lösningen för dig.
              </p>
            </div>

            <div className={styles.actionGrid}>
              <button
                type="button"
                onClick={() =>
                  setSelectedAction("approve")
                }
                className={`${styles.actionCard} ${
                  styles.approveCard
                } ${
                  selectedAction === "approve"
                    ? styles.selectedAction
                    : ""
                }`}
              >
                <ThumbsUp size={31} />

                <strong>
                  Godkänn design
                </strong>

                <span>
                  Jag är nöjd med designen och vill
                  gå vidare.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedAction("changes")
                }
                className={`${styles.actionCard} ${
                  styles.changesCard
                } ${
                  selectedAction === "changes"
                    ? styles.selectedAction
                    : ""
                }`}
              >
                <PencilLine size={31} />

                <strong>
                  Begär ändringar
                </strong>

                <span>
                  Jag vill göra ändringar i
                  designen.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedAction("comment")
                }
                className={`${styles.actionCard} ${
                  styles.commentCard
                } ${
                  selectedAction === "comment"
                    ? styles.selectedAction
                    : ""
                }`}
              >
                <MessageSquare size={31} />

                <strong>
                  Kommentera
                </strong>

                <span>
                  Jag har kommentarer på specifika
                  delar.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedAction("return")
                }
                className={`${styles.actionCard} ${
                  styles.returnCard
                } ${
                  selectedAction === "return"
                    ? styles.selectedAction
                    : ""
                }`}
              >
                <RotateCcw size={31} />

                <strong>
                  Skicka tillbaka
                </strong>

                <span>
                  Jag vill se ett helt nytt
                  designförslag.
                </span>
              </button>
            </div>

            {selectedAction && (
              <div className={styles.actionNotice}>
                <Check size={18} />

                <span>
                  Ditt val är markerat. När
                  databasen är kopplad visas en
                  bekräftelseruta innan svaret
                  skickas till Xellens.
                </span>
              </div>
            )}

            <div className={styles.pagination}>
              <button
                type="button"
                disabled
              >
                Föregående förslag
              </button>

              <div>
                <i className={styles.activeDot} />
                <i />
                <span>
                  1 av 2
                </span>
              </div>

              <button type="button">
                Nästa förslag
              </button>
            </div>
          </section>
        </main>

        <aside className={styles.activityPanel}>
          <div className={styles.tabs}>
            <button
              type="button"
              onClick={() =>
                setActiveTab("activity")
              }
              className={
                activeTab === "activity"
                  ? styles.activeTab
                  : ""
              }
            >
              Aktivitet
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("files")
              }
              className={
                activeTab === "files"
                  ? styles.activeTab
                  : ""
              }
            >
              Designfiler (4)
            </button>
          </div>

          {activeTab === "activity" ? (
            <>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <span
                    className={
                      styles.purpleActivity
                    }
                  >
                    <Send size={17} />
                  </span>

                  <div>
                    <strong>
                      Designförslag skickat
                    </strong>

                    <time>
                      21 maj 2026 kl. 14:32
                    </time>

                    <p>
                      Alexander Ekelöf skickade
                      designförslag #1.
                    </p>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <span
                    className={
                      styles.greenActivity
                    }
                  >
                    <Eye size={18} />
                  </span>

                  <div>
                    <strong>
                      Förslag visat
                    </strong>

                    <time>
                      21 maj 2026 kl. 15:45
                    </time>

                    <p>
                      {contactName} öppnade
                      designförslag #1.
                    </p>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <span
                    className={
                      styles.purpleActivity
                    }
                  >
                    <MessageSquare
                      size={17}
                    />
                  </span>

                  <div>
                    <strong>
                      Kommentar tillagd
                    </strong>

                    <time>
                      21 maj 2026 kl. 16:20
                    </time>

                    <p>
                      {contactName} lämnade en
                      kommentar.
                    </p>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <span
                    className={
                      styles.greenActivity
                    }
                  >
                    <UploadCloud
                      size={18}
                    />
                  </span>

                  <div>
                    <strong>
                      Ny fil uppladdad
                    </strong>

                    <time>
                      21 maj 2026 kl. 16:25
                    </time>

                    <p>
                      emma_anteckningar.pdf
                    </p>
                  </div>
                </div>
              </div>

              <section className={styles.comments}>
                <h2>
                  Kommentarer ({comments.length})
                </h2>

                <div className={styles.commentList}>
                  {comments.map(
                    (item) => (
                      <article
                        key={item.id}
                        className={
                          styles.commentItem
                        }
                      >
                        <span
                          className={`${styles.commentAvatar} ${
                            item.role ===
                            "xellens"
                              ? styles.xellensAvatar
                              : ""
                          }`}
                        >
                          {item.initials}
                        </span>

                        <div>
                          <header>
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.role ===
                              "xellens"
                                ? "XELLENS"
                                : "KUND"}
                            </span>

                            <time>
                              {item.time}
                            </time>
                          </header>

                          <p>
                            {item.message}
                          </p>

                          <button type="button">
                            Svara
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>

                <form
                  className={styles.commentForm}
                  onSubmit={submitComment}
                >
                  <input
                    value={comment}
                    onChange={(event) =>
                      setComment(
                        event.target.value
                      )
                    }
                    placeholder="Skriv din kommentar..."
                    aria-label="Skriv kommentar"
                  />

                  <button
                    type="submit"
                    aria-label="Skicka kommentar"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </section>
            </>
          ) : (
            <div className={styles.filePanel}>
              {designFiles.map(
                (file) => (
                  <article key={file.name}>
                    <span>
                      {file.type === "PDF" ? (
                        <FileText size={21} />
                      ) : (
                        <FileImage size={21} />
                      )}
                    </span>

                    <div>
                      <strong>
                        {file.name}
                      </strong>

                      <small>
                        {file.type} · {file.size}
                      </small>
                    </div>

                    <button
                      type="button"
                      aria-label={`Ladda ner ${file.name}`}
                    >
                      <Download size={18} />
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
