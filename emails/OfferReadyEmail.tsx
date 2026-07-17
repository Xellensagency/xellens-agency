import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type OfferReadyEmailProps = {
  firstName: string;
  offerNumber: string;
  projectName: string;
  amount: string;
  validUntil: string;
  offerUrl: string;
};

export default function OfferReadyEmail({
  firstName = "Emma",
  offerNumber = "OFF-2026-0487",
  projectName = "Nordic Skin – Ny hemsida",
  amount = "48 500 SEK",
  validUntil = "10 augusti 2026",
  offerUrl = "https://kund.xellensagency.com/offerter",
}: OfferReadyEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`Offert ${offerNumber} är klar för granskning.`}
      eyebrow={`HEJ ${firstName.toUpperCase()}!`}
      title={
        <>
          Din offert
          <br />
          är klar
        </>
      }
      intro="Vi har sammanställt en offert anpassad efter era behov."
      body={
        <>
          Offerten innehåller tjänster, omfattning, pris och
          villkor för <strong>{projectName}</strong>. Den kan
          granskas och accepteras digitalt.
        </>
      }
      illustrationBadge="OFFERT"
      illustrationTitle={offerNumber}
      ctaLabel="Granska offerten"
      ctaUrl={offerUrl}
      details={[
        { label: "Offertnummer", value: offerNumber },
        { label: "Projekt", value: projectName },
        { label: "Belopp", value: amount, tone: "accent" },
        { label: "Giltig till", value: validUntil },
      ]}
      features={[
        {
          icon: "✎",
          title: "Acceptera digitalt",
          text: "Godkänn enkelt och säkert online.",
        },
        {
          icon: "☷",
          title: "Tydligt upplägg",
          text: "Se exakt vad som ingår.",
        },
        {
          icon: "●",
          title: "Snabb återkoppling",
          text: "Kontakta oss direkt vid frågor.",
        },
      ]}
      noticeTitle="Transparent och tydligt"
      noticeText="Offerten innehåller en fullständig kostnadsöversikt."
    />
  );
}
