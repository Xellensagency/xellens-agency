import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type NewMessageEmailProps = {
  firstName: string;
  projectName: string;
  senderName: string;
  message: string;
  sentAt: string;
  messageUrl: string;
};

export default function NewMessageEmail({
  firstName = "Emma",
  projectName = "Nordic Skin – Ny hemsida",
  senderName = "Andreas Ekelöf",
  message = "Hej! Här kommer den senaste uppdateringen.",
  sentAt = "Idag kl. 10:24",
  messageUrl = "https://kund.xellensagency.com/meddelanden",
}: NewMessageEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`${senderName} har skickat ett nytt meddelande.`}
      eyebrow="NOTIS / NYTT MEDDELANDE"
      title={
        <>
          Du har fått ett
          <br />
          nytt meddelande
        </>
      }
      intro="Logga in för att läsa hela meddelandet och svara."
      greeting={`Hej ${firstName}!`}
      body={
        <>
          <strong>{senderName}</strong> har skickat ett meddelande
          i projektet <strong>{projectName}</strong>.
          <br />
          <br />
          “{message}”
        </>
      }
      illustrationBadge={sentAt}
      illustrationTitle={projectName}
      ctaLabel="Läs och svara"
      ctaUrl={messageUrl}
      details={[
        { label: "Projekt", value: projectName },
        { label: "Från", value: senderName },
        { label: "Skickat", value: sentAt },
      ]}
      features={[
        {
          icon: "◔",
          title: "Snabb översikt",
          text: "Se olästa meddelanden och uppgifter.",
        },
        {
          icon: "↗",
          title: "Senaste aktivitet",
          text: "Följ kommentarer och ändringar.",
        },
        {
          icon: "●",
          title: "Svara direkt",
          text: "All kommunikation finns samlad.",
        },
      ]}
      noticeTitle="Notiser som passar dig"
      noticeText="Notisinställningar kan ändras i kundportalen."
    />
  );
}
