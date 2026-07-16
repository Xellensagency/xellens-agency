"use client";

import Link from "next/link";

import {
  Archive,
  Boxes,
  Eye,
  EyeOff,
  FolderTree,
  Layers3,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  CatalogPageData,
  CatalogService,
} from "@/lib/dashboard/catalog/catalog-types";

import styles from "./CatalogManager.module.css";

type CatalogManagerProps = {
  data: CatalogPageData;
};

type ActiveTab =
  | "overview"
  | "services"
  | "packages"
  | "addons";

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

function serviceDescription(
  service: CatalogService
) {
  return (
    service.shortDescription ||
    service.description ||
    "Ingen beskrivning har lagts till."
  );
}

export default function CatalogManager({
  data,
}: CatalogManagerProps) {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("overview");

  const [search, setSearch] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const filteredServices = useMemo(
    () => {
      const cleanSearch =
        search.trim().toLowerCase();

      const wantedKind =
        activeTab === "addons"
          ? "addon"
          : "service";

      return data.services.filter(
        (service) => {
          if (
            service.serviceKind !==
            wantedKind
          ) {
            return false;
          }

          if (
            categoryFilter !== "all" &&
            service.categoryId !==
              categoryFilter
          ) {
            return false;
          }

          if (
            statusFilter === "active" &&
            !service.isActive
          ) {
            return false;
          }

          if (
            statusFilter === "inactive" &&
            service.isActive
          ) {
            return false;
          }

          if (!cleanSearch) {
            return true;
          }

          return [
            service.name,
            service.code ?? "",
            service.categoryName ?? "",
            service.shortDescription ??
              "",
            service.description ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(cleanSearch);
        }
      );
    },
    [
      activeTab,
      categoryFilter,
      data.services,
      search,
      statusFilter,
    ]
  );

  const latestServices =
    data.services.slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <span>
            Tjänstekatalog
          </span>

          <p>
            Administrera tjänster,
            tillägg, paket och kategorier
            på ett ställe.
          </p>
        </div>

        <div className={styles.actions}>
          <Link
            href="/dashboard/mallar/kategorier/ny"
          >
            <FolderTree size={17} />
            Ny kategori
          </Link>

          <Link
            href="/dashboard/mallar/paket/ny"
          >
            <PackageOpen size={17} />
            Nytt paket
          </Link>

          <Link
            href="/dashboard/mallar/tjanster/ny"
            className={
              styles.primaryButton
            }
          >
            <Plus size={18} />
            Ny tjänst
          </Link>
        </div>
      </div>

      <section className={styles.stats}>
        <article>
          <span>
            <Wrench size={22} />
          </span>

          <div>
            <small>Tjänster</small>
            <strong>
              {data.stats.services}
            </strong>
            <em>
              Vanliga tjänster
            </em>
          </div>
        </article>

        <article>
          <span>
            <Sparkles size={22} />
          </span>

          <div>
            <small>Tillägg</small>
            <strong>
              {data.stats.addons}
            </strong>
            <em>
              Tilläggstjänster
            </em>
          </div>
        </article>

        <article>
          <span>
            <PackageOpen size={22} />
          </span>

          <div>
            <small>Paket</small>
            <strong>
              {data.stats.packages}
            </strong>
            <em>
              Färdiga paket
            </em>
          </div>
        </article>

        <article>
          <span>
            <FolderTree size={22} />
          </span>

          <div>
            <small>Kategorier</small>
            <strong>
              {data.stats.categories}
            </strong>
            <em>
              Tjänsteområden
            </em>
          </div>
        </article>

        <article>
          <span>
            <Archive size={22} />
          </span>

          <div>
            <small>Inaktiva</small>
            <strong>
              {data.stats.inactive}
            </strong>
            <em>
              Dolda poster
            </em>
          </div>
        </article>
      </section>

      <div className={styles.tabs}>
        {[
          [
            "overview",
            "Översikt",
            Boxes,
          ],
          [
            "services",
            "Tjänster",
            Wrench,
          ],
          [
            "packages",
            "Paket",
            Layers3,
          ],
          [
            "addons",
            "Tilläggstjänster",
            Sparkles,
          ],
        ].map(
          ([value, label, Icon]) => {
            const TabIcon =
              Icon as typeof Boxes;

            return (
              <button
                key={String(value)}
                type="button"
                className={
                  activeTab === value
                    ? styles.activeTab
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    value as ActiveTab
                  )
                }
              >
                <TabIcon size={16} />
                {String(label)}
              </button>
            );
          }
        )}
      </div>

      {activeTab === "overview" && (
        <div
          className={
            styles.overviewGrid
          }
        >
          <section className={styles.card}>
            <header>
              <div>
                <h2>
                  Senaste tjänster
                </h2>

                <p>
                  Tjänster och tillägg i
                  katalogen.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "services"
                  )
                }
              >
                Visa alla
              </button>
            </header>

            <div
              className={
                styles.compactList
              }
            >
              {latestServices.length ===
              0 ? (
                <div
                  className={
                    styles.empty
                  }
                >
                  <Wrench size={28} />

                  <strong>
                    Inga tjänster ännu
                  </strong>
                </div>
              ) : (
                latestServices.map(
                  (service) => (
                    <article
                      key={service.id}
                    >
                      <span
                        className={
                          service.serviceKind ===
                          "addon"
                            ? styles.addonIcon
                            : styles.serviceIcon
                        }
                      >
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
                        <strong>
                          {service.name}
                        </strong>

                        <small>
                          {service.categoryName ||
                            "Ingen kategori"}
                        </small>
                      </div>

                      <em>
                        {currencyFormatter.format(
                          service.unitPriceExVat
                        )}
                      </em>

                      <span
                        className={
                          service.isActive
                            ? styles.activeStatus
                            : styles.inactiveStatus
                        }
                      >
                        {service.isActive
                          ? "Aktiv"
                          : "Inaktiv"}
                      </span>
                    </article>
                  )
                )
              )}
            </div>
          </section>

          <section className={styles.card}>
            <header>
              <div>
                <h2>
                  Färdiga paket
                </h2>

                <p>
                  Paket som kan användas i
                  offerter och projekt.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "packages"
                  )
                }
              >
                Visa alla
              </button>
            </header>

            <div
              className={
                styles.packagePreview
              }
            >
              {data.packages.length ===
              0 ? (
                <div
                  className={
                    styles.empty
                  }
                >
                  <PackageOpen
                    size={28}
                  />

                  <strong>
                    Inga paket ännu
                  </strong>
                </div>
              ) : (
                data.packages
                  .slice(0, 4)
                  .map((item) => (
                    <article
                      key={item.id}
                    >
                      <span>
                        <PackageOpen
                          size={20}
                        />
                      </span>

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {item.itemCount}{" "}
                          tjänster
                        </small>
                      </div>

                      <em>
                        {item.priceMode ===
                          "fixed" &&
                        item.fixedPriceExVat !=
                          null
                          ? currencyFormatter.format(
                              item.fixedPriceExVat
                            )
                          : "Summeras"}
                      </em>
                    </article>
                  ))
              )}
            </div>
          </section>
        </div>
      )}

      {(activeTab === "services" ||
        activeTab === "addons") && (
        <section className={styles.card}>
          <header
            className={
              styles.listHeader
            }
          >
            <div>
              <h2>
                {activeTab === "addons"
                  ? "Tilläggstjänster"
                  : "Tjänster"}
              </h2>

              <p>
                Sök, filtrera och hantera
                katalogens poster.
              </p>
            </div>

            <strong>
              {filteredServices.length}{" "}
              poster
            </strong>
          </header>

          <div className={styles.filters}>
            <label>
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

              {data.categories.map(
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

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Alla statusar
              </option>

              <option value="active">
                Aktiva
              </option>

              <option value="inactive">
                Inaktiva
              </option>
            </select>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Tjänst</th>
                  <th>Kategori</th>
                  <th>Pris</th>
                  <th>Enhet</th>
                  <th>Moms</th>
                  <th>Synlighet</th>
                  <th>Status</th>
                  <th>Åtgärder</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map(
                  (service) => (
                    <tr key={service.id}>
                      <td>
                        <div
                          className={
                            styles.serviceName
                          }
                        >
                          <span>
                            {service.serviceKind ===
                            "addon" ? (
                              <Sparkles
                                size={17}
                              />
                            ) : (
                              <Wrench
                                size={17}
                              />
                            )}
                          </span>

                          <div>
                            <strong>
                              {service.name}
                            </strong>

                            <small>
                              {serviceDescription(
                                service
                              )}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {service.categoryName ||
                          "Ingen kategori"}
                      </td>

                      <td>
                        <strong>
                          {currencyFormatter.format(
                            service.unitPriceExVat
                          )}
                        </strong>
                      </td>

                      <td>
                        {service.unitCode}
                      </td>

                      <td>
                        {service.vatRate} %
                      </td>

                      <td>
                        <span
                          className={
                            styles.visibility
                          }
                        >
                          {service.customerVisible ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}

                          {service.customerVisible
                            ? "Kundsynlig"
                            : "Intern"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            service.isActive
                              ? styles.activeStatus
                              : styles.inactiveStatus
                          }
                        >
                          {service.isActive
                            ? "Aktiv"
                            : "Inaktiv"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            styles.editButton
                          }
                          disabled
                          title="Redigering byggs i nästa steg"
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {filteredServices.length ===
            0 && (
            <div className={styles.empty}>
              <Search size={29} />

              <strong>
                Inga poster hittades
              </strong>

              <span>
                Ändra sökningen eller
                filtreringen.
              </span>
            </div>
          )}
        </section>
      )}

      {activeTab === "packages" && (
        <section className={styles.card}>
          <header
            className={
              styles.listHeader
            }
          >
            <div>
              <h2>Tjänstepaket</h2>

              <p>
                Färdiga kombinationer av
                flera tjänster.
              </p>
            </div>

            <strong>
              {data.packages.length} paket
            </strong>
          </header>

          <div className={styles.packageGrid}>
            {data.packages.map(
              (item) => (
                <article key={item.id}>
                  <div
                    className={
                      styles.packageTop
                    }
                  >
                    <span>
                      <PackageOpen
                        size={22}
                      />
                    </span>

                    <span
                      className={
                        item.isActive
                          ? styles.activeStatus
                          : styles.inactiveStatus
                      }
                    >
                      {item.isActive
                        ? "Aktivt"
                        : "Inaktivt"}
                    </span>
                  </div>

                  <h3>{item.name}</h3>

                  <p>
                    {item.shortDescription ||
                      item.description ||
                      "Ingen beskrivning har lagts till."}
                  </p>

                  <dl>
                    <div>
                      <dt>Tjänster</dt>
                      <dd>
                        {item.itemCount}
                      </dd>
                    </div>

                    <div>
                      <dt>Rabatt</dt>
                      <dd>
                        {
                          item.discountPercent
                        }{" "}
                        %
                      </dd>
                    </div>

                    <div>
                      <dt>Pris</dt>
                      <dd>
                        {item.priceMode ===
                          "fixed" &&
                        item.fixedPriceExVat !=
                          null
                          ? currencyFormatter.format(
                              item.fixedPriceExVat
                            )
                          : "Summeras"}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    disabled
                    title="Redigering byggs i nästa steg"
                  >
                    <Pencil size={15} />
                    Redigera paket
                  </button>
                </article>
              )
            )}
          </div>

          {data.packages.length === 0 && (
            <div className={styles.empty}>
              <PackageOpen size={30} />

              <strong>
                Inga paket skapade
              </strong>

              <span>
                Paketformuläret byggs i
                nästa steg.
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}



