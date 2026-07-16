"use client";

import Link from "next/link";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  Code2,
  Eye,
  FolderTree,
  Globe2,
  Megaphone,
  Palette,
  Save,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import {
  createCatalogCategoryAction,
} from "@/app/dashboard/mallar/actions";

import styles from "./CreateCatalogCategoryForm.module.css";

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  iconKey: string;
  colorKey: string;
  isActive: boolean;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const iconOptions = [
  {
    value: "folder-tree",
    label: "Kategori",
  },
  {
    value: "globe",
    label: "Webb",
  },
  {
    value: "palette",
    label: "Design",
  },
  {
    value: "code",
    label: "Utveckling",
  },
  {
    value: "megaphone",
    label: "Marknadsföring",
  },
  {
    value: "wrench",
    label: "Service",
  },
  {
    value: "sparkles",
    label: "Tillägg",
  },
];

const colorOptions = [
  {
    value: "teal",
    label: "Turkos",
  },
  {
    value: "blue",
    label: "Blå",
  },
  {
    value: "purple",
    label: "Lila",
  },
  {
    value: "amber",
    label: "Guld",
  },
  {
    value: "rose",
    label: "Rosa",
  },
  {
    value: "slate",
    label: "Grå",
  },
];

function createSlug(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(/&/g, " och ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CategoryIcon({
  iconKey,
}: {
  iconKey: string;
}) {
  switch (iconKey) {
    case "globe":
      return <Globe2 size={25} />;

    case "palette":
      return <Palette size={25} />;

    case "code":
      return <Code2 size={25} />;

    case "megaphone":
      return <Megaphone size={25} />;

    case "wrench":
      return <Wrench size={25} />;

    case "sparkles":
      return <Sparkles size={25} />;

    default:
      return <FolderTree size={25} />;
  }
}

export default function CreateCatalogCategoryForm() {
  const router = useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    slugEdited,
    setSlugEdited,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<CategoryFormState>({
    name: "",
    slug: "",
    description: "",
    iconKey: "folder-tree",
    colorKey: "teal",
    isActive: true,
  });

  function updateForm<
    K extends keyof CategoryFormState
  >(
    field: K,
    value: CategoryFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function updateName(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugEdited
        ? current.slug
        : createSlug(value),
    }));

    setFeedback(null);
  }

  function updateSlug(
    value: string
  ) {
    setSlugEdited(true);

    updateForm(
      "slug",
      createSlug(value)
    );
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setFeedback({
        type: "error",
        message:
          "Ange kategorins namn.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await createCatalogCategoryAction(
            form
          );

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Kategorin kunde inte sparas.",
          });

          return;
        }

        router.push(
          "/dashboard/mallar"
        );

        router.refresh();
      })();
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link
          href="/dashboard/mallar"
          className={styles.backButton}
        >
          <ArrowLeft size={17} />
          Till Mallar & Paket
        </Link>

        <button
          type="button"
          className={styles.saveButton}
          disabled={isSaving}
          onClick={handleSubmit}
        >
          <Save size={17} />

          {isSaving
            ? "Sparar..."
            : "Skapa kategori"}
        </button>
      </div>

      {feedback && (
        <div
          className={[
            styles.feedback,
            feedback.type ===
            "success"
              ? styles.success
              : styles.error,
          ].join(" ")}
        >
          {feedback.type ===
          "success" ? (
            <BadgeCheck size={18} />
          ) : (
            <TriangleAlert
              size={18}
            />
          )}

          <span>
            {feedback.message}
          </span>
        </div>
      )}

      <section className={styles.hero}>
        <span>
          <FolderTree size={23} />
        </span>

        <div>
          <small>
            Mallar & Paket
          </small>

          <h1>Skapa ny kategori</h1>

          <p>
            Organisera tjänster,
            tilläggstjänster och paket i
            tydliga tjänsteområden.
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <section className={styles.card}>
            <header>
              <FolderTree size={19} />

              <div>
                <h2>Grunduppgifter</h2>

                <p>
                  Ange namn och beskrivning
                  för kategorin.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>
                  Kategorins namn
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={form.name}
                  placeholder="Exempel: Webb & utveckling"
                  onChange={(event) =>
                    updateName(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Webbadress
                </span>

                <div
                  className={
                    styles.slugInput
                  }
                >
                  <span>/</span>

                  <input
                    type="text"
                    value={form.slug}
                    placeholder="webb-utveckling"
                    onChange={(event) =>
                      updateSlug(
                        event.target.value
                      )
                    }
                  />
                </div>
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>Beskrivning</span>

                <textarea
                  rows={6}
                  value={form.description}
                  placeholder="Beskriv vilka tjänster som hör till kategorin."
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <Palette size={19} />

              <div>
                <h2>Utseende</h2>

                <p>
                  Välj ikon och färg för
                  kategorin.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label>
                <span>Ikon</span>

                <select
                  value={form.iconKey}
                  onChange={(event) =>
                    updateForm(
                      "iconKey",
                      event.target.value
                    )
                  }
                >
                  {iconOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Färg</span>

                <select
                  value={form.colorKey}
                  onChange={(event) =>
                    updateForm(
                      "colorKey",
                      event.target.value
                    )
                  }
                >
                  {colorOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <Eye size={19} />

              <div>
                <h2>Status</h2>

                <p>
                  Styr om kategorin går att
                  använda direkt.
                </p>
              </div>
            </header>

            <div className={styles.toggleList}>
              <label>
                <div>
                  <strong>
                    Aktiv kategori
                  </strong>

                  <small>
                    Kategorien visas när en
                    tjänst skapas eller
                    redigeras.
                  </small>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm(
                      "isActive",
                      event.target.checked
                    )
                  }
                />
              </label>
            </div>
          </section>
        </main>

        <aside className={styles.summaryColumn}>
          <section className={styles.summaryCard}>
            <header>
              <Palette size={19} />

              <div>
                <h2>Förhandsvisning</h2>

                <p>
                  Så visas kategorin i
                  katalogen.
                </p>
              </div>
            </header>

            <div
              className={`${styles.previewIcon} ${
                styles[
                  `color${form.colorKey
                    .charAt(0)
                    .toUpperCase()}${form.colorKey.slice(
                    1
                  )}`
                ] || ""
              }`}
            >
              <CategoryIcon
                iconKey={form.iconKey}
              />
            </div>

            <h3>
              {form.name.trim() ||
                "Namnlös kategori"}
            </h3>

            <span className={styles.slug}>
              /{form.slug ||
                "kategori"}
            </span>

            <p className={styles.previewText}>
              {form.description.trim() ||
                "Ingen beskrivning har lagts till."}
            </p>

            <div
              className={
                form.isActive
                  ? styles.activeStatus
                  : styles.inactiveStatus
              }
            >
              <BadgeCheck size={16} />

              {form.isActive
                ? "Aktiv kategori"
                : "Inaktiv kategori"}
            </div>
          </section>

          <button
            type="button"
            className={
              styles.mobileSaveButton
            }
            disabled={isSaving}
            onClick={handleSubmit}
          >
            <Save size={17} />

            {isSaving
              ? "Sparar..."
              : "Skapa kategori"}
          </button>
        </aside>
      </div>
    </div>
  );
}
