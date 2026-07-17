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
import CustomerPortalWelcomeEmail from "../emails/CustomerPortalWelcomeEmail";
import InvoiceCreatedEmail from "../emails/InvoiceCreatedEmail";
import NewMessageEmail from "../emails/NewMessageEmail";
import OfferReadyEmail from "../emails/OfferReadyEmail";
import ProjectUpdateEmail from "../emails/ProjectUpdateEmail";
import ReviewReadyEmail from "../emails/ReviewReadyEmail";
import SupportCaseReceivedEmail from "../emails/SupportCaseReceivedEmail";

loadEnvConfig(process.cwd());

const delay = (
  milliseconds: number
) =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      milliseconds
    )
  );

async function main() {
  const apiKey =
    process.env.RESEND_API_KEY;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL;

  const replyTo =
    process.env.RESEND_REPLY_TO;

  const recipient =
    process.env.TEST_EMAIL_RECIPIENT ||
    "info@xellensagency.com";

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

  const emails = [
    {
      name: "Kundinbjudan",

      subject:
        "[TEST] Du är inbjuden till Xellens kundportal",

      component: (
        <CustomerPortalInvitationEmail
          firstName="Andreas"
          companyName="Xellens Testkund"
          invitedByName="Andreas Ekelöf"
          activationUrl="https://kund.xellensagency.com/aktivera?token=test-inbjudan"
          expiresAt="23 juli 2026 kl. 18:00"
          recipientEmail={recipient}
        />
      ),
    },

    {
      name: "Välkommen till portalen",

      subject:
        "[TEST] Välkommen till Xellens kundportal",

      component: (
        <CustomerPortalWelcomeEmail
          firstName="Andreas"
          companyName="Xellens Testkund"
          portalUrl="https://kund.xellensagency.com"
        />
      ),
    },

    {
      name: "Supportärende mottaget",

      subject:
        "[TEST] Vi har tagit emot ditt supportärende",

      component: (
        <SupportCaseReceivedEmail
          firstName="Andreas"
          caseNumber="SUP-TEST-001"
          subject="Test av supportmejl"
          priority="Medel"
          status="Mottaget"
          caseUrl="https://kund.xellensagency.com/support"
        />
      ),
    },

    {
      name: "Nytt meddelande",

      subject:
        "[TEST] Du har fått ett nytt meddelande",

      component: (
        <NewMessageEmail
          firstName="Andreas"
          projectName="Testprojekt – Ny hemsida"
          senderName="Xellens Agency"
          message="Detta är ett testmeddelande för att kontrollera mejlets design och funktion."
          sentAt="Idag kl. 10:24"
          messageUrl="https://kund.xellensagency.com/meddelanden"
        />
      ),
    },

    {
      name: "Klart för granskning",

      subject:
        "[TEST] Nytt material är klart för granskning",

      component: (
        <ReviewReadyEmail
          firstName="Andreas"
          projectName="Testprojekt – Ny hemsida"
          materialName="Designförslag #2"
          deadline="23 juli 2026"
          reviewUrl="https://kund.xellensagency.com/design-feedback"
        />
      ),
    },

    {
      name: "Ny offert",

      subject:
        "[TEST] Din offert från Xellens Agency är klar",

      component: (
        <OfferReadyEmail
          firstName="Andreas"
          offerNumber="OFF-TEST-001"
          projectName="Testprojekt – Ny hemsida"
          amount="48 500 SEK"
          validUntil="10 augusti 2026"
          offerUrl="https://kund.xellensagency.com/offerter"
        />
      ),
    },

    {
      name: "Ny faktura",

      subject:
        "[TEST] Ny faktura från Xellens Agency",

      component: (
        <InvoiceCreatedEmail
          firstName="Andreas"
          invoiceNumber="FAK-TEST-001"
          description="Webbdesign och utveckling"
          amount="25 000 SEK"
          dueDate="15 augusti 2026"
          invoiceUrl="https://kund.xellensagency.com/fakturor"
        />
      ),
    },

    {
      name: "Projektuppdatering",

      subject:
        "[TEST] Ny uppdatering för ditt projekt",

      component: (
        <ProjectUpdateEmail
          firstName="Andreas"
          projectName="Testprojekt – Ny hemsida"
          status="Design pågår"
          latestActivity="Wireframes för startsidan och undersidorna är färdiga."
          nextStep="Granskning av designförslag och återkoppling."
          deadline="10 augusti 2026"
          projectUrl="https://kund.xellensagency.com/projekt"
        />
      ),
    },
  ];

  const resend =
    new Resend(apiKey);

  let sentCount = 0;
  let failedCount = 0;

  console.log(
    `Skickar ${emails.length} testmejl till ${recipient}...\n`
  );

  for (
    const email of emails
  ) {
    try {
      const html =
        await render(
          email.component
        );

      const {
        data,
        error,
      } =
        await resend.emails.send({
          from: fromEmail,
          to: [recipient],
          replyTo:
            replyTo || undefined,
          subject: email.subject,
          html,
        });

      if (error) {
        failedCount += 1;

        console.error(
          `MISSLYCKADES: ${email.name}`,
          error
        );
      } else {
        sentCount += 1;

        console.log(
          `SKICKAT: ${email.name}`
        );

        console.log(
          `Resend ID: ${data?.id}\n`
        );
      }
    } catch (error) {
      failedCount += 1;

      console.error(
        `MISSLYCKADES: ${email.name}`,
        error
      );
    }

    await delay(700);
  }

  console.log(
    "------------------------------"
  );

  console.log(
    `Skickade: ${sentCount}`
  );

  console.log(
    `Misslyckades: ${failedCount}`
  );

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch(
  (error) => {
    console.error(
      "Testutskicket kunde inte genomföras:",
      error
    );

    process.exit(1);
  }
);
