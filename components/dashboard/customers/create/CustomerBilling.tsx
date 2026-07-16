"use client";

import {
  CreditCard,
  Mail,
} from "lucide-react";

import type {
  CustomerDraft,
} from "@/lib/dashboard/customers/create-customer-types";

import styles from "./CreateCustomerWizard.module.css";

type CustomerBillingProps = {
  draft: CustomerDraft;
  stepNumber: number;
  onChange: <
    K extends keyof CustomerDraft
  >(
    field: K,
    value: CustomerDraft[K]
  ) => void;
};

export default function CustomerBilling({
  draft,
  stepNumber,
  onChange,
}: CustomerBillingProps) {
  return (
    <section className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>
          {stepNumber}.
        </span>

        <div>
          <h2>Fakturering</h2>

          <p>
            Ange fakturamejl, referens,
            betalningsvillkor och eventuell
            separat fakturaadress.
          </p>
        </div>
      </div>

      <div className={styles.billingNotice}>
        <CreditCard
          size={20}
          strokeWidth={1.8}
        />

        <span>
          Uppgifterna används när offerter
          och fakturor skapas för kunden.
        </span>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Fakturamejl</span>

          <div className={styles.inputWithIcon}>
            <Mail
              size={16}
              strokeWidth={1.8}
            />

            <input
              type="email"
              value={draft.billingEmail}
              placeholder={
                draft.email ||
                "faktura@kund.se"
              }
              onChange={(event) =>
                onChange(
                  "billingEmail",
                  event.target.value
                )
              }
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>Fakturareferens</span>

          <input
            type="text"
            value={draft.invoiceReference}
            placeholder="Namn, referens eller kostnadsställe"
            onChange={(event) =>
              onChange(
                "invoiceReference",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Betalningsvillkor</span>

          <select
            value={draft.paymentTerms}
            onChange={(event) =>
              onChange(
                "paymentTerms",
                event.target.value
              )
            }
          >
            <option value="10">
              10 dagar
            </option>

            <option value="15">
              15 dagar
            </option>

            <option value="20">
              20 dagar
            </option>

            <option value="30">
              30 dagar
            </option>
          </select>
        </label>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={
            draft.billingAddressSameAsMain
          }
          onChange={(event) =>
            onChange(
              "billingAddressSameAsMain",
              event.target.checked
            )
          }
        />

        Fakturaadressen är samma som kundens
        ordinarie adress
      </label>

      {!draft.billingAddressSameAsMain && (
        <div className={styles.addressBlock}>
          <h3>Separat fakturaadress</h3>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Fakturaadress</span>

              <input
                type="text"
                value={draft.billingAddress}
                placeholder="Gatuadress"
                onChange={(event) =>
                  onChange(
                    "billingAddress",
                    event.target.value
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Postnummer</span>

              <input
                type="text"
                value={
                  draft.billingPostalCode
                }
                placeholder="252 21"
                onChange={(event) =>
                  onChange(
                    "billingPostalCode",
                    event.target.value
                  )
                }
              />
            </label>

            <label className={styles.field}>
              <span>Ort</span>

              <input
                type="text"
                value={draft.billingCity}
                placeholder="Helsingborg"
                onChange={(event) =>
                  onChange(
                    "billingCity",
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
