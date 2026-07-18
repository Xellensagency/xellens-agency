"use client";

import Link from "next/link";

import {
  useState,
  useTransition,
} from "react";

import {
  ArrowLeft,
  Building2,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  deleteCustomerAction,
  updateCustomerAction,
} from "@/app/dashboard/kunder/[id]/actions";

import type {
  CustomerDetail,
  CustomerDetailContact,
} from "@/lib/dashboard/customers/customer-detail-types";

import InviteCustomerPortalButton from "./InviteCustomerPortalButton";

import styles from "./CustomerDetailForm.module.css";

type CustomerDetailFormProps = {
  initialCustomer:
    CustomerDetail;
};

export default function CustomerDetailForm({
  initialCustomer,
}: CustomerDetailFormProps) {
  const router =
    useRouter();

  const [
    customer,
    setCustomer,
  ] = useState(
    initialCustomer
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    hasError,
    setHasError,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function updateField<
    K extends keyof CustomerDetail
  >(
    field: K,
    value: CustomerDetail[K]
  ) {
    setCustomer(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function updateContact<
    K extends keyof CustomerDetailContact
  >(
    contactId: string,
    field: K,
    value: CustomerDetailContact[K]
  ) {
    setCustomer((current) => ({
      ...current,

      contacts: current.contacts.map(
        (contact) => {
          if (
            field === "isPrimary" &&
            value === true
          ) {
            return {
              ...contact,
              isPrimary:
                contact.id === contactId,
            };
          }

          if (
            contact.id !== contactId
          ) {
            return contact;
          }

          return {
            ...contact,
            [field]: value,
          };
        }
      ),
    }));
  }

  function addContact() {
    const id =
      crypto.randomUUID();

    setCustomer(
      (current) => ({
        ...current,

        contacts: [
          ...current.contacts,
          {
            id,
            fullName: "",
            jobTitle: "",
            email: "",
            phone: "",
            isPrimary:
              current.contacts.length ===
              0,
          },
        ],
      })
    );
  }

  function removeContact(
    contactId: string
  ) {
    setCustomer(
      (current) => {
        const remaining =
          current.contacts.filter(
            (contact) =>
              contact.id !==
              contactId
          );

        if (
          remaining.length > 0 &&
          !remaining.some(
            (contact) =>
              contact.isPrimary
          )
        ) {
          remaining[0] = {
            ...remaining[0],
            isPrimary: true,
          };
        }

        return {
          ...current,
          contacts: remaining,
        };
      }
    );
  }

  function saveCustomer() {
    setMessage("");
    setHasError(false);

    startTransition(
      async () => {
        const result =
          await updateCustomerAction(
            customer
          );

        setMessage(
          result.message
        );

        setHasError(
          !result.success
        );

        if (result.success) {
          router.refresh();
        }
      }
    );
  }

  function deleteCustomer() {
    const confirmed =
      window.confirm(
        `Vill du verkligen ta bort ${customer.name} permanent?\n\nÅtgärden går inte att ångra.`
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setHasError(false);

    startTransition(
      async () => {
        const result =
          await deleteCustomerAction(
            customer.id
          );

        if (result.success) {
          router.push(
            "/dashboard/kunder?borttagen=1"
          );

          router.refresh();
          return;
        }

        setMessage(
          result.message
        );

        setHasError(true);
      }
    );
  }

  const primaryPortalContact =
    customer.contacts.find(
      (contact) =>
        contact.isPrimary &&
        contact.email.trim()
    ) ||
    customer.contacts.find(
      (contact) =>
        contact.email.trim()
    );

  const portalRecipientEmail =
    primaryPortalContact
      ?.email
      .trim() ||
    customer.email.trim();

  const portalRecipientName =
    primaryPortalContact
      ?.fullName
      .trim() ||
    customer.name.trim();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link href="/dashboard/kunder">
            <ArrowLeft size={17} />
            Tillbaka till kunder
          </Link>

          <span>
            {customer.customerNumber}
          </span>

          <h1>
            {customer.name}
          </h1>

          <p>
            Ändra kunduppgifter,
            kontaktpersoner och
            fakturainformation.
          </p>
        </div>

        <div className={styles.headingActions}>
          <InviteCustomerPortalButton
            customerId={
              customer.id
            }
            customerName={
              customer.name
            }
            recipientEmail={
              portalRecipientEmail
            }
            recipientName={
              portalRecipientName
            }
          />

          <button
            type="button"
            className={styles.deleteButton}
            onClick={deleteCustomer}
            disabled={isPending}
          >
            <Trash2 size={17} />
            Ta bort
          </button>

          <button
            type="button"
            className={styles.saveButton}
            onClick={saveCustomer}
            disabled={isPending}
          >
            <Save size={17} />

            {isPending
              ? "Sparar..."
              : "Spara ändringar"}
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`${styles.message} ${
            hasError
              ? styles.error
              : styles.success
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          {customer.customerType ===
          "company" ? (
            <Building2 size={23} />
          ) : (
            <UserRound size={23} />
          )}

          <div>
            <h2>
              Grundinformation
            </h2>

            <p>
              Kundens identitet och
              aktuella status.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>Kundtyp</span>

            <select
              value={
                customer.customerType
              }
              onChange={(event) =>
                updateField(
                  "customerType",
                  event.target.value as
                    CustomerDetail[
                      "customerType"
                    ]
                )
              }
            >
              <option value="company">
                Företag
              </option>

              <option value="private">
                Privatperson
              </option>
            </select>
          </label>

          <label>
            <span>Status</span>

            <select
              value={customer.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as
                    CustomerDetail[
                      "status"
                    ]
                )
              }
            >
              <option value="prospect">
                Prospekt
              </option>

              <option value="active">
                Aktiv
              </option>

              <option value="former">
                Tidigare kund
              </option>

              <option value="inactive">
                Inaktiv
              </option>
            </select>
          </label>

          <label className={styles.full}>
            <span>
              Kund- eller företagsnamn
            </span>

            <input
              value={customer.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
            />
          </label>

          {customer.customerType ===
          "company" ? (
            <>
              <label>
                <span>
                  Organisationsnummer
                </span>

                <input
                  value={
                    customer.organizationNumber
                  }
                  onChange={(event) =>
                    updateField(
                      "organizationNumber",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Bransch</span>

                <input
                  value={
                    customer.industry
                  }
                  onChange={(event) =>
                    updateField(
                      "industry",
                      event.target.value
                    )
                  }
                />
              </label>
            </>
          ) : (
            <label className={styles.full}>
              <span>Personnummer</span>

              <input
                value={
                  customer.personalIdentityNumber
                }
                onChange={(event) =>
                  updateField(
                    "personalIdentityNumber",
                    event.target.value
                  )
                }
              />
            </label>
          )}

          <label>
            <span>E-postadress</span>

            <input
              type="email"
              value={customer.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Telefonnummer</span>

            <input
              value={customer.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.full}>
            <span>Webbplats</span>

            <input
              value={customer.website}
              onChange={(event) =>
                updateField(
                  "website",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.full}>
            <span>Beskrivning</span>

            <textarea
              rows={4}
              value={
                customer.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <Building2 size={23} />

          <div>
            <h2>
              Adress och fakturering
            </h2>

            <p>
              Adress, fakturamejl och
              betalningsvillkor.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.full}>
            <span>Adress</span>

            <input
              value={customer.address}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Postnummer</span>

            <input
              value={
                customer.postalCode
              }
              onChange={(event) =>
                updateField(
                  "postalCode",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Ort</span>

            <input
              value={customer.city}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Land</span>

            <input
              value={customer.country}
              onChange={(event) =>
                updateField(
                  "country",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Fakturamejl</span>

            <input
              type="email"
              value={
                customer.billingEmail
              }
              onChange={(event) =>
                updateField(
                  "billingEmail",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.full}>
            <span>Fakturaadress</span>

            <input
              value={
                customer.billingAddress
              }
              onChange={(event) =>
                updateField(
                  "billingAddress",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>
              Faktura postnummer
            </span>

            <input
              value={
                customer.billingPostalCode
              }
              onChange={(event) =>
                updateField(
                  "billingPostalCode",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Fakturaort</span>

            <input
              value={
                customer.billingCity
              }
              onChange={(event) =>
                updateField(
                  "billingCity",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Fakturareferens</span>

            <input
              value={
                customer.invoiceReference
              }
              onChange={(event) =>
                updateField(
                  "invoiceReference",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>
              Betalningsvillkor
            </span>

            <select
              value={
                customer.paymentTerms
              }
              onChange={(event) =>
                updateField(
                  "paymentTerms",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value={10}>
                10 dagar
              </option>

              <option value={15}>
                15 dagar
              </option>

              <option value={30}>
                30 dagar
              </option>

              <option value={60}>
                60 dagar
              </option>
            </select>
          </label>
        </div>
      </section>

      {customer.customerType ===
        "company" && (
        <section className={styles.card}>
          <div className={styles.contactHeading}>
            <div className={styles.cardHeading}>
              <UserRound size={23} />

              <div>
                <h2>
                  Kontaktpersoner
                </h2>

                <p>
                  Personer som är kopplade
                  till kunden.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addContact}
              className={styles.addButton}
            >
              <Plus size={16} />
              Lägg till kontakt
            </button>
          </div>

          <div className={styles.contacts}>
            {customer.contacts.map(
              (contact) => (
                <article
                  key={contact.id}
                  className={
                    styles.contact
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.removeContact
                    }
                    onClick={() =>
                      removeContact(
                        contact.id
                      )
                    }
                    aria-label="Ta bort kontaktperson"
                  >
                    <X size={16} />
                  </button>

                  <div className={styles.grid}>
                    <label>
                      <span>Namn</span>

                      <input
                        value={
                          contact.fullName
                        }
                        onChange={(event) =>
                          updateContact(
                            contact.id,
                            "fullName",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Titel</span>

                      <input
                        value={
                          contact.jobTitle
                        }
                        onChange={(event) =>
                          updateContact(
                            contact.id,
                            "jobTitle",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>E-post</span>

                      <input
                        type="email"
                        value={
                          contact.email
                        }
                        onChange={(event) =>
                          updateContact(
                            contact.id,
                            "email",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Telefon</span>

                      <input
                        value={
                          contact.phone
                        }
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
                      styles.primaryContact
                    }
                  >
                    <input
                      type="checkbox"
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

            {customer.contacts.length ===
              0 && (
              <p className={styles.empty}>
                Ingen kontaktperson har
                lagts till.
              </p>
            )}
          </div>
        </section>
      )}

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <UserRound size={23} />

          <div>
            <h2>
              Intern information
            </h2>

            <p>
              Informationen visas endast
              för Xellens.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>Källa</span>

            <input
              value={customer.source}
              onChange={(event) =>
                updateField(
                  "source",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span>Antal anställda</span>

            <input
              value={
                customer.employeeRange
              }
              onChange={(event) =>
                updateField(
                  "employeeRange",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.full}>
            <span>Interna anteckningar</span>

            <textarea
              rows={5}
              value={customer.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <footer className={styles.bottomActions}>
        <Link href="/dashboard/kunder">
          Avbryt
        </Link>

        <button
          type="button"
          onClick={saveCustomer}
          disabled={isPending}
        >
          <Save size={17} />

          {isPending
            ? "Sparar..."
            : "Spara ändringar"}
        </button>
      </footer>
    </div>
  );
}



