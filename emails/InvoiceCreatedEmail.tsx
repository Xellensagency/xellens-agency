import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type InvoiceCreatedEmailProps = {
  firstName: string;
  invoiceNumber: string;
  description: string;
  amount: string;
  dueDate: string;
  invoiceUrl: string;
};

export default function InvoiceCreatedEmail({
  firstName = "Emma",
  invoiceNumber = "FAK-2026-0587",
  description = "Webbdesign och utveckling",
  amount = "25 000 SEK",
  dueDate = "15 augusti 2026",
  invoiceUrl = "https://kund.xellensagency.com/fakturor",
}: InvoiceCreatedEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`Ny faktura ${invoiceNumber} från Xellens Agency.`}
      eyebrow={`HEJ ${firstName.toUpperCase()}!`}
      title={
        <>
          Ny faktura från
          <br />
          Xellens Agency
        </>
      }
      intro="Din faktura är nu klar och tillgänglig."
      body={
        <>
          I kundportalen kan du öppna fakturan, ladda ner PDF
          och se fullständig betalningsinformation.
        </>
      }
      illustrationBadge="FAKTURA"
      illustrationTitle={invoiceNumber}
      ctaLabel="Visa fakturan"
      ctaUrl={invoiceUrl}
      details={[
        { label: "Fakturanummer", value: invoiceNumber },
        { label: "Avser", value: description },
        { label: "Belopp", value: amount, tone: "accent" },
        {
          label: "Förfallodatum",
          value: dueDate,
          tone: "warning",
        },
      ]}
      features={[
        {
          icon: "⇩",
          title: "Ladda ner PDF",
          text: "Hämta och spara fakturan.",
        },
        {
          icon: "▰",
          title: "Betalningsuppgifter",
          text: "Se OCR, Bankgiro och instruktioner.",
        },
        {
          icon: "●",
          title: "Frågor?",
          text: "Kontakta oss direkt i portalen.",
        },
      ]}
      noticeTitle="Säker och tillgänglig"
      noticeText="Fakturan och betalningsstatusen sparas i portalen."
    />
  );
}
