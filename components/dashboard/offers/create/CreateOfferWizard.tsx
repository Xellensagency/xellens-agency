"use client";

import Link from "next/link";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  Send,
  TriangleAlert,
} from "lucide-react";

import {
  saveOfferAction,
} from "@/app/dashboard/offerter/actions";

import type {
  CreateOfferOptions,
  OfferAddonDraft,
  OfferDiscountDraft,
  OfferDraft,
  OfferServiceDraft,
} from "@/lib/dashboard/offers/create-offer-types";

import OfferAddons from "./OfferAddons";
import OfferInformation from "./OfferInformation";
import OfferPreview from "./OfferPreview";
import OfferServices from "./OfferServices";
import OfferSteps from "./OfferSteps";
import OfferSummary from "./OfferSummary";

import styles from "./CreateOfferWizard.module.css";

type CreateOfferWizardProps = {
  options: CreateOfferOptions;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const initialDraft: OfferDraft = {
  customerMode: "existing",
  customerId: "",
  contactId: "",

  newCustomerType: "company",
  newCustomerName: "",
  newCustomerEmail: "",
  newCustomerPhone: "",

  existingProjectId: "",
  title: "",
  description: "",
  categoryId: "",
  desiredStartDate: "",
  internalNote: "",

  validDays: "30",
  language: "sv",
  currency: "SEK",

  customerMessage:
    "Tack för er förfrågan. Här kommer vårt offertförslag baserat på era önskemål.",

  paymentTerms:
    "30 % betalas vid projektstart. Resterande belopp faktureras enligt överenskommen betalningsplan.",

  termsText:
    "Offerten gäller under angiven giltighetstid. Två korrigeringsrundor ingår om inget annat anges. Ändringar utanför avtalad omfattning offereras separat.",

  includeDetailedPricing: true,
  showVat: true,
  includePdf: true,
  sendCopyToSelf: true,
};

export default function CreateOfferWizard({
  options,
}: CreateOfferWizardProps) {
  const router = useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    activeStep,
    setActiveStep,
  ] = useState(1);

  const [draft, setDraft] =
    useState<OfferDraft>(
      initialDraft
    );

  const [
    selectedServices,
    setSelectedServices,
  ] = useState<
    OfferServiceDraft[]
  >([]);

  const [
    selectedAddons,
    setSelectedAddons,
  ] = useState<
    OfferAddonDraft[]
  >([]);

  const [
    discount,
    setDiscount,
  ] = useState<OfferDiscountDraft>({
    mode: "none",
    value: 0,
    label: "",
    code: "",
  });

  const [
    savedOfferId,
    setSavedOfferId,
  ] = useState<string | null>(
    null
  );

  const [
    savedOfferNumber,
    setSavedOfferNumber,
  ] = useState("");

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  function updateDraft<
    K extends keyof OfferDraft
  >(
    field: K,
    value: OfferDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function changeStep(step: number) {
    const safeStep = Math.min(
      Math.max(step, 1),
      4
    );

    setActiveStep(safeStep);
    setFeedback(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const customerIsReady =
    draft.customerMode ===
    "existing"
      ? Boolean(draft.customerId)
      : Boolean(
          draft.newCustomerName.trim()
        );

  const informationIsReady =
    customerIsReady &&
    Boolean(draft.title.trim());

  const servicesAreReady =
    selectedServices.length > 0;

  const currentStepIsReady =
    activeStep === 1
      ? informationIsReady
      : activeStep === 2
        ? servicesAreReady
        : true;

  function getValidationError() {
    if (!customerIsReady) {
      return draft.customerMode ===
        "existing"
        ? "Välj en kund innan offerten sparas."
        : "Ange kundens namn innan offerten sparas.";
    }

    if (!draft.title.trim()) {
      return "Ange en offert- eller projekttitel.";
    }

    if (
      selectedServices.length === 0
    ) {
      return "Lägg till minst en tjänst i offerten.";
    }

    return null;
  }

  function persistOffer(
    sendNow: boolean
  ) {
    const validationError =
      getValidationError();

    if (validationError) {
      setFeedback({
        type: "error",
        message: validationError,
      });

      return;
    }

    setFeedback(null);

    startSaving(() => {
      void (async () => {
        const result =
          await saveOfferAction({
            offerId: savedOfferId,
            sendNow,
            payload: {
              draft,
              services:
                selectedServices,
              addons:
                selectedAddons,
              discount,
            },
          });

        if (
          !result.ok ||
          !result.offerId
        ) {
          setFeedback({
            type: "error",
            message:
              result.error ||
              "Offerten kunde inte sparas.",
          });

          return;
        }

        setSavedOfferId(
          result.offerId
        );

        setSavedOfferNumber(
          result.offerNumber || ""
        );

        if (sendNow) {
          router.push(
            `/dashboard/offerter/${result.offerId}/skickad`
          );

          router.refresh();
          return;
        }

        setFeedback({
          type: "success",
          message:
            result.offerNumber
              ? `Utkast ${result.offerNumber} är sparat.`
              : "Offertutkastet är sparat.",
        });
      })();
    });
  }

  function handlePrimaryAction() {
    if (activeStep < 4) {
      if (!currentStepIsReady) {
        const validationError =
          getValidationError();

        setFeedback({
          type: "error",
          message:
            validationError ||
            "Fyll i de obligatoriska uppgifterna.",
        });

        return;
      }

      changeStep(activeStep + 1);
      return;
    }

    persistOffer(true);
  }

  const primaryLabel =
    activeStep === 4
      ? isSaving
        ? "Skickar..."
        : "Skicka offert"
      : "Nästa steg";

  return (
    <div className={styles.page}>
      <div className={styles.topActions}>
        <Link
          href="/dashboard/offerter"
          className={styles.backButton}
        >
          <ArrowLeft size={17} />
          Till offerter
        </Link>

        <div>
          {savedOfferNumber && (
            <span
              className={
                styles.savedOfferNumber
              }
            >
              {savedOfferNumber}
            </span>
          )}

          <button
            type="button"
            className={styles.draftButton}
            disabled={isSaving}
            onClick={() =>
              persistOffer(false)
            }
          >
            <Save size={17} />

            {isSaving
              ? "Sparar..."
              : "Spara utkast"}
          </button>

          <button
            type="button"
            className={styles.nextButton}
            disabled={
              isSaving ||
              (activeStep < 4 &&
                !currentStepIsReady)
            }
            onClick={
              handlePrimaryAction
            }
          >
            {activeStep === 4 ? (
              <Send size={17} />
            ) : null}

            {primaryLabel}

            {activeStep < 4 && (
              <ArrowRight size={17} />
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={[
            styles.feedback,
            feedback.type ===
            "success"
              ? styles.feedbackSuccess
              : styles.feedbackError,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.type ===
          "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <TriangleAlert size={18} />
          )}

          <span>
            {feedback.message}
          </span>
        </div>
      )}

      <OfferSteps
        activeStep={activeStep}
        onStepChange={changeStep}
      />

      <div className={styles.layout}>
        <div
          className={
            styles.mainColumn
          }
        >
          {activeStep === 1 && (
            <OfferInformation
              options={options}
              draft={draft}
              onChange={updateDraft}
            />
          )}

          {activeStep === 2 && (
            <OfferServices
              options={options}
              services={
                selectedServices
              }
              onChange={
                setSelectedServices
              }
            />
          )}

          {activeStep === 3 && (
            <OfferAddons
              options={options}
              draft={draft}
              services={
                selectedServices
              }
              addons={
                selectedAddons
              }
              discount={discount}
              onDraftChange={
                updateDraft
              }
              onAddonsChange={
                setSelectedAddons
              }
              onDiscountChange={
                setDiscount
              }
            />
          )}

          {activeStep === 4 && (
            <OfferPreview
              options={options}
              draft={draft}
              services={
                selectedServices
              }
              addons={
                selectedAddons
              }
              discount={discount}
              onDraftChange={
                updateDraft
              }
            />
          )}

          <footer
            className={styles.footer}
          >
            {activeStep === 1 ? (
              <Link
                href="/dashboard/offerter"
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
                disabled={isSaving}
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
              className={
                styles.draftButton
              }
              disabled={isSaving}
              onClick={() =>
                persistOffer(false)
              }
            >
              <Save size={16} />

              {isSaving
                ? "Sparar..."
                : "Spara utkast"}
            </button>

            <button
              type="button"
              className={
                styles.nextButton
              }
              disabled={
                isSaving ||
                (activeStep < 4 &&
                  !currentStepIsReady)
              }
              onClick={
                handlePrimaryAction
              }
            >
              {activeStep === 4 ? (
                <Send size={17} />
              ) : null}

              {primaryLabel}

              {activeStep < 4 && (
                <ArrowRight
                  size={17}
                />
              )}
            </button>
          </footer>
        </div>

        <OfferSummary
          options={options}
          draft={draft}
          services={
            selectedServices
          }
          addons={selectedAddons}
          discount={discount}
          activeStep={activeStep}
        />
      </div>
    </div>
  );
}

