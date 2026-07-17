"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  UserRoundPlus,
} from "lucide-react";

import type {
  CustomerContactDraft,
  CustomerDraft,
  CustomerWizardStep,
} from "@/lib/dashboard/customers/create-customer-types";

import {
  createCustomerAction,
} from "@/app/dashboard/kunder/ny/actions";

import CustomerBasicInfo from "./CustomerBasicInfo";
import CustomerBilling from "./CustomerBilling";
import CustomerContacts from "./CustomerContacts";
import CustomerPreview from "./CustomerPreview";
import CustomerSteps from "./CustomerSteps";

import styles from "./CreateCustomerWizard.module.css";

const initialDraft: CustomerDraft = {
  customerType: "company",

  companyName: "",
  organizationNumber: "",
  industry: "",
  employeeRange: "",

  firstName: "",
  lastName: "",
  personalIdentityNumber: "",

  description: "",
  status: "prospect",
  source: "",

  website: "",
  email: "",
  phone: "",

  address: "",
  postalCode: "",
  city: "",
  country: "Sverige",

  billingEmail: "",
  invoiceReference: "",
  paymentTerms: "30",

  billingAddressSameAsMain: true,
  billingAddress: "",
  billingPostalCode: "",
  billingCity: "",
};

const companySteps: CustomerWizardStep[] = [
  {
    id: 1,
    title: "Grundinformation",
    subtitle: "Kunduppgifter",
  },
  {
    id: 2,
    title: "Kontaktperson",
    subtitle: "Kontaktuppgifter",
  },
  {
    id: 3,
    title: "Fakturering",
    subtitle: "Faktura & betalning",
  },
  {
    id: 4,
    title: "Översikt",
    subtitle: "Granska & skapa",
  },
];

const privateSteps: CustomerWizardStep[] = [
  {
    id: 1,
    title: "Grundinformation",
    subtitle: "Personuppgifter",
  },
  {
    id: 2,
    title: "Fakturering",
    subtitle: "Faktura & betalning",
  },
  {
    id: 3,
    title: "Översikt",
    subtitle: "Granska & skapa",
  },
];

export default function CreateCustomerWizard() {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState(false);

  const [draft, setDraft] =
    useState<CustomerDraft>(initialDraft);

  const [contacts, setContacts] =
    useState<CustomerContactDraft[]>([]);

  const [activeStep, setActiveStep] =
    useState(1);

  const steps = useMemo(
    () =>
      draft.customerType === "company"
        ? companySteps
        : privateSteps,
    [draft.customerType]
  );

  function updateDraft<
    K extends keyof CustomerDraft
  >(
    field: K,
    value: CustomerDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    if (
      field === "customerType" &&
      activeStep > 1
    ) {
      setActiveStep(1);
    }
  }

  function changeStep(step: number) {
    const safeStep = Math.min(
      Math.max(step, 1),
      steps.length
    );

    setActiveStep(safeStep);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const isReviewStep =
    activeStep === steps.length;

  const customerName =
    draft.customerType === "company"
      ? draft.companyName
      : [draft.firstName, draft.lastName]
          .filter(Boolean)
          .join(" ");

  function handleCreateCustomer() {
    setSaveMessage("");
    setSaveError(false);

    startTransition(async () => {
      const result =
        await createCustomerAction(
          draft,
          contacts
        );

      setSaveMessage(
        result.message
      );

      setSaveError(
        !result.success
      );

      if (
        result.success &&
        result.customerId
      ) {
        router.push(
          "/dashboard/kunder?skapad=1"
        );

        router.refresh();
      }
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <span className={styles.breadcrumb}>
            Kunder / Skapa ny
          </span>

          <div className={styles.titleRow}>
            <h1>Skapa ny kund</h1>

            <UserRoundPlus size={25} />
          </div>

          <p>
            Välj kundtyp och fyll sedan i
            kundens uppgifter steg för steg.
          </p>
        </div>

        <div className={styles.topActions}>
          <Link
            href="/dashboard/kunder"
            className={styles.secondaryButton}
          >
            Avbryt
          </Link>

          {!isReviewStep && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                changeStep(activeStep + 1)
              }
            >
              Nästa steg
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>

      <CustomerSteps
        steps={steps}
        activeStep={activeStep}
        onStepChange={changeStep}
      />

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          {activeStep === 1 && (
            <CustomerBasicInfo
              draft={draft}
              onChange={updateDraft}
            />
          )}

          {draft.customerType ===
            "company" &&
            activeStep === 2 && (
              <CustomerContacts
                contacts={contacts}
                onChange={setContacts}
              />
            )}

          {activeStep ===
            (draft.customerType ===
            "company"
              ? 3
              : 2) && (
            <CustomerBilling
              draft={draft}
              stepNumber={activeStep}
              onChange={updateDraft}
            />
          )}

          {isReviewStep && (
            <section
              className={styles.formCard}
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <span
                  className={
                    styles.sectionNumber
                  }
                >
                  {activeStep}
                </span>

                <div>
                  <h2>Granska och skapa</h2>

                  <p>
                    Kontrollera uppgifterna
                    innan kunden sparas.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.reviewSuccess
                }
              >
                <CheckCircle2 size={24} />

                <div>
                  <strong>
                    {customerName ||
                      "Ny kund"}
                  </strong>

                  <span>
                    Kundtypen är{" "}
                    {draft.customerType ===
                    "company"
                      ? "företag"
                      : "privatperson"}
                    .
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.reviewGrid
                }
              >
                <div>
                  <span>Kundstatus</span>
                  <strong>
                    {draft.status}
                  </strong>
                </div>

                <div>
                  <span>E-post</span>
                  <strong>
                    {draft.email ||
                      "Ej angiven"}
                  </strong>
                </div>

                <div>
                  <span>Telefon</span>
                  <strong>
                    {draft.phone ||
                      "Ej angivet"}
                  </strong>
                </div>

                <div>
                  <span>Fakturamejl</span>
                  <strong>
                    {draft.billingEmail ||
                      draft.email ||
                      "Ej angiven"}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {saveMessage && (
            <div
              className={`${styles.saveMessage} ${
                saveError
                  ? styles.saveError
                  : styles.saveSuccess
              }`}
              role="status"
            >
              {saveMessage}
            </div>
          )}

          <footer className={styles.actions}>
            {activeStep === 1 ? (
              <Link
                href="/dashboard/kunder"
                className={
                  styles.secondaryButton
                }
              >
                Avbryt
              </Link>
            ) : (
              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={() =>
                  changeStep(
                    activeStep - 1
                  )
                }
              >
                <ArrowLeft size={17} />
                Föregående
              </button>
            )}

            <button
              type="button"
              className={styles.draftButton}
            >
              <Save size={16} />
              Spara utkast
            </button>

            {isReviewStep ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleCreateCustomer}
                disabled={isPending}
              >
                <CheckCircle2 size={17} />

                {isPending
                  ? "Skapar kund..."
                  : "Skapa kund"}
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() =>
                  changeStep(
                    activeStep + 1
                  )
                }
              >
                Nästa steg
                <ArrowRight size={17} />
              </button>
            )}
          </footer>
        </div>

        <CustomerPreview
          draft={draft}
          contacts={contacts}
        />
      </div>
    </div>
  );
}

