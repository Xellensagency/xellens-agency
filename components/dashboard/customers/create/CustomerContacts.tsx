"use client";

import {
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  CustomerContactDraft,
} from "@/lib/dashboard/customers/create-customer-types";

import styles from "./CreateCustomerWizard.module.css";

type CustomerContactsProps = {
  contacts: CustomerContactDraft[];
  onChange: (
    contacts: CustomerContactDraft[]
  ) => void;
};

function createContact(
  isPrimary: boolean
): CustomerContactDraft {
  return {
    id: crypto.randomUUID(),
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    isPrimary,
  };
}

export default function CustomerContacts({
  contacts,
  onChange,
}: CustomerContactsProps) {
  function addContact() {
    onChange([
      ...contacts,
      createContact(
        contacts.length === 0
      ),
    ]);
  }

  function updateContact<
    K extends keyof CustomerContactDraft
  >(
    id: string,
    field: K,
    value: CustomerContactDraft[K]
  ) {
    onChange(
      contacts.map((contact) => {
        if (
          field === "isPrimary" &&
          value === true
        ) {
          return {
            ...contact,
            isPrimary:
              contact.id === id,
          };
        }

        if (contact.id !== id) {
          return contact;
        }

        return {
          ...contact,
          [field]: value,
        };
      })
    );
  }

  function removeContact(id: string) {
    const removedContact =
      contacts.find(
        (contact) =>
          contact.id === id
      );

    const nextContacts =
      contacts.filter(
        (contact) =>
          contact.id !== id
      );

    if (
      removedContact?.isPrimary &&
      nextContacts.length > 0
    ) {
      nextContacts[0] = {
        ...nextContacts[0],
        isPrimary: true,
      };
    }

    onChange(nextContacts);
  }

  return (
    <section className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>
          2.
        </span>

        <div>
          <h2>Kontaktpersoner</h2>

          <p>
            Lägg till en eller flera personer
            som arbetar hos företagskunden.
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <UserRound size={28} />

          <strong>
            Ingen kontaktperson tillagd
          </strong>

          <span>
            Lägg till den person som Xellens
            Agency främst ska ha kontakt med.
          </span>
        </div>
      ) : (
        <div className={styles.contactList}>
          {contacts.map(
            (contact, index) => (
              <article
                key={contact.id}
                className={
                  styles.contactCard
                }
              >
                <div
                  className={
                    styles.contactHeader
                  }
                >
                  <strong>
                    Kontaktperson{" "}
                    {index + 1}
                  </strong>

                  <button
                    type="button"
                    aria-label="Ta bort kontaktperson"
                    onClick={() =>
                      removeContact(
                        contact.id
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  className={
                    styles.formGrid
                  }
                >
                  <label
                    className={styles.field}
                  >
                    <span>
                      Namn <em>*</em>
                    </span>

                    <input
                      type="text"
                      value={
                        contact.fullName
                      }
                      placeholder="För- och efternamn"
                      onChange={(event) =>
                        updateContact(
                          contact.id,
                          "fullName",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label
                    className={styles.field}
                  >
                    <span>Titel / roll</span>

                    <input
                      type="text"
                      value={
                        contact.jobTitle
                      }
                      placeholder="Exempel: VD"
                      onChange={(event) =>
                        updateContact(
                          contact.id,
                          "jobTitle",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label
                    className={styles.field}
                  >
                    <span>E-post</span>

                    <input
                      type="email"
                      value={contact.email}
                      placeholder="namn@foretag.se"
                      onChange={(event) =>
                        updateContact(
                          contact.id,
                          "email",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label
                    className={styles.field}
                  >
                    <span>Telefon</span>

                    <input
                      type="tel"
                      value={contact.phone}
                      placeholder="+46"
                      onChange={(event) =>
                        updateContact(
                          contact.id,
                          "phone",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <label
                  className={
                    styles.checkboxRow
                  }
                >
                  <input
                    type="radio"
                    name="primaryContact"
                    checked={
                      contact.isPrimary
                    }
                    onChange={() =>
                      updateContact(
                        contact.id,
                        "isPrimary",
                        true
                      )
                    }
                  />

                  Primär kontaktperson
                </label>
              </article>
            )
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.addButton}
        onClick={addContact}
      >
        <Plus size={17} />

        Lägg till kontaktperson
      </button>
    </section>
  );
}
