import React from "react";

import {
  loadEnvConfig,
} from "@next/env";

import {
  render,
} from "@react-email/render";

import {
  Resend,
} from "resend";

import CustomerPortalInvitationEmail from "../emails/CustomerPortalInvitationEmail";

loadEnvConfig(process.cwd());

async function main() {
  const apiKey =
    process.env.RESEND_API_KEY;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL;

  const replyTo =
    process.env.RESEND_REPLY_TO;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY saknas i .env.local."
    );
  }

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL saknas i .env.local."
    );
  }

  const activationUrl =
    "https://kund.xellensagency.com/aktivera?token=xellens-testinbjudan";

  const html =
    await render(
      <CustomerPortalInvitationEmail
        firstName="Andreas"
        companyName="Xellens Agency Testkund"
        invitedByName="Andreas Ekelöf"
        activationUrl={activationUrl}
        expiresAt="23 juli 2026 kl. 18:00"
        recipientEmail="info@xellensagency.com"
      />
    );

  const resend =
    new Resend(apiKey);

  const {
    data,
    error,
  } = await resend.emails.send({
    from: fromEmail,
    to: [
      "info@xellensagency.com",
    ],
    replyTo:
      replyTo || undefined,
    subject:
      "Du är inbjuden till Xellens kundportal",
    html,
  });

  if (error) {
    console.error(
      "Resend-fel:",
      error
    );

    process.exit(1);
  }

  console.log(
    "Testmejlet skickades till info@xellensagency.com"
  );

  console.log(
    "Resend ID:",
    data?.id
  );
}

main().catch(
  (error) => {
    console.error(
      "Testmejlet kunde inte skickas:",
      error
    );

    process.exit(1);
  }
);
