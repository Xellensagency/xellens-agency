import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type SupportCaseReceivedEmailProps = {
  firstName: string;
  caseNumber: string;
  subject: string;
  priority: string;
  status: string;
  caseUrl: string;
};

export default function SupportCaseReceivedEmail({
  firstName = "Emma",
  caseNumber = "SUP-2026-04567",
  subject = "Problem med inloggning",
  priority = "Medel",
  status = "Mottaget",
  caseUrl = "https://kund.xellensagency.com/support",
}: SupportCaseReceivedEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`Vi har tagit emot ditt supportärende ${caseNumber}.`}
      eyebrow="SUPPORT"
      title={
        <>
          Vi har tagit emot
          <br />
          ditt supportärende
        </>
      }
      intro="Vårt team arbetar nu med att hjälpa dig."
      greeting={`Hej ${firstName}!`}
      body={
        <>
          Tack för att du kontaktar oss. Ärendet är registrerat
          och har skickats vidare till rätt person i vårt team.
        </>
      }
      illustrationBadge="SUPPORT"
      illustrationTitle="Ärendet är mottaget"
      ctaLabel="Följ supportärendet"
      ctaUrl={caseUrl}
      details={[
        { label: "Ärendenummer", value: caseNumber },
        { label: "Rubrik", value: subject },
        { label: "Prioritet", value: priority, tone: "warning" }
      ]}
      features={[
        {
          icon: "◷",
          title: "Snabb svarstid",
          text: "Vi strävar efter svar inom en arbetsdag.",
        },
        {
          icon: "▤",
          title: "Komplettera",
          text: "Lägg till mer information när det behövs.",
        },
        {
          icon: "●",
          title: "Direktkontakt",
          text: "Kommunicera med supporten i portalen.",
        },
      ]}
      noticeTitle={`Aktuell status: ${status}`}
      noticeText="Du får en notis när ärendet besvaras eller ändrar status."
    />
  );
}
