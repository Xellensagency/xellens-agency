import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type CustomerPortalWelcomeEmailProps = {
  firstName: string;
  companyName: string;
  portalUrl: string;
};

export default function CustomerPortalWelcomeEmail({
  firstName = "Emma",
  companyName = "Nordic Skin",
  portalUrl = "https://kund.xellensagency.com",
}: CustomerPortalWelcomeEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText="Ditt konto i Xellens kundportal är aktiverat."
      eyebrow="VÄLKOMMEN!"
      title={
        <>
          Välkommen till
          <br />
          Xellens Portal
        </>
      }
      intro="Din nya hubb för smidig projektkommunikation och effektivt samarbete."
      greeting={`Hej ${firstName}!`}
      body={
        <>
          Ditt konto för <strong>{companyName}</strong> är nu
          aktiverat. Du kan följa projekt, filer, meddelanden,
          godkännanden och fakturor på ett och samma ställe.
        </>
      }
      illustrationBadge="KONTO AKTIVERAT"
      illustrationTitle="Din kundportal är redo"
      ctaLabel="Öppna kundportalen"
      ctaUrl={portalUrl}
      features={[
        {
          icon: "▣",
          title: "Samla allt",
          text: "Projekt, dokument och uppdateringar på ett ställe.",
        },
        {
          icon: "●",
          title: "Kommunicera",
          text: "Kommentarer, meddelanden och möten samlade.",
        },
        {
          icon: "✓",
          title: "Godkänn smidigt",
          text: "Granska material och lämna feedback snabbare.",
        },
      ]}
      noticeTitle="Säker. Pålitlig. Tillgänglig."
      noticeText="Din information hanteras säkert och är tillgänglig när du behöver den."
    />
  );
}
