"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  MailPlus,
  TriangleAlert,
} from "lucide-react";

import {
  inviteCustomerToPortalAction,
} from "@/app/dashboard/kunder/[id]/portal-actions";

import styles from "./CustomerDetailForm.module.css";

type InviteCustomerPortalButtonProps = {
  customerId: string;
  customerName: string;
  recipientEmail: string;
  recipientName: string;
};

export default function InviteCustomerPortalButton({
  customerId,
  customerName,
  recipientEmail,
  recipientName,
}: InviteCustomerPortalButtonProps) {
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

  function sendInvitation() {
    setMessage("");
    setHasError(false);

    if (!recipientEmail.trim()) {
      setHasError(true);

      setMessage(
        "Lägg till och spara kundens e-postadress först."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Skicka en aktiveringsinbjudan för ${customerName} till ${recipientEmail}?`
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await inviteCustomerToPortalAction(
            customerId,
            recipientEmail,
            recipientName
          );

        setMessage(
          result.message
        );

        setHasError(
          !result.success
        );
      }
    );
  }

  return (
    <div
      className={
        styles.portalInviteControl
      }
    >
      <button
        type="button"
        className={
          styles.inviteButton
        }
        onClick={
          sendInvitation
        }
        disabled={
          isPending
        }
        title={
          recipientEmail
            ? `Skicka aktivering till ${recipientEmail}`
            : "Kunden saknar e-postadress"
        }
      >
        {isPending ? (
          <LoaderCircle
            size={17}
            className={
              styles.inviteSpinner
            }
          />
        ) : (
          <MailPlus size={17} />
        )}

        {isPending
          ? "Skickar..."
          : "Bjud in till kundportalen"}
      </button>

      {message && (
        <div
          className={`${styles.portalInviteMessage} ${
            hasError
              ? styles.portalInviteError
              : styles.portalInviteSuccess
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
