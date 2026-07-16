"use client";

import {
  Building2,
  Lightbulb,
  UserRound,
} from "lucide-react";

import type {
  CustomerContactDraft,
  CustomerDraft,
} from "@/lib/dashboard/customers/create-customer-types";

import styles from "./CreateCustomerWizard.module.css";

type CustomerPreviewProps = {
  draft: CustomerDraft;
  contacts: CustomerContactDraft[];
};

const statusLabels = {
  prospect: "Prospekt",
  active: "Aktiv kund",
  former: "Tidigare kund",
  inactive: "Inaktiv",
};

export default function CustomerPreview({
  draft,
  contacts,
}: CustomerPreviewProps) {
  const customerName =
    draft.customerType === "company"
      ? draft.companyName || "Nytt företag"
      : [draft.firstName, draft.lastName]
          .filter(Boolean)
          .join(" ") ||
        "Ny privatkund";

  const primaryContact =
    contacts.find(
      (contact) => contact.isPrimary
    );

  return (
    <aside className={styles.previewColumn}>
      <section className={styles.previewCard}>
        <div className={styles.previewLabel}>
          Kundöversikt
        </div>

        <div className={styles.customerHero}>
          <span className={styles.customerIcon}>
            {draft.customerType ===
            "company" ? (
              <Building2 size={25} />
            ) : (
              <UserRound size={25} />
            )}
          </span>

          <div>
            <small>
              {draft.customerType ===
              "company"
                ? "Företagskund"
                : "Privatkund"}
            </small>

            <strong>{customerName}</strong>

            <span>
              {statusLabels[draft.status]}
            </span>
          </div>
        </div>

        <dl className={styles.previewDetails}>
          {draft.customerType ===
            "company" && (
            <div>
              <dt>Organisationsnummer</dt>
              <dd>
                {draft.organizationNumber ||
                  "Ej angivet"}
              </dd>
            </div>
          )}

          <div>
            <dt>E-post</dt>
            <dd>
              {draft.email || "Ej angiven"}
            </dd>
          </div>

          <div>
            <dt>Telefon</dt>
            <dd>
              {draft.phone || "Ej angivet"}
            </dd>
          </div>

          <div>
            <dt>Ort</dt>
            <dd>
              {draft.city || "Ej angiven"}
            </dd>
          </div>

          {draft.customerType ===
            "company" && (
            <div>
              <dt>Primär kontakt</dt>
              <dd>
                {primaryContact?.fullName ||
                  "Ej tillagd"}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className={styles.previewCard}>
        <div className={styles.tipHeader}>
          <Lightbulb size={20} />

          <div>
            <strong>Snabbtips</strong>
            <span>
              För en komplett kundprofil
            </span>
          </div>
        </div>

        <ul className={styles.tipList}>
          <li>Välj rätt kundtyp</li>
          <li>Fyll i kontaktuppgifter</li>
          <li>Välj aktuell kundstatus</li>
          <li>Kontrollera fakturamejlen</li>

          {draft.customerType ===
            "company" && (
            <li>
              Lägg till en kontaktperson
            </li>
          )}
        </ul>
      </section>
    </aside>
  );
}
