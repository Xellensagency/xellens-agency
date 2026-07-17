import {
  render,
} from "@react-email/render";

import CustomerPortalInvitationEmail from "@/emails/CustomerPortalInvitationEmail";

export default async function CustomerInvitationEmailPreviewPage() {
  const emailHtml =
    await render(
      <CustomerPortalInvitationEmail
        firstName="Emma"
        companyName="Nordic Skin"
        invitedByName="Andreas Ekelöf"
        activationUrl="https://kund.xellensagency.com/aktivera?token=xellens-exempel"
        expiresAt="23 juli 2026 kl. 18:00"
        recipientEmail="emma@nordicskin.se"
      />
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px",
        color: "#eef5f6",
      }}
    >
      <div
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
          E-POSTMALL
        </span>

        <h1
          style={{
            margin: "7px 0 0",
            fontSize: "25px",
          }}
        >
          Inbjudan till kundportalen
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            color: "#82949b",
            fontSize: "12px",
          }}
        >
          Förhandsvisning av mejlet kunden
          får när du bjuder in personen.
        </p>
      </div>

      <iframe
        title="Inbjudan till kundportalen"
        srcDoc={emailHtml}
        style={{
          width: "100%",
          minHeight: "1050px",
          border: "1px solid #263d46",
          borderRadius: "12px",
          backgroundColor: "#eef3f6",
        }}
      />
    </div>
  );
}
