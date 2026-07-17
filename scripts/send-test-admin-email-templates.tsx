import React from "react";

import { loadEnvConfig } from "@next/env";
import { render } from "@react-email/render";
import { Resend } from "resend";

import {
  AdminFileUploadedEmail,
  AdminInvoiceStatusEmail,
  AdminMeetingChangedEmail,
  AdminNewCustomerMessageEmail,
  AdminNewQuoteRequestEmail,
  AdminNewSupportCaseEmail,
  AdminOfferDecisionEmail,
  AdminReviewFeedbackEmail,
} from "../emails/admin/AdminEmailTemplates";

loadEnvConfig(process.cwd());

const wait = (milliseconds: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  const infoEmail =
    process.env.ADMIN_INFO_EMAIL ||
    "info@xellensagency.com";

  const supportEmail =
    process.env.ADMIN_SUPPORT_EMAIL ||
    "support@xellensagency.com";

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

  const adminUrl =
    "https://admin.xellensagency.com";

  const messages = [
    {
      name: "Ny offertförfrågan",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Ny offertförfrågan från Nordic Skin",
      component: (
        <AdminNewQuoteRequestEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          customerEmail="emma@example.com"
          phone="070-000 00 00"
          service="Ny webbplats och kundportal"
          budget="40 000–60 000 kr"
          requestedDeadline="30 september 2026"
          requestUrl={`${adminUrl}/dashboard/offerter`}
        />
      ),
    },

    {
      name: "Offert accepterad",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Offert OFF-TEST-001 accepterad",
      component: (
        <AdminOfferDecisionEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          offerNumber="OFF-TEST-001"
          amount="48 500 SEK"
          decision="Accepterad"
          customerComment="Tack, detta ser bra ut. Vi vill gå vidare."
          offerUrl={`${adminUrl}/dashboard/offerter`}
        />
      ),
    },

    {
      name: "Nytt supportärende",
      recipient: supportEmail,
      subject:
        "[ADMIN TEST] Nytt supportärende SUP-TEST-001",
      component: (
        <AdminNewSupportCaseEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          caseNumber="SUP-TEST-001"
          category="Inloggning"
          priority="Hög"
          message="Jag kommer inte in i kundportalen och behöver hjälp."
          supportUrl={`${adminUrl}/dashboard`}
        />
      ),
    },

    {
      name: "Nytt kundmeddelande",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Nytt kundmeddelande i Testprojekt",
      component: (
        <AdminNewCustomerMessageEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          projectName="Nordic Skin – Ny hemsida"
          message="Vi har nu gått igenom designförslaget och har några frågor."
          sentAt="Idag kl. 14:20"
          messageUrl={`${adminUrl}/dashboard`}
        />
      ),
    },

    {
      name: "Ny granskningsfeedback",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Kunden har begärt ändringar",
      component: (
        <AdminReviewFeedbackEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          projectName="Nordic Skin – Ny hemsida"
          materialName="Designförslag #2"
          response="Ändringar begärda"
          comment="Vi vill gärna ha en ljusare startsida och större kontaktknapp."
          feedbackUrl={`${adminUrl}/dashboard/projekt`}
        />
      ),
    },

    {
      name: "Ny fil uppladdad",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Kunden har laddat upp en ny fil",
      component: (
        <AdminFileUploadedEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          projectName="Nordic Skin – Ny hemsida"
          fileName="produktbilder.zip"
          fileSize="18,4 MB"
          uploadedAt="Idag kl. 15:10"
          fileUrl={`${adminUrl}/dashboard/filer`}
        />
      ),
    },

    {
      name: "Faktura betalad",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Faktura FAK-TEST-001 är betald",
      component: (
        <AdminInvoiceStatusEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          invoiceNumber="FAK-TEST-001"
          amount="25 000 SEK"
          status="Betald"
          statusDate="16 juli 2026"
          invoiceUrl={`${adminUrl}/dashboard/fakturor`}
        />
      ),
    },

    {
      name: "Möte ombokat",
      recipient: infoEmail,
      subject:
        "[ADMIN TEST] Kundmötet har bokats om",
      component: (
        <AdminMeetingChangedEmail
          customerName="Emma Karlsson"
          companyName="Nordic Skin AB"
          meetingTitle="Designgenomgång"
          changeType="Ombokat"
          meetingDate="22 juli 2026"
          meetingTime="13:00–14:00"
          meetingUrl={`${adminUrl}/dashboard/kalender`}
        />
      ),
    },
  ];

  const resend = new Resend(apiKey);

  let sent = 0;
  let failed = 0;

  console.log(
    `Skickar ${messages.length} adminmejl...\n`
  );

  for (const message of messages) {
    try {
      const html = await render(
        message.component
      );

      const { data, error } =
        await resend.emails.send({
          from: fromEmail,
          to: [message.recipient],
          replyTo: replyTo || undefined,
          subject: message.subject,
          html,
        });

      if (error) {
        failed += 1;

        console.error(
          `MISSLYCKADES: ${message.name}`,
          error
        );
      } else {
        sent += 1;

        console.log(
          `SKICKAT: ${message.name}`
        );

        console.log(
          `Till: ${message.recipient}`
        );

        console.log(
          `Resend ID: ${data?.id}\n`
        );
      }
    } catch (error) {
      failed += 1;

      console.error(
        `MISSLYCKADES: ${message.name}`,
        error
      );
    }

    await wait(700);
  }

  console.log(
    "--------------------------------"
  );

  console.log(`Skickade: ${sent}`);
  console.log(`Misslyckades: ${failed}`);
  console.log(`Till info: 7`);
  console.log(`Till support: 1`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    "Adminutskicket kunde inte genomföras:",
    error
  );

  process.exit(1);
});
