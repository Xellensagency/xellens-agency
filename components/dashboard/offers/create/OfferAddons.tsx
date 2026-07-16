"use client";

import {
  BadgePercent,
  Check,
  CircleDollarSign,
  Gift,
  Languages,
  Minus,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  CreateProjectService,
} from "@/lib/dashboard/projects/create-project-types";

import type {
  CreateOfferOptions,
  OfferAddonDraft,
  OfferDiscountDraft,
  OfferDraft,
  OfferServiceDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import {
  calculateOfferLineSubtotal,
  calculateOfferTotals,
} from "@/lib/dashboard/offers/offer-calculations";

import styles from "./OfferAddons.module.css";

type OfferAddonsProps = {
  options: CreateOfferOptions;
  draft: OfferDraft;
  services: OfferServiceDraft[];
  addons: OfferAddonDraft[];
  discount: OfferDiscountDraft;

  onDraftChange: <
    K extends keyof OfferDraft
  >(
    field: K,
    value: OfferDraft[K]
  ) => void;

  onAddonsChange: (
    addons: OfferAddonDraft[]
  ) => void;

  onDiscountChange: (
    discount: OfferDiscountDraft
  ) => void;
};

type CustomAddonForm = {
  name: string;
  description: string;
  price: string;
  vatRate: string;
};

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

const initialCustomAddon: CustomAddonForm = {
  name: "",
  description: "",
  price: "",
  vatRate: "25",
};

function createId() {
  return crypto.randomUUID();
}

function createAddonFromService(
  service: CreateProjectService
): OfferAddonDraft {
  return {
    id: createId(),
    sourceServiceId: service.id,
    sourcePackageId: null,
    categoryId: service.category_id,
    name: service.name,
    description:
      service.description ??
      service.short_description ??
      "",
    pricingModel:
      service.pricing_model,
    unitCode: service.unit_code,
    quantity:
      Math.max(
        1,
        Number(service.quantity) || 1
      ),
    unitPriceExVat:
      Math.max(
        0,
        Number(
          service.unit_price_ex_vat
        ) || 0
      ),
    discountPercent: 0,
    vatRate:
      Math.max(
        0,
        Number(service.vat_rate) || 25
      ),
    customerVisible: true,
    isOptional: true,
  };
}

export default function OfferAddons({
  options,
  draft,
  services,
  addons,
  discount,
  onDraftChange,
  onAddonsChange,
  onDiscountChange,
}: OfferAddonsProps) {
  const [search, setSearch] =
    useState("");

  const [
    showCustomAddon,
    setShowCustomAddon,
  ] = useState(false);

  const [
    customAddon,
    setCustomAddon,
  ] = useState<CustomAddonForm>(
    initialCustomAddon
  );

  const selectedSourceIds = useMemo(
    () =>
      new Set(
        [
          ...services,
          ...addons,
        ]
          .map(
            (service) =>
              service.sourceServiceId
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    [services, addons]
  );

  const recommendedServices =
    useMemo(() => {
      const cleanSearch =
        search.trim().toLowerCase();

      return options.services
        .filter(
          (service) =>
            !selectedSourceIds.has(
              service.id
            )
        )
        .filter((service) => {
          if (!cleanSearch) {
            return true;
          }

          return [
            service.name,
            service.short_description ??
              "",
            service.category_name ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(cleanSearch);
        })
        .slice(0, 8);
    }, [
      options.services,
      search,
      selectedSourceIds,
    ]);

  const totals =
    calculateOfferTotals(
      services,
      addons,
      discount
    );

  function toggleAddon(
    sourceService: CreateProjectService
  ) {
    const selectedAddon =
      addons.find(
        (addon) =>
          addon.sourceServiceId ===
          sourceService.id
      );

    if (selectedAddon) {
      onAddonsChange(
        addons.filter(
          (addon) =>
            addon.id !==
            selectedAddon.id
        )
      );

      return;
    }

    onAddonsChange([
      ...addons,
      createAddonFromService(
        sourceService
      ),
    ]);
  }

  function updateAddon(
    id: string,
    changes: Partial<OfferAddonDraft>
  ) {
    onAddonsChange(
      addons.map((addon) =>
        addon.id === id
          ? {
              ...addon,
              ...changes,
            }
          : addon
      )
    );
  }

  function removeAddon(id: string) {
    onAddonsChange(
      addons.filter(
        (addon) => addon.id !== id
      )
    );
  }

  function addCustomAddon() {
    const name =
      customAddon.name.trim();

    const price =
      Number(customAddon.price);

    if (
      !name ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return;
    }

    const addon: OfferAddonDraft = {
      id: createId(),
      sourceServiceId: null,
      sourcePackageId: null,
      categoryId: null,
      name,
      description:
        customAddon.description.trim(),
      pricingModel: "fixed",
      unitCode: "fixed",
      quantity: 1,
      unitPriceExVat: price,
      discountPercent: 0,
      vatRate:
        Math.max(
          0,
          Number(
            customAddon.vatRate
          ) || 25
        ),
      customerVisible: true,
      isOptional: true,
    };

    onAddonsChange([
      ...addons,
      addon,
    ]);

    setCustomAddon(
      initialCustomAddon
    );

    setShowCustomAddon(false);
  }

  function setDiscountMode(
    mode: OfferDiscountDraft["mode"]
  ) {
    onDiscountChange({
      ...discount,
      mode,
      value:
        mode === "none"
          ? 0
          : discount.value,
    });
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>Steg 3</span>

          <h2>Tillägg och kampanj</h2>

          <p>
            Lägg till extratjänster och
            eventuell offert- eller
            kampanjrabatt.
          </p>
        </div>

        <strong>
          {addons.length} tillägg
        </strong>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Sparkles size={20} />

            <div>
              <h3>
                Rekommenderade tillägg
              </h3>

              <p>
                Komplettera offerten med
                relevanta extratjänster.
              </p>
            </div>
          </div>

          <label className={styles.search}>
            <Search size={16} />

            <input
              type="search"
              value={search}
              placeholder="Sök tillägg..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </label>
        </div>

        {recommendedServices.length ===
        0 ? (
          <div className={styles.empty}>
            <Gift size={28} />

            <strong>
              Inga fler tjänster hittades
            </strong>

            <span>
              Alla tillgängliga tjänster är
              redan valda eller matchar inte
              sökningen.
            </span>
          </div>
        ) : (
          <div className={styles.addonGrid}>
            {recommendedServices.map(
              (service) => (
                <article
                  key={service.id}
                  className={
                    styles.addonCard
                  }
                >
                  <span
                    className={
                      styles.addonIcon
                    }
                  >
                    <Gift size={20} />
                  </span>

                  <div>
                    <strong>
                      {service.name}
                    </strong>

                    <p>
                      {service.short_description ??
                        service.description ??
                        "Extra tjänst till offerten."}
                    </p>

                    <small>
                      {service.category_name ??
                        "Tilläggstjänst"}
                    </small>
                  </div>

                  <div
                    className={
                      styles.addonFooter
                    }
                  >
                    <strong>
                      {currencyFormatter.format(
                        service.unit_price_ex_vat
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        toggleAddon(
                          service
                        )
                      }
                    >
                      <Plus size={15} />
                      Lägg till
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.customToggle}
          onClick={() =>
            setShowCustomAddon(
              (current) => !current
            )
          }
        >
          <Plus size={16} />

          {showCustomAddon
            ? "Stäng eget tillägg"
            : "Skapa eget tillägg"}
        </button>

        {showCustomAddon && (
          <div className={styles.customForm}>
            <label>
              <span>
                Tilläggets namn *
              </span>

              <input
                type="text"
                value={customAddon.name}
                onChange={(event) =>
                  setCustomAddon(
                    (current) => ({
                      ...current,
                      name:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              <span>
                Pris exkl. moms *
              </span>

              <input
                type="number"
                min="0"
                value={customAddon.price}
                onChange={(event) =>
                  setCustomAddon(
                    (current) => ({
                      ...current,
                      price:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              <span>Moms %</span>

              <input
                type="number"
                min="0"
                value={
                  customAddon.vatRate
                }
                onChange={(event) =>
                  setCustomAddon(
                    (current) => ({
                      ...current,
                      vatRate:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label
              className={styles.gridFull}
            >
              <span>Beskrivning</span>

              <textarea
                rows={3}
                value={
                  customAddon.description
                }
                onChange={(event) =>
                  setCustomAddon(
                    (current) => ({
                      ...current,
                      description:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <button
              type="button"
              className={
                styles.addCustomButton
              }
              disabled={
                !customAddon.name.trim() ||
                !customAddon.price
              }
              onClick={addCustomAddon}
            >
              <Check size={16} />
              Lägg till i offerten
            </button>
          </div>
        )}
      </div>

      {addons.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <Gift size={20} />

              <div>
                <h3>Valda tillägg</h3>

                <p>
                  Anpassa antal, pris och
                  synlighet.
                </p>
              </div>
            </div>

            <strong
              className={
                styles.sectionTotal
              }
            >
              {currencyFormatter.format(
                totals.addonsSubtotal
              )}
            </strong>
          </div>

          <div className={styles.selectedList}>
            {addons.map((addon) => (
              <article key={addon.id}>
                <div
                  className={
                    styles.selectedInfo
                  }
                >
                  <strong>
                    {addon.name}
                  </strong>

                  <span>
                    {addon.isOptional
                      ? "Valbart tillägg"
                      : "Obligatoriskt tillägg"}
                  </span>
                </div>

                <div
                  className={
                    styles.quantity
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateAddon(
                        addon.id,
                        {
                          quantity:
                            Math.max(
                              1,
                              addon.quantity -
                                1
                            ),
                        }
                      )
                    }
                  >
                    <Minus size={14} />
                  </button>

                  <span>
                    {addon.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateAddon(
                        addon.id,
                        {
                          quantity:
                            addon.quantity +
                            1,
                        }
                      )
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <label
                  className={
                    styles.priceInput
                  }
                >
                  <span>Pris</span>

                  <input
                    type="number"
                    min="0"
                    value={
                      addon.unitPriceExVat
                    }
                    onChange={(event) =>
                      updateAddon(
                        addon.id,
                        {
                          unitPriceExVat:
                            Math.max(
                              0,
                              Number(
                                event.target
                                  .value
                              ) || 0
                            ),
                        }
                      )
                    }
                  />
                </label>

                <label
                  className={
                    styles.optionalToggle
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      addon.isOptional
                    }
                    onChange={(event) =>
                      updateAddon(
                        addon.id,
                        {
                          isOptional:
                            event.target
                              .checked,
                        }
                      )
                    }
                  />

                  Valbar
                </label>

                <strong
                  className={
                    styles.lineTotal
                  }
                >
                  {currencyFormatter.format(
                    calculateOfferLineSubtotal(
                      addon
                    )
                  )}
                </strong>

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  aria-label={`Ta bort ${addon.name}`}
                  onClick={() =>
                    removeAddon(addon.id)
                  }
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <BadgePercent size={20} />

            <div>
              <h3>Rabatt och kampanj</h3>

              <p>
                Lägg till en kampanj eller
                manuell rabatt.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.discountModes}>
          <button
            type="button"
            className={
              discount.mode === "none"
                ? styles.activeMode
                : ""
            }
            onClick={() =>
              setDiscountMode("none")
            }
          >
            Ingen rabatt
          </button>

          <button
            type="button"
            className={
              discount.mode === "percent"
                ? styles.activeMode
                : ""
            }
            onClick={() =>
              setDiscountMode("percent")
            }
          >
            <BadgePercent size={15} />
            Procentrabatt
          </button>

          <button
            type="button"
            className={
              discount.mode === "fixed"
                ? styles.activeMode
                : ""
            }
            onClick={() =>
              setDiscountMode("fixed")
            }
          >
            <CircleDollarSign size={15} />
            Beloppsrabatt
          </button>
        </div>

        {discount.mode !== "none" && (
          <div className={styles.discountForm}>
            <label>
              <span>
                {discount.mode ===
                "percent"
                  ? "Rabatt i procent"
                  : "Rabatt i kronor"}
              </span>

              <input
                type="number"
                min="0"
                max={
                  discount.mode ===
                  "percent"
                    ? 100
                    : undefined
                }
                value={discount.value}
                onChange={(event) =>
                  onDiscountChange({
                    ...discount,
                    value:
                      Math.max(
                        0,
                        Number(
                          event.target.value
                        ) || 0
                      ),
                  })
                }
              />
            </label>

            <label>
              <span>Rabattnamn</span>

              <input
                type="text"
                value={discount.label}
                placeholder="Exempel: Sommarrabatt"
                onChange={(event) =>
                  onDiscountChange({
                    ...discount,
                    label:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Kampanjkod</span>

              <input
                type="text"
                value={discount.code}
                placeholder="Exempel: XELLENS10"
                onChange={(event) =>
                  onDiscountChange({
                    ...discount,
                    code:
                      event.target.value.toUpperCase(),
                  })
                }
              />
            </label>
          </div>
        )}

        {discount.mode !== "none" &&
          totals.discountAmount > 0 && (
            <div
              className={
                styles.discountSummary
              }
            >
              <BadgePercent size={18} />

              <div>
                <span>
                  {discount.label ||
                    "Offertens rabatt"}
                </span>

                <strong>
                  −{" "}
                  {currencyFormatter.format(
                    totals.discountAmount
                  )}
                </strong>
              </div>
            </div>
          )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Languages size={20} />

            <div>
              <h3>Offertinställningar</h3>

              <p>
                Välj giltighetstid, språk och
                valuta.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.settingsGrid}>
          <label>
            <span>Giltighetstid</span>

            <select
              value={draft.validDays}
              onChange={(event) =>
                onDraftChange(
                  "validDays",
                  event.target.value
                )
              }
            >
              <option value="7">
                7 dagar
              </option>

              <option value="14">
                14 dagar
              </option>

              <option value="30">
                30 dagar
              </option>

              <option value="60">
                60 dagar
              </option>

              <option value="90">
                90 dagar
              </option>
            </select>
          </label>

          <label>
            <span>Språk</span>

            <select
              value={draft.language}
              onChange={(event) =>
                onDraftChange(
                  "language",
                  event.target
                    .value as OfferDraft["language"]
                )
              }
            >
              <option value="sv">
                Svenska
              </option>

              <option value="en">
                Engelska
              </option>
            </select>
          </label>

          <label>
            <span>Valuta</span>

            <select
              value={draft.currency}
              onChange={(event) =>
                onDraftChange(
                  "currency",
                  event.target
                    .value as OfferDraft["currency"]
                )
              }
            >
              <option value="SEK">
                SEK
              </option>

              <option value="EUR">
                EUR
              </option>

              <option value="USD">
                USD
              </option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
