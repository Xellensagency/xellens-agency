"use client";

import {
  Building2,
  UserRound,
} from "lucide-react";

import type {
  CustomerDraft,
  CustomerStatus,
  CustomerType,
} from "@/lib/dashboard/customers/create-customer-types";

import styles from "./CreateCustomerWizard.module.css";

type CustomerBasicInfoProps = {
  draft: CustomerDraft;
  onChange: <
    K extends keyof CustomerDraft
  >(
    field: K,
    value: CustomerDraft[K]
  ) => void;
};

const statusOptions: Array<{
  value: CustomerStatus;
  label: string;
}> = [
  {
    value: "prospect",
    label: "Prospekt",
  },
  {
    value: "active",
    label: "Aktiv kund",
  },
  {
    value: "former",
    label: "Tidigare kund",
  },
  {
    value: "inactive",
    label: "Inaktiv",
  },
];

export default function CustomerBasicInfo({
  draft,
  onChange,
}: CustomerBasicInfoProps) {
  function selectCustomerType(
    customerType: CustomerType
  ) {
    onChange(
      "customerType",
      customerType
    );
  }

  return (
    <section className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>
          1.
        </span>

        <div>
          <h2>Grundinformation</h2>

          <p>
            Välj kundtyp och fyll i kundens
            viktigaste uppgifter.
          </p>
        </div>
      </div>

      <div className={styles.typeSelector}>
        <button
          type="button"
          className={[
            styles.typeCard,
            draft.customerType === "company"
              ? styles.typeCardActive
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            selectCustomerType("company")
          }
        >
          <span className={styles.typeIcon}>
            <Building2 size={24} />
          </span>

          <span className={styles.typeText}>
            <strong>Företag</strong>

            <small>
              Företag, förening,
              organisation eller annan
              verksamhet.
            </small>
          </span>
        </button>

        <button
          type="button"
          className={[
            styles.typeCard,
            draft.customerType === "private"
              ? styles.typeCardActive
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            selectCustomerType("private")
          }
        >
          <span className={styles.typeIcon}>
            <UserRound size={24} />
          </span>

          <span className={styles.typeText}>
            <strong>Privatperson</strong>

            <small>
              En privatkund som själv är
              kundens kontaktperson.
            </small>
          </span>
        </button>
      </div>

      {draft.customerType === "company" ? (
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>
              Företagsnamn <em>*</em>
            </span>

            <input
              type="text"
              value={draft.companyName}
              placeholder="Exempel: Nordic Skin AB"
              onChange={(event) =>
                onChange(
                  "companyName",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>
              Organisationsnummer
            </span>

            <input
              type="text"
              value={
                draft.organizationNumber
              }
              placeholder="559123-4567"
              onChange={(event) =>
                onChange(
                  "organizationNumber",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Bransch</span>

            <input
              type="text"
              value={draft.industry}
              placeholder="Exempel: Skönhet och hälsa"
              onChange={(event) =>
                onChange(
                  "industry",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Antal anställda</span>

            <select
              value={draft.employeeRange}
              onChange={(event) =>
                onChange(
                  "employeeRange",
                  event.target.value
                )
              }
            >
              <option value="">
                Välj intervall
              </option>

              <option value="1">
                1 anställd
              </option>

              <option value="2-10">
                2–10 anställda
              </option>

              <option value="11-50">
                11–50 anställda
              </option>

              <option value="51-200">
                51–200 anställda
              </option>

              <option value="201+">
                201 eller fler
              </option>
            </select>
          </label>
        </div>
      ) : (
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>
              Förnamn <em>*</em>
            </span>

            <input
              type="text"
              value={draft.firstName}
              placeholder="Förnamn"
              onChange={(event) =>
                onChange(
                  "firstName",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>
              Efternamn <em>*</em>
            </span>

            <input
              type="text"
              value={draft.lastName}
              placeholder="Efternamn"
              onChange={(event) =>
                onChange(
                  "lastName",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Personnummer</span>

            <input
              type="text"
              value={
                draft.personalIdentityNumber
              }
              placeholder="ÅÅÅÅMMDD-XXXX"
              onChange={(event) =>
                onChange(
                  "personalIdentityNumber",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      )}

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>E-post</span>

          <input
            type="email"
            value={draft.email}
            placeholder="info@kund.se"
            onChange={(event) =>
              onChange(
                "email",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Telefon</span>

          <input
            type="tel"
            value={draft.phone}
            placeholder="+46"
            onChange={(event) =>
              onChange(
                "phone",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Webbplats</span>

          <input
            type="text"
            value={draft.website}
            placeholder="www.kund.se"
            onChange={(event) =>
              onChange(
                "website",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Kundens källa</span>

          <select
            value={draft.source}
            onChange={(event) =>
              onChange(
                "source",
                event.target.value
              )
            }
          >
            <option value="">
              Välj källa
            </option>

            <option value="website">
              Hemsidan
            </option>

            <option value="referral">
              Rekommendation
            </option>

            <option value="social_media">
              Sociala medier
            </option>

            <option value="outreach">
              Egen kontakt
            </option>

            <option value="other">
              Annat
            </option>
          </select>
        </label>
      </div>

      <label
        className={[
          styles.field,
          styles.fullWidth,
        ].join(" ")}
      >
        <span>
          Beskrivning / anteckning
        </span>

        <textarea
          rows={4}
          maxLength={1000}
          value={draft.description}
          placeholder="Skriv relevant information om kunden..."
          onChange={(event) =>
            onChange(
              "description",
              event.target.value
            )
          }
        />

        <small>
          {draft.description.length}/1000
        </small>
      </label>

      <div className={styles.statusField}>
        <span>Kundstatus</span>

        <div className={styles.statusButtons}>
          {statusOptions.map(
            (statusOption) => (
              <button
                key={statusOption.value}
                type="button"
                className={
                  draft.status ===
                  statusOption.value
                    ? styles.statusActive
                    : ""
                }
                onClick={() =>
                  onChange(
                    "status",
                    statusOption.value
                  )
                }
              >
                {statusOption.label}
              </button>
            )
          )}
        </div>
      </div>

      <div className={styles.addressBlock}>
        <h3>Adressuppgifter</h3>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Adress</span>

            <input
              type="text"
              value={draft.address}
              placeholder="Gatuadress"
              onChange={(event) =>
                onChange(
                  "address",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Postnummer</span>

            <input
              type="text"
              value={draft.postalCode}
              placeholder="252 21"
              onChange={(event) =>
                onChange(
                  "postalCode",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Ort</span>

            <input
              type="text"
              value={draft.city}
              placeholder="Helsingborg"
              onChange={(event) =>
                onChange(
                  "city",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>Land</span>

            <input
              type="text"
              value={draft.country}
              onChange={(event) =>
                onChange(
                  "country",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}
