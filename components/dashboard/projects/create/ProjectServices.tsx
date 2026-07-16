"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Check,
  Layers3,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import type {
  CreateProjectOptions,
  CreateProjectPackage,
  CreateProjectService,
  ProjectServiceDraft,
} from "@/lib/dashboard/projects/create-project-types";
import styles from "./ProjectServices.module.css";

type ProjectServicesProps = {
  options: CreateProjectOptions;
  services: ProjectServiceDraft[];
  onChange: (services: ProjectServiceDraft[]) => void;
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
  customerVisible: boolean;
};

const currencyFormatter = new Intl.NumberFormat(
  "sv-SE",
  {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }
);

const initialCustomService: CustomServiceForm = {
  name: "",
  description: "",
  categoryId: "",
  unitCode: "fixed",
  quantity: "1",
  unitPriceExVat: "",
  discountPercent: "0",
  vatRate: "25",
  customerVisible: true,
};

function createId() {
  return crypto.randomUUID();
}

function calculateSubtotal(
  service: ProjectServiceDraft
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

  return Math.round((1 - multiplier) * 10000) / 100;
}

export default function ProjectServices({
  options,
  services,
  onChange,
}: ProjectServicesProps) {
  const [activeView, setActiveView] =
    useState<ActiveView>("catalog");

  const [search, setSearch] = useState("");

  const [customService, setCustomService] =
    useState<CustomServiceForm>(
      initialCustomService
    );

  const filteredServices = useMemo(() => {
    const query = search
      .trim()
      .toLocaleLowerCase("sv-SE");

    if (!query) {
      return options.services;
    }

    return options.services.filter(
      (service) =>
        service.name
          .toLocaleLowerCase("sv-SE")
          .includes(query) ||
        service.category_name
          ?.toLocaleLowerCase("sv-SE")
          .includes(query) ||
        service.short_description
          ?.toLocaleLowerCase("sv-SE")
          .includes(query)
    );
  }, [options.services, search]);

  const selectedTotal = services.reduce(
    (total, service) =>
      total + calculateSubtotal(service),
    0
  );

  function addCatalogService(
    service: CreateProjectService
  ) {
    const newService: ProjectServiceDraft = {
      id: createId(),
      sourceServiceId: service.id,
      sourcePackageId: null,
      categoryId: service.category_id,
      name: service.name,
      description:
        service.description ||
        service.short_description ||
        "",
      pricingModel: service.pricing_model,
      unitCode: service.unit_code,
      quantity: Number(service.quantity) || 1,
      unitPriceExVat:
        Number(service.unit_price_ex_vat) || 0,
      discountPercent: 0,
      vatRate: Number(service.vat_rate) || 25,
      customerVisible:
        service.customer_visible,
      isOptional: false,
    };

    onChange([...services, newService]);
  }

  function addPackage(
    servicePackage: CreateProjectPackage
  ) {
    if (servicePackage.items.length === 0) {
      return;
    }

    const packageBaseTotal =
      servicePackage.items.reduce(
        (total, item) =>
          total +
          item.quantity *
            item.unit_price_ex_vat *
            (1 -
              item.discount_percent / 100),
        0
      );

    const fixedPackageTotal =
      servicePackage.price_mode === "fixed"
        ? Number(
            servicePackage.fixed_price_ex_vat
          ) || 0
        : null;

    const expandedServices =
      servicePackage.items.map(
        (item, index) => {
          const itemBaseSubtotal =
            item.quantity *
            item.unit_price_ex_vat *
            (1 -
              item.discount_percent / 100);

          let unitPrice =
            item.unit_price_ex_vat;

          let discount = combineDiscounts(
            item.discount_percent,
            servicePackage.discount_percent
          );

          if (fixedPackageTotal !== null) {
            const share =
              packageBaseTotal > 0
                ? itemBaseSubtotal /
                  packageBaseTotal
                : 1 /
                  servicePackage.items.length;

            const targetSubtotal =
              fixedPackageTotal * share;

            const discountMultiplier =
              1 -
              item.discount_percent / 100;

            unitPrice =
              item.quantity > 0 &&
              discountMultiplier > 0
                ? targetSubtotal /
                  item.quantity /
                  discountMultiplier
                : 0;

            discount =
              item.discount_percent;
          }

          return {
            id: createId(),
            sourceServiceId:
              item.service_id,
            sourcePackageId:
              servicePackage.id,
            categoryId:
              item.category_id,
            name: item.service_name,
            description:
              item.description || "",
            pricingModel:
              item.unit_code === "fixed"
                ? ("fixed" as const)
                : ("quantity" as const),
            unitCode: item.unit_code,
            quantity:
              Number(item.quantity) || 1,
            unitPriceExVat:
              Math.round(unitPrice * 100) /
              100,
            discountPercent: discount,
            vatRate:
              Number(item.vat_rate) || 25,
            customerVisible: true,
            isOptional:
              item.is_optional,
            sortOrder: index,
          };
        }
      )
      .map(
        ({
          sortOrder: _sortOrder,
          ...service
        }) => service
      );

    onChange([
      ...services,
      ...expandedServices,
    ]);
  }

  function addCustomService() {
    const name = customService.name.trim();

    if (!name) {
      return;
    }

    const newService: ProjectServiceDraft = {
      id: createId(),
      sourceServiceId: null,
      sourcePackageId: null,
      categoryId:
        customService.categoryId || null,
      name,
      description:
        customService.description.trim(),
      pricingModel:
        customService.unitCode === "fixed"
          ? "fixed"
          : "quantity",
      unitCode:
        customService.unitCode || "fixed",
      quantity: Math.max(
        Number(customService.quantity) || 1,
        0.01
      ),
      unitPriceExVat: Math.max(
        Number(
          customService.unitPriceExVat
        ) || 0,
        0
      ),
      discountPercent: Math.min(
        Math.max(
          Number(
            customService.discountPercent
          ) || 0,
          0
        ),
        100
      ),
      vatRate: Math.min(
        Math.max(
          Number(customService.vatRate) ||
            25,
          0
        ),
        100
      ),
      customerVisible:
        customService.customerVisible,
      isOptional: false,
    };

    onChange([...services, newService]);

    setCustomService({
      ...initialCustomService,
      categoryId:
        customService.categoryId,
      unitCode:
        customService.unitCode,
    });
  }

  function updateSelectedService(
    id: string,
    updates: Partial<ProjectServiceDraft>
  ) {
    onChange(
      services.map((service) =>
        service.id === id
          ? {
              ...service,
              ...updates,
            }
          : service
      )
    );
  }

  function removeSelectedService(
    id: string
  ) {
    onChange(
      services.filter(
        (service) => service.id !== id
      )
    );
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <span>2.</span>

          <div>
            <h2>Tjänster och paket</h2>

            <p>
              Välj ur katalogen, använd ett
              paket eller skapa en egen tjänst.
            </p>
          </div>
        </div>

        <strong>
          {services.length}{" "}
          {services.length === 1
            ? "tjänst"
            : "tjänster"}
        </strong>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={
            activeView === "catalog"
              ? styles.activeTab
              : ""
          }
          onClick={() =>
            setActiveView("catalog")
          }
        >
          <Wrench
            size={17}
            strokeWidth={1.7}
          />
          Tjänstekatalog
        </button>

        <button
          type="button"
          className={
            activeView === "packages"
              ? styles.activeTab
              : ""
          }
          onClick={() =>
            setActiveView("packages")
          }
        >
          <Layers3
            size={17}
            strokeWidth={1.7}
          />
          Färdiga paket
        </button>

        <button
          type="button"
          className={
            activeView === "custom"
              ? styles.activeTab
              : ""
          }
          onClick={() =>
            setActiveView("custom")
          }
        >
          <Plus
            size={17}
            strokeWidth={1.8}
          />
          Egen tjänst
        </button>
      </div>

      {activeView === "catalog" && (
        <div className={styles.catalogView}>
          <label className={styles.search}>
            <Search
              size={18}
              strokeWidth={1.7}
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Sök efter en tjänst..."
            />
          </label>

          {options.services.length === 0 ? (
            <div className={styles.emptyState}>
              <Box
                size={31}
                strokeWidth={1.4}
              />

              <strong>
                Tjänstekatalogen är tom
              </strong>

              <p>
                Skapa en egen tjänst nu.
                Senare kan du administrera
                återanvändbara tjänster under
                Mallar & Paket.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveView("custom")
                }
              >
                <Plus
                  size={16}
                  strokeWidth={1.8}
                />
                Lägg till egen tjänst
              </button>
            </div>
          ) : filteredServices.length ===
            0 ? (
            <div className={styles.emptyState}>
              <Search
                size={31}
                strokeWidth={1.4}
              />

              <strong>
                Ingen tjänst hittades
              </strong>

              <p>
                Prova ett annat sökord eller
                skapa en egen tjänst.
              </p>
            </div>
          ) : (
            <div className={styles.catalogGrid}>
              {filteredServices.map(
                (service) => (
                  <article
                    className={styles.catalogCard}
                    key={service.id}
                  >
                    <div>
                      <span>
                        {service.category_name ||
                          "Tjänst"}
                      </span>

                      <h3>
                        {service.name}
                      </h3>

                      <p>
                        {service.short_description ||
                          service.description ||
                          "Ingen beskrivning."}
                      </p>
                    </div>

                    <footer>
                      <strong>
                        {currencyFormatter.format(
                          service.unit_price_ex_vat
                        )}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          addCatalogService(
                            service
                          )
                        }
                      >
                        <Plus
                          size={15}
                          strokeWidth={1.8}
                        />
                        Lägg till
                      </button>
                    </footer>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      )}

      {activeView === "packages" && (
        <div className={styles.catalogView}>
          {options.packages.length === 0 ? (
            <div className={styles.emptyState}>
              <Layers3
                size={31}
                strokeWidth={1.4}
              />

              <strong>
                Inga paket skapade ännu
              </strong>

              <p>
                Färdiga paket kan senare
                innehålla flera tjänster som
                läggs till samtidigt.
              </p>
            </div>
          ) : (
            <div className={styles.catalogGrid}>
              {options.packages.map(
                (servicePackage) => (
                  <article
                    className={styles.catalogCard}
                    key={servicePackage.id}
                  >
                    <div>
                      <span>
                        {
                          servicePackage.items
                            .length
                        }{" "}
                        tjänster
                      </span>

                      <h3>
                        {servicePackage.name}
                      </h3>

                      <p>
                        {servicePackage.short_description ||
                          servicePackage.description ||
                          "Färdigt tjänstepaket."}
                      </p>
                    </div>

                    <footer>
                      <strong>
                        {servicePackage.price_mode ===
                          "fixed"
                          ? currencyFormatter.format(
                              servicePackage.fixed_price_ex_vat ||
                                0
                            )
                          : "Beräknas från tjänster"}
                      </strong>

                      <button
                        type="button"
                        disabled={
                          servicePackage.items
                            .length === 0
                        }
                        onClick={() =>
                          addPackage(
                            servicePackage
                          )
                        }
                      >
                        <Plus
                          size={15}
                          strokeWidth={1.8}
                        />
                        Lägg till paket
                      </button>
                    </footer>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      )}

      {activeView === "custom" && (
        <div className={styles.customForm}>
          <label
            className={styles.fullWidth}
          >
            <span>
              Tjänstens namn <em>*</em>
            </span>

            <input
              type="text"
              value={customService.name}
              onChange={(event) =>
                setCustomService(
                  (current) => ({
                    ...current,
                    name: event.target.value,
                  })
                )
              }
              placeholder="Exempel: Responsiv webbdesign"
            />
          </label>

          <label
            className={styles.fullWidth}
          >
            <span>Beskrivning</span>

            <textarea
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
              placeholder="Beskriv vad som ingår i tjänsten."
              rows={3}
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
                    value={category.id}
                    key={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
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
              {options.units.map((unit) => (
                <option
                  value={unit.code}
                  key={unit.code}
                >
                  {unit.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Antal</span>

            <input
              type="number"
              min="0.01"
              step="0.25"
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
            <span>Pris per enhet, exkl. moms</span>

            <input
              type="number"
              min="0"
              step="100"
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
              placeholder="0"
            />
          </label>

          <label>
            <span>Rabatt</span>

            <div className={styles.suffixInput}>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
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

              <span>%</span>
            </div>
          </label>

          <label>
            <span>Moms</span>

            <div className={styles.suffixInput}>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
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

              <span>%</span>
            </div>
          </label>

          <label
            className={`${styles.checkbox} ${styles.fullWidth}`}
          >
            <input
              type="checkbox"
              checked={
                customService.customerVisible
              }
              onChange={(event) =>
                setCustomService(
                  (current) => ({
                    ...current,
                    customerVisible:
                      event.target.checked,
                  })
                )
              }
            />

            <span>
              Visa tjänsten för kunden i
              kundportalen
            </span>
          </label>

          <button
            type="button"
            className={styles.addCustomButton}
            disabled={
              !customService.name.trim()
            }
            onClick={addCustomService}
          >
            <Plus
              size={17}
              strokeWidth={1.8}
            />
            Lägg till tjänsten
          </button>
        </div>
      )}

      <section className={styles.selectedSection}>
        <header>
          <div>
            <h3>Valda tjänster</h3>

            <p>
              Alla rader kan anpassas för det
              här projektet.
            </p>
          </div>

          <strong>
            {currencyFormatter.format(
              selectedTotal
            )}
          </strong>
        </header>

        {services.length === 0 ? (
          <div className={styles.noSelected}>
            Inga tjänster har lagts till.
          </div>
        ) : (
          <div className={styles.selectedList}>
            {services.map(
              (service, index) => (
                <article
                  className={styles.selectedRow}
                  key={service.id}
                >
                  <div
                    className={styles.rowNumber}
                  >
                    {index + 1}
                  </div>

                  <label
                    className={
                      styles.serviceName
                    }
                  >
                    <span>Tjänst</span>

                    <input
                      type="text"
                      value={service.name}
                      onChange={(event) =>
                        updateSelectedService(
                          service.id,
                          {
                            name: event
                              .target.value,
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Antal</span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.25"
                      value={service.quantity}
                      onChange={(event) =>
                        updateSelectedService(
                          service.id,
                          {
                            quantity:
                              Math.max(
                                Number(
                                  event.target
                                    .value
                                ) || 0.01,
                                0.01
                              ),
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Enhet</span>

                    <select
                      value={
                        service.unitCode
                      }
                      onChange={(event) =>
                        updateSelectedService(
                          service.id,
                          {
                            unitCode:
                              event.target
                                .value,
                            pricingModel:
                              event.target
                                .value ===
                              "fixed"
                                ? "fixed"
                                : "quantity",
                          }
                        )
                      }
                    >
                      {options.units.map(
                        (unit) => (
                          <option
                            value={unit.code}
                            key={unit.code}
                          >
                            {
                              unit.short_label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Pris exkl. moms</span>

                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={
                        service.unitPriceExVat
                      }
                      onChange={(event) =>
                        updateSelectedService(
                          service.id,
                          {
                            unitPriceExVat:
                              Math.max(
                                Number(
                                  event.target
                                    .value
                                ) || 0,
                                0
                              ),
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Rabatt</span>

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
                          service.discountPercent
                        }
                        onChange={(event) =>
                          updateSelectedService(
                            service.id,
                            {
                              discountPercent:
                                Math.min(
                                  Math.max(
                                    Number(
                                      event
                                        .target
                                        .value
                                    ) || 0,
                                    0
                                  ),
                                  100
                                ),
                            }
                          )
                        }
                      />

                      <span>%</span>
                    </div>
                  </label>

                  <div
                    className={
                      styles.rowTotal
                    }
                  >
                    <span>Delsumma</span>

                    <strong>
                      {currencyFormatter.format(
                        calculateSubtotal(
                          service
                        )
                      )}
                    </strong>
                  </div>

                  <label
                    className={
                      styles.rowCheckbox
                    }
                    title="Synlig för kunden"
                  >
                    <input
                      type="checkbox"
                      checked={
                        service.customerVisible
                      }
                      onChange={(event) =>
                        updateSelectedService(
                          service.id,
                          {
                            customerVisible:
                              event.target
                                .checked,
                          }
                        )
                      }
                    />

                    <Check
                      size={15}
                      strokeWidth={2}
                    />
                  </label>

                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      removeSelectedService(
                        service.id
                      )
                    }
                    aria-label={`Ta bort ${service.name}`}
                  >
                    <Trash2
                      size={17}
                      strokeWidth={1.7}
                    />
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
}
