"use client";

import Link from "next/link";

import {
  useMemo,
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
  Check,
  Eye,
  Layers3,
  PackageOpen,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import {
  createCatalogPackageAction,
} from "@/app/dashboard/mallar/actions";

import type {
  CatalogService,
  CatalogUnit,
} from "@/lib/dashboard/catalog/catalog-types";

import styles from "./CreateCatalogPackageForm.module.css";

type CreateCatalogPackageFormProps = {
  services: CatalogService[];
  units: CatalogUnit[];
};

type PackageFormState = {
  code: string;
  name: string;
  shortDescription: string;
  description: string;
  priceMode:
    | "sum_items"
    | "fixed";
  fixedPriceExVat: string;
  discountPercent: string;
  customerVisible: boolean;
  isActive: boolean;
};

type PackageItemDraft = {
  serviceId: string;
  quantity: string;
  unitCode: string;
  unitPriceExVat: string;
  discountPercent: string;
  isOptional: boolean;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

function numberValue(
  value: string,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

export default function CreateCatalogPackageForm({
  services,
  units,
}: CreateCatalogPackageFormProps) {
  const router = useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<PackageFormState>({
    code: "",
    name: "",
    shortDescription: "",
    description: "",
    priceMode: "sum_items",
    fixedPriceExVat: "",
    discountPercent: "0",
    customerVisible: true,
    isActive: true,
  });

  const [
    selectedItems,
    setSelectedItems,
  ] = useState<PackageItemDraft[]>(
    []
  );

  const activeServices =
    useMemo(
      () =>
        services.filter(
          (service) =>
            service.isActive
        ),
      [services]
    );

  const activeUnits =
    useMemo(
      () =>
        units.filter(
          (unit) => unit.isActive
        ),
      [units]
    );

  const serviceById =
    useMemo(
      () =>
        new Map(
          services.map((service) => [
            service.id,
            service,
          ])
        ),
      [services]
    );

  const selectedIds =
    useMemo(
      () =>
        new Set(
          selectedItems.map(
            (item) =>
              item.serviceId
          )
        ),
      [selectedItems]
    );

  const filteredServices =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return activeServices;
      }

      return activeServices.filter(
        (service) =>
          [
            service.name,
            service.code ?? "",
            service.categoryName ?? "",
            service.shortDescription ??
              "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      activeServices,
      search,
    ]);

  function updateForm<
    K extends keyof PackageFormState
  >(
    field: K,
    value: PackageFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function addService(
    service: CatalogService
  ) {
    if (
      selectedIds.has(service.id)
    ) {
      return;
    }

    setSelectedItems(
      (current) => [
        ...current,
        {
          serviceId: service.id,
          quantity: String(
            service.quantity || 1
          ),
          unitCode:
            service.unitCode ||
            "fixed",
          unitPriceExVat: String(
            service.unitPriceExVat ||
              0
          ),
          discountPercent: "0",
          isOptional: false,
        },
      ]
    );

    setFeedback(null);
  }

  function updateItem(
    serviceId: string,
    updates:
      Partial<PackageItemDraft>
  ) {
    setSelectedItems(
      (current) =>
        current.map((item) =>
          item.serviceId ===
          serviceId
            ? {
                ...item,
                ...updates,
              }
            : item
        )
    );

    setFeedback(null);
  }

  function removeItem(
    serviceId: string
  ) {
    setSelectedItems(
      (current) =>
        current.filter(
          (item) =>
            item.serviceId !==
            serviceId
        )
    );
  }

  function calculateItemTotal(
    item: PackageItemDraft
  ) {
    const quantity =
      Math.max(
        numberValue(
          item.quantity,
          1
        ),
        0.01
      );

    const unitPrice =
      Math.max(
        numberValue(
          item.unitPriceExVat
        ),
        0
      );

    const discount =
      Math.min(
        Math.max(
          numberValue(
            item.discountPercent
          ),
          0
        ),
        100
      );

    return (
      quantity *
      unitPrice *
      (1 - discount / 100)
    );
  }

  const serviceSubtotal =
    selectedItems.reduce(
      (total, item) =>
        total +
        calculateItemTotal(item),
      0
    );

  const packageDiscount =
    form.priceMode === "sum_items"
      ? Math.min(
          Math.max(
            numberValue(
              form.discountPercent
            ),
            0
          ),
          100
        )
      : 0;

  const discountAmount =
    serviceSubtotal *
    (packageDiscount / 100);

  const calculatedPackagePrice =
    Math.max(
      serviceSubtotal -
        discountAmount,
      0
    );

  const fixedPrice =
    Math.max(
      numberValue(
        form.fixedPriceExVat
      ),
      0
    );

  const finalPrice =
    form.priceMode === "fixed"
      ? fixedPrice
      : calculatedPackagePrice;

  function handleSubmit() {
    if (!form.name.trim()) {
      setFeedback({
        type: "error",
        message:
          "Ange paketets namn.",
      });

      return;
    }

    if (
      selectedItems.length === 0
    ) {
      setFeedback({
        type: "error",
        message:
          "Välj minst en tjänst.",
      });

      return;
    }

    if (
      form.priceMode === "fixed" &&
      fixedPrice <= 0
    ) {
      setFeedback({
        type: "error",
        message:
          "Ange ett fast paketpris.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await createCatalogPackageAction({
            code: form.code,

            name: form.name,

            shortDescription:
              form.shortDescription,

            description:
              form.description,

            priceMode:
              form.priceMode,

            fixedPriceExVat:
              fixedPrice,

            discountPercent:
              packageDiscount,

            customerVisible:
              form.customerVisible,

            isActive:
              form.isActive,

            items:
              selectedItems.map(
                (item) => ({
                  serviceId:
                    item.serviceId,

                  quantity:
                    Math.max(
                      numberValue(
                        item.quantity,
                        1
                      ),
                      0.01
                    ),

                  unitCode:
                    item.unitCode,

                  unitPriceExVat:
                    Math.max(
                      numberValue(
                        item.unitPriceExVat
                      ),
                      0
                    ),

                  discountPercent:
                    Math.min(
                      Math.max(
                        numberValue(
                          item.discountPercent
                        ),
                        0
                      ),
                      100
                    ),

                  isOptional:
                    item.isOptional,
                })
              ),
          });

        if (!result.ok) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Paketet kunde inte sparas.",
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
            : "Skapa paket"}
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
          <PackageOpen size={23} />
        </span>

        <div>
          <small>
            Mallar & Paket
          </small>

          <h1>Skapa nytt paket</h1>

          <p>
            Kombinera flera tjänster till
            ett återanvändbart paket för
            projekt och offerter.
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <section className={styles.card}>
            <header>
              <Layers3 size={19} />

              <div>
                <h2>Paketuppgifter</h2>

                <p>
                  Namn, kod och
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
                  Paketets namn
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={form.name}
                  placeholder="Exempel: Komplett företagspaket"
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Paketkod</span>

                <input
                  type="text"
                  value={form.code}
                  placeholder="Exempel: PAK-001"
                  onChange={(event) =>
                    updateForm(
                      "code",
                      event.target.value
                        .toUpperCase()
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Kort beskrivning
                </span>

                <input
                  type="text"
                  value={
                    form.shortDescription
                  }
                  placeholder="Kort presentation av paketet"
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
                  rows={5}
                  value={
                    form.description
                  }
                  placeholder="Beskriv paketets innehåll, målgrupp och leverans."
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
              <Calculator size={19} />

              <div>
                <h2>Prismodell</h2>

                <p>
                  Summera tjänster eller
                  ange ett fast paketpris.
                </p>
              </div>
            </header>

            <div className={styles.priceModes}>
              <button
                type="button"
                className={
                  form.priceMode ===
                  "sum_items"
                    ? styles.selectedMode
                    : ""
                }
                onClick={() =>
                  updateForm(
                    "priceMode",
                    "sum_items"
                  )
                }
              >
                Summera tjänster
              </button>

              <button
                type="button"
                className={
                  form.priceMode ===
                  "fixed"
                    ? styles.selectedMode
                    : ""
                }
                onClick={() =>
                  updateForm(
                    "priceMode",
                    "fixed"
                  )
                }
              >
                Fast paketpris
              </button>
            </div>

            <div className={styles.formGrid}>
              {form.priceMode ===
              "sum_items" ? (
                <label>
                  <span>Paketrabatt</span>

                  <div
                    className={
                      styles.suffixInput
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        form.discountPercent
                      }
                      onChange={(event) =>
                        updateForm(
                          "discountPercent",
                          event.target.value
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>
              ) : (
                <label>
                  <span>
                    Fast pris exkl. moms
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
                        form.fixedPriceExVat
                      }
                      onChange={(event) =>
                        updateForm(
                          "fixedPriceExVat",
                          event.target.value
                        )
                      }
                    />

                    <span>kr</span>
                  </div>
                </label>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <Wrench size={19} />

              <div>
                <h2>Välj tjänster</h2>

                <p>
                  Lägg till tjänster och
                  tillägg i paketet.
                </p>
              </div>
            </header>

            <div className={styles.searchArea}>
              <label>
                <Search size={17} />

                <input
                  type="search"
                  value={search}
                  placeholder="Sök tjänst eller tillägg..."
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>

            <div className={styles.serviceGrid}>
              {filteredServices.map(
                (service) => {
                  const selected =
                    selectedIds.has(
                      service.id
                    );

                  return (
                    <article
                      key={service.id}
                    >
                      <span>
                        {service.serviceKind ===
                        "addon" ? (
                          <Sparkles
                            size={18}
                          />
                        ) : (
                          <Wrench
                            size={18}
                          />
                        )}
                      </span>

                      <div>
                        <small>
                          {service.categoryName ||
                            "Ingen kategori"}
                        </small>

                        <strong>
                          {service.name}
                        </strong>

                        <em>
                          {currencyFormatter.format(
                            service.unitPriceExVat
                          )}
                        </em>
                      </div>

                      <button
                        type="button"
                        disabled={selected}
                        onClick={() =>
                          addService(service)
                        }
                      >
                        {selected ? (
                          <>
                            <Check
                              size={15}
                            />
                            Tillagd
                          </>
                        ) : (
                          <>
                            <Plus
                              size={15}
                            />
                            Lägg till
                          </>
                        )}
                      </button>
                    </article>
                  );
                }
              )}
            </div>

            {filteredServices.length ===
              0 && (
              <div className={styles.empty}>
                Inga tjänster hittades.
              </div>
            )}
          </section>

          <section className={styles.card}>
            <header>
              <PackageOpen size={19} />

              <div>
                <h2>Paketets innehåll</h2>

                <p>
                  Anpassa antal, pris och
                  rabatt för varje rad.
                </p>
              </div>

              <strong
                className={
                  styles.itemCount
                }
              >
                {selectedItems.length}
              </strong>
            </header>

            {selectedItems.length ===
            0 ? (
              <div className={styles.empty}>
                Paketet innehåller ännu
                inga tjänster.
              </div>
            ) : (
              <div
                className={
                  styles.selectedList
                }
              >
                {selectedItems.map(
                  (item, index) => {
                    const service =
                      serviceById.get(
                        item.serviceId
                      );

                    if (!service) {
                      return null;
                    }

                    return (
                      <article
                        key={
                          item.serviceId
                        }
                        className={
                          styles.selectedRow
                        }
                      >
                        <div
                          className={
                            styles.rowNumber
                          }
                        >
                          {index + 1}
                        </div>

                        <div
                          className={
                            styles.rowName
                          }
                        >
                          <strong>
                            {service.name}
                          </strong>

                          <small>
                            {service.serviceKind ===
                            "addon"
                              ? "Tilläggstjänst"
                              : service.categoryName ||
                                "Tjänst"}
                          </small>
                        </div>

                        <label>
                          <span>Antal</span>

                          <input
                            type="number"
                            min="0.01"
                            step="0.25"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.serviceId,
                                {
                                  quantity:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Enhet</span>

                          <select
                            value={
                              item.unitCode
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.serviceId,
                                {
                                  unitCode:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                          >
                            {activeUnits.map(
                              (unit) => (
                                <option
                                  key={
                                    unit.code
                                  }
                                  value={
                                    unit.code
                                  }
                                >
                                  {
                                    unit.shortLabel
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label>
                          <span>
                            Pris exkl.
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={
                              item.unitPriceExVat
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.serviceId,
                                {
                                  unitPriceExVat:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Rabatt</span>

                          <div
                            className={
                              styles.smallSuffix
                            }
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                item.discountPercent
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.serviceId,
                                  {
                                    discountPercent:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <span>%</span>
                          </div>
                        </label>

                        <label
                          className={
                            styles.optional
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              item.isOptional
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.serviceId,
                                {
                                  isOptional:
                                    event
                                      .target
                                      .checked,
                                }
                              )
                            }
                          />

                          <span>Valbar</span>
                        </label>

                        <strong
                          className={
                            styles.rowTotal
                          }
                        >
                          {currencyFormatter.format(
                            calculateItemTotal(
                              item
                            )
                          )}
                        </strong>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          aria-label={`Ta bort ${service.name}`}
                          onClick={() =>
                            removeItem(
                              item.serviceId
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <section className={styles.card}>
            <header>
              <Eye size={19} />

              <div>
                <h2>Status och synlighet</h2>

                <p>
                  Styr var paketet kan
                  användas.
                </p>
              </div>
            </header>

            <div className={styles.toggleList}>
              <label>
                <div>
                  <strong>
                    Synligt för kunden
                  </strong>

                  <small>
                    Paketet kan visas i
                    offerter och kundportal.
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
                    Aktivt paket
                  </strong>

                  <small>
                    Paketet går att välja i
                    nya offerter och projekt.
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
              <Calculator size={19} />

              <div>
                <h2>Sammanfattning</h2>

                <p>
                  Paketets beräknade pris.
                </p>
              </div>
            </header>

            <div className={styles.packageIcon}>
              <PackageOpen size={27} />
            </div>

            <h3>
              {form.name.trim() ||
                "Namnlöst paket"}
            </h3>

            <span className={styles.badge}>
              {selectedItems.length}{" "}
              {selectedItems.length === 1
                ? "tjänst"
                : "tjänster"}
            </span>

            <dl>
              <div>
                <dt>Tjänstesumma</dt>

                <dd>
                  {currencyFormatter.format(
                    serviceSubtotal
                  )}
                </dd>
              </div>

              {form.priceMode ===
                "sum_items" &&
                discountAmount > 0 && (
                  <div
                    className={
                      styles.discountRow
                    }
                  >
                    <dt>
                      Paketrabatt
                    </dt>

                    <dd>
                      −{" "}
                      {currencyFormatter.format(
                        discountAmount
                      )}
                    </dd>
                  </div>
                )}

              <div
                className={
                  styles.totalRow
                }
              >
                <dt>
                  Paketpris exkl. moms
                </dt>

                <dd>
                  {currencyFormatter.format(
                    finalPrice
                  )}
                </dd>
              </div>
            </dl>

            <div className={styles.summaryStatus}>
              <BadgeCheck size={17} />

              <span>
                {form.isActive
                  ? "Aktivt när det sparas"
                  : "Sparas som inaktivt"}
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
              : "Skapa paket"}
          </button>
        </aside>
      </div>
    </div>
  );
}
