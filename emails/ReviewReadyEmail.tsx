import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type ReviewReadyEmailProps = {
  firstName: string;
  projectName: string;
  materialName: string;
  deadline: string;
  reviewUrl: string;
};

export default function ReviewReadyEmail({
  firstName = "Emma",
  projectName = "Nordic Skin – Ny hemsida",
  materialName = "Designförslag #2",
  deadline = "23 juli 2026",
  reviewUrl = "https://kund.xellensagency.com/design-feedback",
}: ReviewReadyEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`${materialName} är klart för din granskning.`}
      eyebrow={`HEJ ${firstName.toUpperCase()}!`}
      title={
        <>
          Klart för
          <br />
          granskning
        </>
      }
      intro="Ett nytt material är redo för din återkoppling."
      body={
        <>
          Vi har publicerat <strong>{materialName}</strong> i
          projektet <strong>{projectName}</strong>. Du kan
          godkänna, begära ändringar eller lämna kommentarer.
        </>
      }
      illustrationBadge="VÄNTAR PÅ FEEDBACK"
      illustrationTitle={materialName}
      ctaLabel="Öppna granskningen"
      ctaUrl={reviewUrl}
      details={[
        { label: "Projekt", value: projectName },
        { label: "Material", value: materialName },
        {
          label: "Sista dag",
          value: deadline,
          tone: "warning",
        },
      ]}
      features={[
        {
          icon: "◉",
          title: "Granska",
          text: "Bedöm materialet utifrån projektmålen.",
        },
        {
          icon: "☷",
          title: "Lämna svar",
          text: "Godkänn eller begär tydliga ändringar.",
        },
        {
          icon: "✓",
          title: "Snabbare framåt",
          text: "Tydlig feedback hjälper tidsplanen.",
        },
      ]}
      noticeTitle="Din återkoppling sparas"
      noticeText="Vårt team får en notis direkt när du har svarat."
    />
  );
}
