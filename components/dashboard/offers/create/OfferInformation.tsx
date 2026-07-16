"use client";

import Link from "next/link";
import {
  Building2,
  ExternalLink,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import type {
  CreateOfferOptions,
  OfferDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import styles from "./CreateOfferWizard.module.css";

type OfferInformationProps = {
  options: CreateOfferOptions;
  draft: OfferDraft;
  onChange: <
    K extends keyof OfferDraft
  >(
    field: K,
    value: OfferDraft[K]
  ) => void;
};

export default function OfferInformation({
  options,
  draft,
  onChange,
}: OfferInformationProps) {
  const selectedCustomer =
    options.customers.find(
      (customer) =>
        customer.id === draft.customerId
    );

  const availableProjects =
    options.projects.filter(
      (project) =>
        !draft.customerId ||
        project.customerId ===
          draft.customerId
    );

  function selectCustomer(
    customerId: string
  ) {
    const customer =
      options.customers.find(
        (item) =>
          item.id === customerId
      );

    const primaryContact =
      customer?.contacts.find(
        (contact) =>
          contact.isPrimary
      ) ??
      customer?.contacts[0];

    onChange(
      "customerId",
      customerId
    );

    onChange(
      "contactId",
      primaryContact?.id ?? ""
    );

    onChange(
      "existingProjectId",
      ""
    );
  }

  function selectProject(
    projectId: string
  ) {
    const project =
      options.projects.find(
        (item) => item.id === projectId
      );

    onChange(
      "existingProjectId",
      projectId
    );

    if (!project) {
      return;
    }

    onChange(
      "title",
      project.title
    );

    if (project.description) {
      onChange(
        "description",
        project.description
      );
    }

    if (project.categoryId) {
      onChange(
        "categoryId",
        project.categoryId
      );
    }
  }

  return (
    <div className={styles.formStack}>
      <section className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <span className={styles.cardNumber}>
              1
            </span>

            <div>
              <h2>Kundinformation</h2>

              <p>
                Välj en befintlig kund eller
                ange en ny kund.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.modeCards}>
          <button
            type="button"
            className={[
              styles.modeCard,
              draft.customerMode ===
              "existing"
                ? styles.modeCardActive
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              onChange(
                "customerMode",
                "existing"
              )
            }
          >
            <span className={styles.modeIcon}>
              <UserRound size={25} />
            </span>

            <span>
              <strong>Befintlig kund</strong>

              <small>
                Välj från kundregistret.
              </small>
            </span>
          </button>

          <button
            type="button"
            className={[
              styles.modeCard,
              draft.customerMode === "new"
                ? styles.modeCardActive
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              onChange(
                "customerMode",
                "new"
              )
            }
          >
            <span className={styles.modeIcon}>
              <UserRoundPlus size={25} />
            </span>

            <span>
              <strong>Ny kund</strong>

              <small>
                Lägg till kund direkt i
                offerten.
              </small>
            </span>
          </button>
        </div>

        {draft.customerMode ===
        "existing" ? (
          <>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>
                  Välj kund <em>*</em>
                </span>

                <select
                  value={draft.customerId}
                  onChange={(event) =>
                    selectCustomer(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Välj kund
                  </option>

                  {options.customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className={styles.field}>
                <span>Kontaktperson</span>

                <select
                  value={draft.contactId}
                  disabled={
                    !selectedCustomer
                  }
                  onChange={(event) =>
                    onChange(
                      "contactId",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {selectedCustomer
                      ? "Välj kontaktperson"
                      : "Välj kund först"}
                  </option>

                  {selectedCustomer?.contacts.map(
                    (contact) => (
                      <option
                        key={contact.id}
                        value={contact.id}
                      >
                        {contact.fullName}
                        {contact.jobTitle
                          ? ` – ${contact.jobTitle}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {selectedCustomer && (
              <div
                className={
                  styles.selectedCustomer
                }
              >
                <span
                  className={
                    styles.customerAvatar
                  }
                >
                  {selectedCustomer.customerType ===
                  "company" ? (
                    <Building2 size={20} />
                  ) : (
                    <UserRound size={20} />
                  )}
                </span>

                <div>
                  <strong>
                    {selectedCustomer.name}
                  </strong>

                  <span>
                    {selectedCustomer.email ||
                      selectedCustomer.phone ||
                      "Kontaktuppgifter saknas"}
                  </span>
                </div>

                <Link
                  href="/dashboard/kunder"
                  title="Öppna kundregistret"
                >
                  Visa kundprofil
                  <ExternalLink size={14} />
                </Link>
              </div>
            )}

            {options.customers.length ===
              0 && (
              <div className={styles.notice}>
                Det finns ännu inga kunder i
                kundregistret.
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className={
                styles.customerTypeButtons
              }
            >
              <button
                type="button"
                className={
                  draft.newCustomerType ===
                  "company"
                    ? styles.selectedType
                    : ""
                }
                onClick={() =>
                  onChange(
                    "newCustomerType",
                    "company"
                  )
                }
              >
                <Building2 size={16} />
                Företag
              </button>

              <button
                type="button"
                className={
                  draft.newCustomerType ===
                  "private"
                    ? styles.selectedType
                    : ""
                }
                onClick={() =>
                  onChange(
                    "newCustomerType",
                    "private"
                  )
                }
              >
                <UserRound size={16} />
                Privatperson
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>
                  {draft.newCustomerType ===
                  "company"
                    ? "Företagsnamn"
                    : "För- och efternamn"}{" "}
                  <em>*</em>
                </span>

                <input
                  type="text"
                  value={
                    draft.newCustomerName
                  }
                  onChange={(event) =>
                    onChange(
                      "newCustomerName",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className={styles.field}>
                <span>E-post</span>

                <input
                  type="email"
                  value={
                    draft.newCustomerEmail
                  }
                  onChange={(event) =>
                    onChange(
                      "newCustomerEmail",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Telefon</span>

                <input
                  type="tel"
                  value={
                    draft.newCustomerPhone
                  }
                  onChange={(event) =>
                    onChange(
                      "newCustomerPhone",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </>
        )}
      </section>

      <section className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <span className={styles.cardNumber}>
              2
            </span>

            <div>
              <h2>Offertinformation</h2>

              <p>
                Beskriv projektet eller
                uppdraget som offerten gäller.
              </p>
            </div>
          </div>
        </div>

        {draft.customerMode ===
          "existing" &&
          availableProjects.length > 0 && (
            <label
              className={[
                styles.field,
                styles.fullWidth,
              ].join(" ")}
            >
              <span>
                Koppla befintligt projekt
              </span>

              <select
                value={
                  draft.existingProjectId
                }
                onChange={(event) =>
                  selectProject(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Fristående offert
                </option>

                {availableProjects.map(
                  (project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.title}
                    </option>
                  )
                )}
              </select>
            </label>
          )}

        <div className={styles.formGrid}>
          <label
            className={[
              styles.field,
              styles.gridFull,
            ].join(" ")}
          >
            <span>
              Offert- eller projekttitel{" "}
              <em>*</em>
            </span>

            <input
              type="text"
              value={draft.title}
              placeholder="Exempel: Ny hemsida"
              onChange={(event) =>
                onChange(
                  "title",
                  event.target.value
                )
              }
            />
          </label>

          <label
            className={[
              styles.field,
              styles.gridFull,
            ].join(" ")}
          >
            <span>Projektbeskrivning</span>

            <textarea
              rows={4}
              value={draft.description}
              placeholder="Beskriv projektets mål, omfattning och kundens önskemål."
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Projektkategori</span>

            <select
              value={draft.categoryId}
              onChange={(event) =>
                onChange(
                  "categoryId",
                  event.target.value
                )
              }
            >
              <option value="">
                Välj kategori
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

          <label className={styles.field}>
            <span>Önskat startdatum</span>

            <input
              type="date"
              value={
                draft.desiredStartDate
              }
              onChange={(event) =>
                onChange(
                  "desiredStartDate",
                  event.target.value
                )
              }
            />
          </label>

          <label
            className={[
              styles.field,
              styles.gridFull,
            ].join(" ")}
          >
            <span>
              Intern anteckning
            </span>

            <textarea
              rows={3}
              value={draft.internalNote}
              placeholder="Endast synlig internt."
              onChange={(event) =>
                onChange(
                  "internalNote",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}
