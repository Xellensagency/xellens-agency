import Link from "next/link";

import {
  render,
} from "@react-email/render";

import CustomerPortalInvitationEmail from "@/emails/CustomerPortalInvitationEmail";
import CustomerPortalWelcomeEmail from "@/emails/CustomerPortalWelcomeEmail";
import InvoiceCreatedEmail from "@/emails/InvoiceCreatedEmail";
import NewMessageEmail from "@/emails/NewMessageEmail";
import OfferReadyEmail from "@/emails/OfferReadyEmail";
import ProjectUpdateEmail from "@/emails/ProjectUpdateEmail";
import ReviewReadyEmail from "@/emails/ReviewReadyEmail";
import SupportCaseReceivedEmail from "@/emails/SupportCaseReceivedEmail";

type EmailTemplatesPageProps = {
  searchParams: Promise<{
    mall?: string;
  }>;
};

const templates = {
  inbjudan: {
    label: "Kundinbjudan",
    component: (
      <CustomerPortalInvitationEmail
        firstName="Emma"
        companyName="Nordic Skin"
        invitedByName="Andreas Ekelöf"
        activationUrl="https://kund.xellensagency.com/aktivera?token=xellens-test"
        expiresAt="23 juli 2026 kl. 18:00"
        recipientEmail="emma@nordicskin.se"
      />
    ),
  },

  valkommen: {
    label: "Välkommen",
    component: (
      <CustomerPortalWelcomeEmail
        firstName="Emma"
        companyName="Nordic Skin"
        portalUrl="https://kund.xellensagency.com"
      />
    ),
  },

  support: {
    label: "Supportärende",
    component: (
      <SupportCaseReceivedEmail
        firstName="Emma"
        caseNumber="SUP-2026-04567"
        subject="Problem med inloggning"
        priority="Medel"
        status="Mottaget"
        caseUrl="https://kund.xellensagency.com/support"
      />
    ),
  },

  meddelande: {
    label: "Nytt meddelande",
    component: (
      <NewMessageEmail
        firstName="Emma"
        projectName="Nordic Skin – Ny hemsida"
        senderName="Andreas Ekelöf"
        message="Hej! Här kommer den senaste uppdateringen. Återkom gärna med dina tankar."
        sentAt="Idag kl. 10:24"
        messageUrl="https://kund.xellensagency.com/meddelanden"
      />
    ),
  },

  granskning: {
    label: "Klart för granskning",
    component: (
      <ReviewReadyEmail
        firstName="Emma"
        projectName="Nordic Skin – Ny hemsida"
        materialName="Designförslag #2"
        deadline="23 juli 2026"
        reviewUrl="https://kund.xellensagency.com/design-feedback"
      />
    ),
  },

  offert: {
    label: "Ny offert",
    component: (
      <OfferReadyEmail
        firstName="Emma"
        offerNumber="OFF-2026-0487"
        projectName="Nordic Skin – Ny hemsida"
        amount="48 500 SEK"
        validUntil="10 augusti 2026"
        offerUrl="https://kund.xellensagency.com/offerter"
      />
    ),
  },

  faktura: {
    label: "Ny faktura",
    component: (
      <InvoiceCreatedEmail
        firstName="Emma"
        invoiceNumber="FAK-2026-0587"
        description="Webbdesign och utveckling"
        amount="25 000 SEK"
        dueDate="15 augusti 2026"
        invoiceUrl="https://kund.xellensagency.com/fakturor"
      />
    ),
  },

  projekt: {
    label: "Projektuppdatering",
    component: (
      <ProjectUpdateEmail
        firstName="Emma"
        projectName="Nordic Skin – Ny hemsida"
        status="Design pågår"
        latestActivity="Wireframes för startsida och undersidor är klara."
        nextStep="Granskning av designförslag och feedbackmöte."
        deadline="10 augusti 2026"
        projectUrl="https://kund.xellensagency.com/projekt"
      />
    ),
  },
} as const;

type TemplateKey =
  keyof typeof templates;

export default async function EmailTemplatesPage({
  searchParams,
}: EmailTemplatesPageProps) {
  const parameters =
    await searchParams;

  const requestedTemplate =
    parameters.mall as
      | TemplateKey
      | undefined;

  const selectedKey =
    requestedTemplate &&
    requestedTemplate in templates
      ? requestedTemplate
      : "inbjudan";

  const selected =
    templates[selectedKey];

  const html =
    await render(
      selected.component
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px",
        color: "#eef5f6",
      }}
    >
      <header
        style={{
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            color: "#48d7c8",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.5px",
          }}
        >
          E-POSTMALLAR
        </span>

        <h1
          style={{
            margin: "7px 0 0",
            fontSize: "25px",
          }}
        >
          {selected.label}
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            color: "#82949b",
            fontSize: "12px",
          }}
        >
          Granska Xellens automatiska
          kundmejl.
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        {Object.entries(
          templates
        ).map(
          ([key, template]) => (
            <Link
              key={key}
              href={`/dashboard/e-postmallar?mall=${key}`}
              style={{
                padding:
                  "10px 13px",
                border:
                  key === selectedKey
                    ? "1px solid #45d7c9"
                    : "1px solid #29404a",
                borderRadius: "8px",
                color:
                  key === selectedKey
                    ? "#45d7c9"
                    : "#aebdc2",
                background:
                  key === selectedKey
                    ? "rgba(69, 215, 201, 0.08)"
                    : "#07171e",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {template.label}
            </Link>
          )
        )}
      </nav>

      <iframe
        title={selected.label}
        srcDoc={html}
        style={{
          width: "100%",
          minHeight: "1180px",
          border:
            "1px solid #263d46",
          borderRadius: "12px",
          backgroundColor: "#eef3f6",
        }}
      />
    </div>
  );
}
