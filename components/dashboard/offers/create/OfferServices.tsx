"use client";

import {
  Check,
  Layers3,
  Minus,
  PackageOpen,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  CreateProjectPackage,
  CreateProjectPackageItem,
  CreateProjectService,
} from "@/lib/dashboard/projects/create-project-types";

import type {
  CreateOfferOptions,
  OfferServiceDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import styles from "./OfferServices.module.css";

type OfferServicesProps = {
  options: CreateOfferOptions;
  services: OfferServiceDraft[];
  onChange: (
    services: OfferServiceDraft[]
  ) => void;
};

type ActiveView =
  | "catalog"
  | "packages"
  | "custom";

type CustomServiceForm = {
  name: string;
  description: string;
  categoryId: string;
  unitCode: string;
  quantity: string;
  unitPriceExVat: string;
  discountPercent: string;
  vatRate: string;
};

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

const initialCustomService: CustomServiceForm = {
  name: "",
  description: "",
  categoryId: "",
  unitCode: "fixed",
  quantity: "1",
  unitPriceExVat: "",
  discountPercent: "0",
  vatRate: "25",
};

function createId() {
  return crypto.randomUUID();
}

function calculateSubtotal(
  service: OfferServiceDraft
) {
  return (
    service.quantity *
    service.unitPriceExVat *
    (1 - service.discountPercent / 100)
  );
}

function combineDiscounts(
  firstDiscount: number,
  secondDiscount: number
) {
  const multiplier =
    (1 - firstDiscount / 100) *
    (1 - secondDiscount / 100);

  return (
    Math.round(
      (1 - multiplier) * 10000
    ) / 100
  );
}

function createServiceDraft(
  service: CreateProjectService
): OfferServiceDraft {
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
      Number(service.quantity) || 1,
    unitPriceExVat:
      Number(
        service.unit_price_ex_vat
      ) || 0,
    discountPercent: 0,
    vatRate:
      Number(service.vat_rate) || 25,
    customerVisible:
      service.customer_visible,
    isOptional: false,
  };
}

function createPackageItemDraft(
  item: CreateProjectPackageItem,
  packageData: CreateProjectPackage
): OfferServiceDraft {
  return {
    id: createId(),
    sourceServiceId:
      item.service_id || null,
    sourcePackageId: packageData.id,
    categoryId: item.category_id,
    name: item.service_name,
    description:
      item.description ?? "",
    pricingModel:
      item.unit_code === "fixed"
        ? "fixed"
        : "quantity",
    unitCode: item.unit_code,
    quantity:
      Number(item.quantity) || 1,
    unitPriceExVat:
      Number(
        item.unit_price_ex_vat
      ) || 0,
    discountPercent:
      combineDiscounts(
        Number(
          packageData.discount_percent
        ) || 0,
        Number(
          item.discount_percent
        ) || 0
      ),
    vatRate:
      Number(item.vat_rate) || 25,
    customerVisible: true,
    isOptional: item.is_optional,
  };
}

function createPackageDrafts(
  packageData: CreateProjectPackage
): OfferServiceDraft[] {
  if (
    packageData.price_mode === "fixed" &&
    packageData.fixed_price_ex_vat != null
  ) {
    return [
      {
        id: createId(),
        sourceServiceId: null,
        sourcePackageId:
          packageData.id,
        categoryId: null,
        name: packageData.name,
        description:
          packageData.description ??
          packageData.short_description ??
          "",
        pricingModel: "fixed",
        unitCode: "fixed",
        quantity: 1,
        unitPriceExVat:
          Number(
            packageData.fixed_price_ex_vat
          ) || 0,
        discountPercent:
          Number(
            packageData.discount_percent
          ) || 0,
        vatRate: 25,
        customerVisible: true,
        isOptional: false,
      },
    ];
  }

  return packageData.items.map(
    (item) =>
      createPackageItemDraft(
        item,
        packageData
      )
  );
}

export default function OfferServices({
  options,
  services,
  onChange,
}: OfferServicesProps) {
  const [activeView, setActiveView] =
    useState<ActiveView>("catalog");

  const [search, setSearch] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    customService,
    setCustomService,
  ] = useState<CustomServiceForm>(
    initialCustomService
  );

  const filteredServices = useMemo(
    () => {
      const cleanSearch =
        search.trim().toLowerCase();

      return options.services.filter(
        (service) => {
          if (
            categoryFilter !== "all" &&
            service.category_id !==
              categoryFilter
          ) {
            return false;
          }

          if (!cleanSearch) {
            return true;
          }

          return [
            service.name,
            service.short_description ??
              "",
            service.description ?? "",
            service.category_name ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(cleanSearch);
        }
      );
    },
    [
      options.services,
      search,
      categoryFilter,
    ]
  );

  function findSelectedService(
    sourceServiceId: string
  ) {
    return services.find(
      (service) =>
        service.sourceServiceId ===
          sourceServiceId &&
        service.sourcePackageId == null
    );
  }

  function toggleCatalogService(
    sourceService: CreateProjectService
  ) {
    const selected =
      findSelectedService(
        sourceService.id
      );

    if (selected) {
      onChange(
        services.filter(
          (service) =>
            service.id !== selected.id
        )
      );

      return;
    }

    onChange([
      ...services,
      createServiceDraft(
        sourceService
      ),
    ]);
  }

  function updateQuantity(
    id: string,
    change: number
  ) {
    onChange(
      services.map((service) =>
        service.id === id
          ? {
              ...service,
              quantity: Math.max(
                1,
                service.quantity + change
              ),
            }
          : service
      )
    );
  }

  function removeService(id: string) {
    onChange(
      services.filter(
        (service) =>
          service.id !== id
      )
    );
  }

  function addPackage(
    packageData: CreateProjectPackage
  ) {
    const packageAlreadyAdded =
      services.some(
        (service) =>
          service.sourcePackageId ===
          packageData.id
      );

    if (packageAlreadyAdded) {
      onChange(
        services.filter(
          (service) =>
            service.sourcePackageId !==
            packageData.id
        )
      );

      return;
    }

    onChange([
      ...services,
      ...createPackageDrafts(
        packageData
      ),
    ]);
  }

  function addCustomService() {
    const cleanName =
      customService.name.trim();

    const price = Number(
      customService.unitPriceExVat
    );

    if (
      !cleanName ||
      !Number.isFinite(price)
    ) {
      return;
    }

    const service: OfferServiceDraft = {
      id: createId(),
      sourceServiceId: null,
      sourcePackageId: null,
      categoryId:
        customService.categoryId ||
        null,
      name: cleanName,
      description:
        customService.description.trim(),
      pricingModel:
        customService.unitCode ===
        "fixed"
          ? "fixed"
          : "quantity",
      unitCode:
        customService.unitCode,
      quantity: Math.max(
        1,
        Number(
          customService.quantity
        ) || 1
      ),
      unitPriceExVat: price,
      discountPercent: Math.max(
        0,
        Number(
          customService.discountPercent
        ) || 0
      ),
      vatRate: Math.max(
        0,
        Number(
          customService.vatRate
        ) || 25
      ),
      customerVisible: true,
      isOptional: false,
    };

    onChange([
      ...services,
      service,
    ]);

    setCustomService(
      initialCustomService
    );

    setActiveView("catalog");
  }

  const subtotal = services.reduce(
    (sum, service) =>
      sum +
      calculateSubtotal(service),
    0
  );

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>Steg 2</span>

          <h2>Välj tjänster</h2>

          <p>
            Lägg till tjänster, paket eller
            skapa en egen offertrad.
          </p>
        </div>

        <strong>
          {services.length} valda
        </strong>
      </header>

      <div className={styles.viewTabs}>
        <button
          type="button"
          className={
            activeView === "catalog"
              ? styles.activeView
              : ""
          }
          onClick={() =>
            setActiveView("catalog")
          }
        >
          <Wrench size={16} />
          Tjänstekatalog
        </button>

        <button
          type="button"
          className={
            activeView === "packages"
              ? styles.activeView
              : ""
          }
          onClick={() =>
            setActiveView("packages")
          }
        >
          <PackageOpen size={16} />
          Paket
        </button>

        <button
          type="button"
          className={
            activeView === "custom"
              ? styles.activeView
              : ""
          }
          onClick={() =>
            setActiveView("custom")
          }
        >
          <Plus size={16} />
          Egen tjänst
        </button>
      </div>

      {activeView === "catalog" && (
        <>
          <div className={styles.catalogTools}>
            <label className={styles.search}>
              <Search size={17} />

              <input
                type="search"
                value={search}
                placeholder="Sök tjänst..."
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Alla kategorier
              </option>

              {options.categories.map(
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
          </div>

          {filteredServices.length === 0 ? (
            <div className={styles.emptyState}>
              <Wrench size={30} />

              <strong>
                Inga tjänster hittades
              </strong>

              <span>
                Skapa tjänster under Mallar
                & Paket eller lägg till en
                egen tjänst.
              </span>
            </div>
          ) : (
            <div className={styles.serviceList}>
              {filteredServices.map(
                (service) => {
                  const selected =
                    findSelectedService(
                      service.id
                    );

                  return (
                    <article
                      key={service.id}
                      className={[
                        styles.serviceCard,
                        selected
                          ? styles.selectedCard
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span
                        className={
                          styles.serviceIcon
                        }
                      >
                        <Layers3 size={21} />
                      </span>

                      <div
                        className={
                          styles.serviceInfo
                        }
                      >
                        <strong>
                          {service.name}
                        </strong>

                        <p>
                          {service.short_description ??
                            service.description ??
                            "Ingen beskrivning."}
                        </p>

                        <small>
                          {service.category_name ??
                            "Ingen kategori"}
                        </small>
                      </div>

                      {selected && (
                        <div
                          className={
                            styles.quantity
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                selected.id,
                                -1
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>

                          <span>
                            {selected.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                selected.id,
                                1
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}

                      <div
                        className={
                          styles.servicePrice
                        }
                      >
                        <strong>
                          {currencyFormatter.format(
                            service.unit_price_ex_vat
                          )}
                        </strong>

                        <small>
                          exkl. moms
                        </small>
                      </div>

                      <button
                        type="button"
                        className={[
                          styles.selectButton,
                          selected
                            ? styles.removeButton
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() =>
                          toggleCatalogService(
                            service
                          )
                        }
                        aria-label={
                          selected
                            ? `Ta bort ${service.name}`
                            : `Lägg till ${service.name}`
                        }
                      >
                        {selected ? (
                          <Check size={17} />
                        ) : (
                          <Plus size={17} />
                        )}
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </>
      )}

      {activeView === "packages" && (
        <div className={styles.packageGrid}>
          {options.packages.length === 0 ? (
            <div className={styles.emptyState}>
              <PackageOpen size={30} />

              <strong>
                Inga paket skapade
              </strong>

              <span>
                Färdiga paket skapas under
                Mallar & Paket.
              </span>
            </div>
          ) : (
            options.packages.map(
              (packageData) => {
                const selected =
                  services.some(
                    (service) =>
                      service.sourcePackageId ===
                      packageData.id
                  );

                const packagePrice =
                  packageData.price_mode ===
                    "fixed" &&
                  packageData.fixed_price_ex_vat !=
                    null
                    ? Number(
                        packageData.fixed_price_ex_vat
                      )
                    : packageData.items.reduce(
                        (sum, item) =>
                          sum +
                          Number(
                            item.quantity
                          ) *
                            Number(
                              item.unit_price_ex_vat
                            ) *
                            (1 -
                              Number(
                                item.discount_percent
                              ) /
                                100),
                        0
                      );

                return (
                  <article
                    key={packageData.id}
                    className={[
                      styles.packageCard,
                      selected
                        ? styles.selectedPackage
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span
                      className={
                        styles.packageIcon
                      }
                    >
                      <PackageOpen
                        size={23}
                      />
                    </span>

                    <div>
                      <strong>
                        {packageData.name}
                      </strong>

                      <p>
                        {packageData.short_description ??
                          packageData.description ??
                          `${packageData.items.length} tjänster`}
                      </p>

                      <small>
                        {
                          packageData.items
                            .length
                        }{" "}
                        tjänster
                      </small>
                    </div>

                    <div
                      className={
                        styles.packageFooter
                      }
                    >
                      <strong>
                        {currencyFormatter.format(
                          packagePrice
                        )}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          addPackage(
                            packageData
                          )
                        }
                      >
                        {selected
                          ? "Ta bort paket"
                          : "Lägg till paket"}
                      </button>
                    </div>
                  </article>
                );
              }
            )
          )}
        </div>
      )}

      {activeView === "custom" && (
        <div className={styles.customForm}>
          <div className={styles.customHeader}>
            <Plus size={20} />

            <div>
              <h3>Skapa egen tjänst</h3>

              <p>
                Lägg till en anpassad
                offertrad för denna offert.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label>
              <span>
                Tjänstens namn *
              </span>

              <input
                type="text"
                value={customService.name}
                onChange={(event) =>
                  setCustomService(
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
              <span>Kategori</span>

              <select
                value={
                  customService.categoryId
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      categoryId:
                        event.target.value,
                    })
                  )
                }
              >
                <option value="">
                  Ingen kategori
                </option>

                {options.categories.map(
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

            <label
              className={
                styles.gridFull
              }
            >
              <span>Beskrivning</span>

              <textarea
                rows={3}
                value={
                  customService.description
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      description:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              <span>Enhet</span>

              <select
                value={
                  customService.unitCode
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      unitCode:
                        event.target.value,
                    })
                  )
                }
              >
                {options.units.map(
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
              <span>Antal</span>

              <input
                type="number"
                min="1"
                step="1"
                value={
                  customService.quantity
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      quantity:
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
                value={
                  customService.unitPriceExVat
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      unitPriceExVat:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              <span>Rabatt %</span>

              <input
                type="number"
                min="0"
                max="100"
                value={
                  customService.discountPercent
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      discountPercent:
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
                  customService.vatRate
                }
                onChange={(event) =>
                  setCustomService(
                    (current) => ({
                      ...current,
                      vatRate:
                        event.target.value,
                    })
                  )
                }
              />
            </label>
          </div>

          <button
            type="button"
            className={
              styles.addCustomButton
            }
            disabled={
              !customService.name.trim() ||
              !customService.unitPriceExVat
            }
            onClick={addCustomService}
          >
            <Plus size={17} />
            Lägg till tjänsten
          </button>
        </div>
      )}

      {services.length > 0 && (
        <div className={styles.selectedSection}>
          <div
            className={
              styles.selectedHeader
            }
          >
            <div>
              <h3>Valda tjänster</h3>

              <span>
                {services.length} offertrader
              </span>
            </div>

            <strong>
              {currencyFormatter.format(
                subtotal
              )}
            </strong>
          </div>

          <div className={styles.selectedList}>
            {services.map((service) => (
              <div key={service.id}>
                <div>
                  <strong>
                    {service.name}
                  </strong>

                  <span>
                    {service.quantity} ×{" "}
                    {currencyFormatter.format(
                      service.unitPriceExVat
                    )}
                  </span>
                </div>

                <strong>
                  {currencyFormatter.format(
                    calculateSubtotal(
                      service
                    )
                  )}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    removeService(
                      service.id
                    )
                  }
                  aria-label={`Ta bort ${service.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
