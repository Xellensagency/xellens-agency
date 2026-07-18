"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  Send,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  sendInvoiceAction,
} from "@/app/dashboard/fakturor/send-actions";

import styles from "./InvoiceDetail.module.css";

type SendInvoiceButtonProps = {
  invoiceId: string;
  invoiceNumber: string;
  recipientEmail: string | null;
  sentAt: string | null;
};

export default function SendInvoiceButton({
  invoiceId,
  invoiceNumber,
  recipientEmail,
  sentAt,
}: SendInvoiceButtonProps) {
  const router =
    useRouter();

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    hasError,
    setHasError,
  ] =
    useState(false);

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function sendInvoice() {
    setMessage("");
    setHasError(false);

    if (sentAt) {
      const confirmed =
        window.confirm(
          `Faktura ${invoiceNumber} har redan skickats.\n\nVill du skicka den igen till ${recipientEmail || "fakturamottagaren"}?`
        );

      if (!confirmed) {
        return;
      }
    }

    startTransition(
      async () => {
        const result =
          await sendInvoiceAction(
            invoiceId
          );

        if (!result.ok) {
          setHasError(true);

          setMessage(
            result.error ||
            "Fakturan kunde inte skickas."
          );

          return;
        }

        setHasError(false);

        setMessage(
          result.message ||
          "Fakturan har skickats."
        );

        router.refresh();
      }
    );
  }

  return (
    <div
      className={
        styles.sendControl
      }
    >
      <button
        type="button"
        onClick={
          sendInvoice
        }
        disabled={
          isPending
        }
        title={
          recipientEmail
            ? `Skicka till ${recipientEmail}`
            : "Fakturan saknar fakturamejl"
        }
      >
        {isPending ? (
          <LoaderCircle
            size={17}
            className={
              styles.spinner
            }
          />
        ) : (
          <Send size={17} />
        )}

        {isPending
          ? "Skickar..."
          : sentAt
            ? "Skicka igen"
            : "Skicka faktura"}
      </button>

      {message && (
        <div
          className={`${styles.sendFeedback} ${
            hasError
              ? styles.sendFeedbackError
              : styles.sendFeedbackSuccess
          }`}
          role="status"
        >
          {hasError ? (
            <TriangleAlert
              size={16}
            />
          ) : (
            <CheckCircle2
              size={16}
            />
          )}

          <span>
            {message}
          </span>
        </div>
      )}
    </div>
  );
}
