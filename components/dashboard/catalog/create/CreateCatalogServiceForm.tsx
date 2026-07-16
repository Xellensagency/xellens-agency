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
  Calculator,
  CircleDollarSign,
  Eye,
  FileText,
  Save,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import {
  createCatalogServiceAction,
} from "@/app/dashboard/mallar/actions";

import type {
  CatalogCategory,
  CatalogServiceKind,
  CatalogUnit,
} from "@/lib/dashboard/catalog/catalog-types";

import styles from "./CreateCatalogServiceForm.module.css";

type CreateCatalogServiceFormProps = {
  categories: CatalogCategory[];
  units: CatalogUnit[];
};

type FormState = {
  serviceKind: CatalogServiceKind;
  categoryId: string;
  code: string;
  name: string;
  shortDescription: string;
  description: string;
  pricingModel:
    | "fixed"
    | "quantity";
  unitCode: string;
  quantity: string;
  unitPriceExVat: string;
  vatRate: string;
  customerVisible: boolean;
  isActive: boolean;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

function findDefaultUnit(
  units: CatalogUnit[]
) {
  const activeUnits =
    units.filter(
      (unit) => unit.isActive
    );

  return (
    activeUnits.find(
      (unit) =>
        unit.code === "fixed"
    )?.code ||
    activeUnits[0]?.code ||
    "fixed"
  );
}

export default function CreateCatalogServiceForm({
  categories,
  units,
}: CreateCatalogServiceFormProps) {
  const router = useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<FormState>({
    serviceKind: "service",
    categoryId: "",
    code: "",
    name: "",
    shortDescription: "",
    description: "",
    pricingModel: "fixed",
    unitCode:
      findDefaultUnit(units),
    quantity: "1",
    unitPriceExVat: "",
    vatRate: "25",
    customerVisible: true,
    isActive: true,
  });

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive
    );

  const activeUnits =
    units.filter(
      (unit) => unit.isActive
    );

  const price =
    Math.max(
      Number(
        form.unitPriceExVat
      ) || 0,
      0
    );

  const quantity =
    Math.max(
      Number(form.quantity) || 1,
      0.01
    );

  const vatRate =
    Math.min(
      Math.max(
        Number(form.vatRate) || 0,
        0
      ),
      100
    );

  const subtotal =
    form.pricingModel === "fixed"
      ? price
      : price * quantity;

  const totalIncVat =
    subtotal *
    (1 + vatRate / 100);

  const currencyFormatter =
    new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    });

  function updateForm<
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function handlePricingModel(
    pricingModel:
      | "fixed"
      | "quantity"
  ) {
    const defaultUnit =
      pricingModel === "fixed"
        ? activeUnits.find(
            (unit) =>
              unit.code ===
              "fixed"
          )?.code ||
          form.unitCode
        : activeUnits.find(
            (unit) =>
              unit.code !==
              "fixed"
          )?.code ||
          form.unitCode;

    setForm((current) => ({
      ...current,
      pricingModel,
      unitCode: defaultUnit,
      quantity:
        pricingModel === "fixed"
          ? "1"
          : current.quantity,
    }));

    setFeedback(null);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setFeedback({
        type: "error",
        message:
          "Ange tjänstens namn.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await createCatalogServiceAction({
            serviceKind:
              form.serviceKind,

            categoryId:
              form.categoryId,

            code: form.code,

            name: form.name,

            shortDescription:
              form.shortDescription,

            description:
              form.description,

            pricingModel:
              form.pricingModel,

            unitCode:
              form.unitCode,

            quantity,

            unitPriceExVat:
              price,

            vatRate,

            customerVisible:
              form.customerVisible,

            isActive:
              form.isActive,
          });

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Tjänsten kunde inte sparas.",
          });

          return;
        }

        setFeedback({
          type: "success",
          message:
            form.serviceKind ===
            "addon"
              ? "Tilläggstjänsten är skapad."
              : "Tjänsten är skapad.",
        });

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
            : "Spara tjänst"}
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
          <Wrench size={22} />
        </span>

        <div>
          <small>
            Mallar & Paket
          </small>

          <h1>Skapa ny tjänst</h1>

          <p>
            Tjänsten blir tillgänglig i
            projekt, offerter och färdiga
            paket.
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <main
          className={
            styles.mainColumn
          }
        >
          <section className={styles.card}>
            <header>
              <span>
                <Sparkles size={19} />
              </span>

              <div>
                <h2>Tjänstetyp</h2>

                <p>
                  Välj hur posten ska
                  användas i katalogen.
                </p>
              </div>
            </header>

            <div
              className={
                styles.kindOptions
              }
            >
              <button
                type="button"
                className={
                  form.serviceKind ===
                  "service"
                    ? styles.selectedKind
                    : ""
                }
                onClick={() =>
                  updateForm(
                    "serviceKind",
                    "service"
                  )
                }
              >
                <span>
                  <Wrench size={21} />
                </span>

                <div>
                  <strong>
                    Vanlig tjänst
                  </strong>

                  <small>
                    Exempelvis webbdesign,
                    programmering eller
                    grafisk produktion.
                  </small>
                </div>
              </button>

              <button
                type="button"
                className={
                  form.serviceKind ===
                  "addon"
                    ? styles.selectedKind
                    : ""
                }
                onClick={() =>
                  updateForm(
                    "serviceKind",
                    "addon"
                  )
                }
              >
                <span>
                  <Sparkles
                    size={21}
                  />
                </span>

                <div>
                  <strong>
                    Tilläggstjänst
                  </strong>

                  <small>
                    Exempelvis extra sida,
                    support, SEO eller
                    snabb leverans.
                  </small>
                </div>
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <span>
                <FileText size={19} />
              </span>

              <div>
                <h2>Grunduppgifter</h2>

                <p>
                  Namn, kategori och
                  beskrivning.
                </p>
              </div>
            </header>

            <div className={styles.formGrid}>
              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Tjänstens namn
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={form.name}
                  placeholder="Exempel: Modern företagshemsida"
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Kategori</span>

                <select
                  value={
                    form.categoryId
                  }
                  onChange={(event) =>
                    updateForm(
                      "categoryId",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Ingen kategori
                  </option>

                  {activeCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Tjänstekod</span>

                <input
                  type="text"
                  value={form.code}
                  placeholder="Exempel: WEB-001"
                  onChange={(event) =>
                    updateForm(
                      "code",
                      event.target.value
                        .toUpperCase()
                    )
                  }
                />
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Kort beskrivning
                </span>

                <input
                  type="text"
                  value={
                    form.shortDescription
                  }
                  placeholder="En kort text som visas i tjänstekatalogen."
                  onChange={(event) =>
                    updateForm(
                      "shortDescription",
                      event.target.value
                    )
                  }
                />
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Fullständig beskrivning
                </span>

                <textarea
                  rows={6}
                  value={
                    form.description
                  }
                  placeholder="Beskriv vad tjänsten innehåller, vad som ingår och hur den levereras."
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
              <span>
                <CircleDollarSign
                  size={19}
                />
              </span>

              <div>
                <h2>Pris och enhet</h2>

                <p>
                  Ange tjänstens
                  standardpris exklusive
                  moms.
                </p>
              </div>
            </header>

            <div
              className={
                styles.pricingModes
              }
            >
              <button
                type="button"
                className={
                  form.pricingModel ===
                  "fixed"
                    ? styles.selectedMode
                    : ""
                }
                onClick={() =>
                  handlePricingModel(
                    "fixed"
                  )
                }
              >
                Fast pris
              </button>

              <button
                type="button"
                className={
                  form.pricingModel ===
                  "quantity"
                    ? styles.selectedMode
                    : ""
                }
                onClick={() =>
                  handlePricingModel(
                    "quantity"
                  )
                }
              >
                Pris per enhet
              </button>
            </div>

            <div className={styles.formGrid}>
              <label>
                <span>
                  Pris exkl. moms
                </span>

                <div
                  className={
                    styles.suffixInput
                  }
                >
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={
                      form.unitPriceExVat
                    }
                    placeholder="0"
                    onChange={(event) =>
                      updateForm(
                        "unitPriceExVat",
                        event.target.value
                      )
                    }
                  />

                  <span>kr</span>
                </div>
              </label>

              <label>
                <span>Enhet</span>

                <select
                  value={form.unitCode}
                  onChange={(event) =>
                    updateForm(
                      "unitCode",
                      event.target.value
                    )
                  }
                >
                  {activeUnits.map(
                    (unit) => (
                      <option
                        key={unit.code}
                        value={unit.code}
                      >
                        {unit.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>
                  Standardantal
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.25"
                  disabled={
                    form.pricingModel ===
                    "fixed"
                  }
                  value={form.quantity}
                  onChange={(event) =>
                    updateForm(
                      "quantity",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Moms</span>

                <div
                  className={
                    styles.suffixInput
                  }
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.vatRate}
                    onChange={(event) =>
                      updateForm(
                        "vatRate",
                        event.target.value
                      )
                    }
                  />

                  <span>%</span>
                </div>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <span>
                <Eye size={19} />
              </span>

              <div>
                <h2>
                  Synlighet och status
                </h2>

                <p>
                  Styr var tjänsten får
                  visas.
                </p>
              </div>
            </header>

            <div
              className={
                styles.toggleList
              }
            >
              <label>
                <div>
                  <strong>
                    Synlig för kunden
                  </strong>

                  <small>
                    Tjänsten kan visas i
                    offert och kundportal.
                  </small>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.customerVisible
                  }
                  onChange={(event) =>
                    updateForm(
                      "customerVisible",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label>
                <div>
                  <strong>
                    Aktiv tjänst
                  </strong>

                  <small>
                    Tjänsten kan väljas i
                    nya projekt och offerter.
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

        <aside
          className={
            styles.summaryColumn
          }
        >
          <section
            className={
              styles.summaryCard
            }
          >
            <header>
              <Calculator size={19} />

              <div>
                <h2>Sammanfattning</h2>

                <p>
                  Så visas tjänstens
                  standardpris.
                </p>
              </div>
            </header>

            <div
              className={
                styles.summaryIcon
              }
            >
              {form.serviceKind ===
              "addon" ? (
                <Sparkles size={26} />
              ) : (
                <Wrench size={26} />
              )}
            </div>

            <h3>
              {form.name.trim() ||
                "Namnlös tjänst"}
            </h3>

            <span
              className={
                styles.kindBadge
              }
            >
              {form.serviceKind ===
              "addon"
                ? "Tilläggstjänst"
                : "Vanlig tjänst"}
            </span>

            <dl>
              <div>
                <dt>Pris exkl. moms</dt>

                <dd>
                  {currencyFormatter.format(
                    subtotal
                  )}
                </dd>
              </div>

              <div>
                <dt>Moms</dt>

                <dd>
                  {currencyFormatter.format(
                    totalIncVat -
                      subtotal
                  )}
                </dd>
              </div>

              <div
                className={
                  styles.totalRow
                }
              >
                <dt>Pris inkl. moms</dt>

                <dd>
                  {currencyFormatter.format(
                    totalIncVat
                  )}
                </dd>
              </div>
            </dl>

            <div
              className={
                styles.summaryStatus
              }
            >
              <BadgeCheck size={17} />

              <span>
                {form.isActive
                  ? "Aktiv och redo att användas"
                  : "Sparas som inaktiv"}
              </span>
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
              : "Skapa tjänsten"}
          </button>
        </aside>
      </div>
    </div>
  );
}
