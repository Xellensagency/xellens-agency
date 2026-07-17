import type { ReactNode } from "react";

import XellensTransactionalEmail, {
  type XellensEmailDetail,
  type XellensEmailFeature,
} from "../components/XellensTransactionalEmail";

type AdminEmailShellProps = {
  previewText: string;
  eyebrow: string;
  title: ReactNode;
  intro: string;
  body: ReactNode;
  badge: string;
  illustrationTitle: string;
  ctaLabel: string;
  ctaUrl: string;
  details: XellensEmailDetail[];
  features?: XellensEmailFeature[];
  noticeTitle: string;
  noticeText: ReactNode;
};

function AdminEmailShell({
  previewText,
  eyebrow,
  title,
  intro,
  body,
  badge,
  illustrationTitle,
  ctaLabel,
  ctaUrl,
  details,
  features = [],
  noticeTitle,
  noticeText,
}: AdminEmailShellProps) {
  return (
    <XellensTransactionalEmail
      previewText={previewText}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      greeting="Hej Xellens-teamet!"
      body={body}
      illustrationBadge={badge}
      illustrationTitle={illustrationTitle}
      ctaLabel={ctaLabel}
      ctaUrl={ctaUrl}
      details={details}
      features={features}
      noticeTitle={noticeTitle}
      noticeText={noticeText}
    />
  );
}

export type AdminNewQuoteRequestEmailProps = {
  customerName: string;
  companyName: string;
  customerEmail: string;
  phone: string;
  service: string;
  budget: string;
  requestedDeadline: string;
  requestUrl: string;
};

export function AdminNewQuoteRequestEmail({
  customerName,
  companyName,
  customerEmail,
  phone,
  service,
  budget,
  requestedDeadline,
  requestUrl,
}: AdminNewQuoteRequestEmailProps) {
  return (
    <AdminEmailShell
      previewText={`Ny offertförfrågan från ${companyName}.`}
      eyebrow="NY OFFERTFÖRFRÅGAN"
      title={
        <>
          En ny kund vill
          <br />
          ha en offert
        </>
      }
      intro="En ny offertförfrågan har kommit in och väntar på att behandlas."
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> har skickat en
          offertförfrågan gällande <strong>{service}</strong>.
        </>
      }
      badge="NY FÖRFRÅGAN"
      illustrationTitle={companyName}
      ctaLabel="Öppna förfrågan"
      ctaUrl={requestUrl}
      details={[
        { label: "Kund", value: customerName },
        { label: "Företag", value: companyName },
        { label: "E-post", value: customerEmail },
        { label: "Telefon", value: phone },
      ]}
      features={[
        {
          icon: "▣",
          title: "Önskad tjänst",
          text: service,
        },
        {
          icon: "◉",
          title: "Angiven budget",
          text: budget,
        },
        {
          icon: "□",
          title: "Önskad deadline",
          text: requestedDeadline,
        },
      ]}
      noticeTitle="Förfrågan väntar på åtgärd"
      noticeText="Öppna förfrågan i adminpanelen och tilldela den till rätt person."
    />
  );
}

export type AdminOfferDecisionEmailProps = {
  customerName: string;
  companyName: string;
  offerNumber: string;
  amount: string;
  decision: "Accepterad" | "Avböjd";
  customerComment: string;
  offerUrl: string;
};

export function AdminOfferDecisionEmail({
  customerName,
  companyName,
  offerNumber,
  amount,
  decision,
  customerComment,
  offerUrl,
}: AdminOfferDecisionEmailProps) {
  const accepted = decision === "Accepterad";

  return (
    <AdminEmailShell
      previewText={`Offert ${offerNumber} har blivit ${decision.toLowerCase()}.`}
      eyebrow="OFFERTSVAR"
      title={
        <>
          Kunden har svarat
          <br />
          på offerten
        </>
      }
      intro={`Offert ${offerNumber} har blivit ${decision.toLowerCase()}.`}
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> har svarat på offerten.
          <br />
          <br />
          Kundens kommentar: “{customerComment}”
        </>
      }
      badge={decision.toUpperCase()}
      illustrationTitle={offerNumber}
      ctaLabel="Visa offerten"
      ctaUrl={offerUrl}
      details={[
        { label: "Offertnummer", value: offerNumber },
        { label: "Kund", value: companyName },
        { label: "Belopp", value: amount, tone: "accent" },
        {
          label: "Besked",
          value: decision,
          tone: accepted ? "accent" : "danger",
        },
      ]}
      noticeTitle={
        accepted
          ? "Offerten kan nu omvandlas till projekt"
          : "Kontrollera kundens kommentar"
      }
      noticeText={
        accepted
          ? "Nästa steg är att skapa projekt, avtal och planering."
          : "Kontakta kunden vid behov och uppdatera offertens status."
      }
    />
  );
}

export type AdminNewSupportCaseEmailProps = {
  customerName: string;
  companyName: string;
  caseNumber: string;
  category: string;
  priority: string;
  message: string;
  supportUrl: string;
};

export function AdminNewSupportCaseEmail({
  customerName,
  companyName,
  caseNumber,
  category,
  priority,
  message,
  supportUrl,
}: AdminNewSupportCaseEmailProps) {
  return (
    <AdminEmailShell
      previewText={`Nytt supportärende ${caseNumber} från ${companyName}.`}
      eyebrow="NYTT SUPPORTÄRENDE"
      title={
        <>
          En kund behöver
          <br />
          hjälp
        </>
      }
      intro="Ett nytt supportärende har kommit in till Xellens."
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> har skickat följande:
          <br />
          <br />
          “{message}”
        </>
      }
      badge={priority.toUpperCase()}
      illustrationTitle={caseNumber}
      ctaLabel="Öppna supportärendet"
      ctaUrl={supportUrl}
      details={[
        { label: "Ärendenummer", value: caseNumber },
        { label: "Kund", value: companyName },
        { label: "Kategori", value: category },
        { label: "Prioritet", value: priority, tone: "warning" },
      ]}
      features={[
        {
          icon: "◷",
          title: "Kontrollera ärendet",
          text: "Läs kundens meddelande och tidigare historik.",
        },
        {
          icon: "●",
          title: "Svara kunden",
          text: "Skicka ett tydligt svar från supportpanelen.",
        },
        {
          icon: "✓",
          title: "Uppdatera status",
          text: "Markera ärendet som pågående eller löst.",
        },
      ]}
      noticeTitle="Skickas till supportteamet"
      noticeText="Den här typen av notis skickas till support@xellensagency.com."
    />
  );
}

export type AdminNewCustomerMessageEmailProps = {
  customerName: string;
  companyName: string;
  projectName: string;
  message: string;
  sentAt: string;
  messageUrl: string;
};

export function AdminNewCustomerMessageEmail({
  customerName,
  companyName,
  projectName,
  message,
  sentAt,
  messageUrl,
}: AdminNewCustomerMessageEmailProps) {
  return (
    <AdminEmailShell
      previewText={`${customerName} har skickat ett nytt meddelande.`}
      eyebrow="NYTT KUNDMEDDELANDE"
      title={
        <>
          Ett nytt meddelande
          <br />
          väntar på svar
        </>
      }
      intro="En kund har skickat ett nytt meddelande via kundportalen."
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> skrev:
          <br />
          <br />
          “{message}”
        </>
      }
      badge="NYTT MEDDELANDE"
      illustrationTitle={projectName}
      ctaLabel="Läs och svara"
      ctaUrl={messageUrl}
      details={[
        { label: "Kund", value: customerName },
        { label: "Företag", value: companyName },
        { label: "Projekt", value: projectName },
        { label: "Skickat", value: sentAt },
      ]}
      noticeTitle="Meddelandet väntar på svar"
      noticeText="Öppna konversationen i adminpanelen för att svara kunden."
    />
  );
}

export type AdminReviewFeedbackEmailProps = {
  customerName: string;
  companyName: string;
  projectName: string;
  materialName: string;
  response: "Godkänt" | "Ändringar begärda";
  comment: string;
  feedbackUrl: string;
};

export function AdminReviewFeedbackEmail({
  customerName,
  companyName,
  projectName,
  materialName,
  response,
  comment,
  feedbackUrl,
}: AdminReviewFeedbackEmailProps) {
  const approved = response === "Godkänt";

  return (
    <AdminEmailShell
      previewText={`${companyName} har lämnat feedback på ${materialName}.`}
      eyebrow="NY GRANSKNINGSFEEDBACK"
      title={
        <>
          Kunden har lämnat
          <br />
          sin återkoppling
        </>
      }
      intro="Nytt granskningssvar finns tillgängligt i projektet."
      body={
        <>
          <strong>{customerName}</strong> har svarat på{" "}
          <strong>{materialName}</strong>.
          <br />
          <br />
          Kommentar: “{comment}”
        </>
      }
      badge={response.toUpperCase()}
      illustrationTitle={materialName}
      ctaLabel="Öppna feedbacken"
      ctaUrl={feedbackUrl}
      details={[
        { label: "Kund", value: companyName },
        { label: "Projekt", value: projectName },
        { label: "Material", value: materialName },
        {
          label: "Svar",
          value: response,
          tone: approved ? "accent" : "warning",
        },
      ]}
      noticeTitle={
        approved
          ? "Materialet är godkänt"
          : "Kunden har begärt ändringar"
      }
      noticeText={
        approved
          ? "Projektet kan fortsätta till nästa steg."
          : "Läs kommentarerna och skapa nästa korrigeringsrunda."
      }
    />
  );
}

export type AdminFileUploadedEmailProps = {
  customerName: string;
  companyName: string;
  projectName: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileUrl: string;
};

export function AdminFileUploadedEmail({
  customerName,
  companyName,
  projectName,
  fileName,
  fileSize,
  uploadedAt,
  fileUrl,
}: AdminFileUploadedEmailProps) {
  return (
    <AdminEmailShell
      previewText={`${companyName} har laddat upp filen ${fileName}.`}
      eyebrow="NY FIL UPPLADDAD"
      title={
        <>
          Kunden har laddat
          <br />
          upp en ny fil
        </>
      }
      intro="En ny kundfil finns tillgänglig i projektets filarkiv."
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> har laddat upp filen{" "}
          <strong>{fileName}</strong>.
        </>
      }
      badge="NY FIL"
      illustrationTitle={fileName}
      ctaLabel="Visa filen"
      ctaUrl={fileUrl}
      details={[
        { label: "Projekt", value: projectName },
        { label: "Filnamn", value: fileName },
        { label: "Filstorlek", value: fileSize },
        { label: "Uppladdad", value: uploadedAt },
      ]}
      noticeTitle="Kontrollera den uppladdade filen"
      noticeText="Filen är kopplad till kundens projekt och sparad i filhistoriken."
    />
  );
}

export type AdminInvoiceStatusEmailProps = {
  customerName: string;
  companyName: string;
  invoiceNumber: string;
  amount: string;
  status: "Betald" | "Förfallen";
  statusDate: string;
  invoiceUrl: string;
};

export function AdminInvoiceStatusEmail({
  customerName,
  companyName,
  invoiceNumber,
  amount,
  status,
  statusDate,
  invoiceUrl,
}: AdminInvoiceStatusEmailProps) {
  const paid = status === "Betald";

  return (
    <AdminEmailShell
      previewText={`Faktura ${invoiceNumber} är ${status.toLowerCase()}.`}
      eyebrow="FAKTURASTATUS"
      title={
        <>
          Fakturans status
          <br />
          har ändrats
        </>
      }
      intro={`Faktura ${invoiceNumber} är nu markerad som ${status.toLowerCase()}.`}
      body={
        <>
          Fakturan gäller <strong>{companyName}</strong> och har
          ett totalt belopp på <strong>{amount}</strong>.
        </>
      }
      badge={status.toUpperCase()}
      illustrationTitle={invoiceNumber}
      ctaLabel="Öppna fakturan"
      ctaUrl={invoiceUrl}
      details={[
        { label: "Fakturanummer", value: invoiceNumber },
        { label: "Kund", value: companyName },
        { label: "Belopp", value: amount, tone: "accent" },
        {
          label: "Status",
          value: status,
          tone: paid ? "accent" : "danger",
        },
      ]}
      noticeTitle={
        paid
          ? "Betalningen är registrerad"
          : "Fakturan behöver följas upp"
      }
      noticeText={
        paid
          ? `Betalningen registrerades ${statusDate}.`
          : `Fakturan förföll ${statusDate}. Kontrollera om en påminnelse ska skickas.`
      }
    />
  );
}

export type AdminMeetingChangedEmailProps = {
  customerName: string;
  companyName: string;
  meetingTitle: string;
  changeType: "Bokat" | "Ombokat" | "Avbokat";
  meetingDate: string;
  meetingTime: string;
  meetingUrl: string;
};

export function AdminMeetingChangedEmail({
  customerName,
  companyName,
  meetingTitle,
  changeType,
  meetingDate,
  meetingTime,
  meetingUrl,
}: AdminMeetingChangedEmailProps) {
  return (
    <AdminEmailShell
      previewText={`${meetingTitle} har blivit ${changeType.toLowerCase()}.`}
      eyebrow="MÖTESUPPDATERING"
      title={
        <>
          Ett kundmöte har
          <br />
          uppdaterats
        </>
      }
      intro={`Mötet har blivit ${changeType.toLowerCase()} via kundportalen.`}
      body={
        <>
          <strong>{customerName}</strong> från{" "}
          <strong>{companyName}</strong> har uppdaterat mötet{" "}
          <strong>{meetingTitle}</strong>.
        </>
      }
      badge={changeType.toUpperCase()}
      illustrationTitle={meetingTitle}
      ctaLabel="Öppna kalendern"
      ctaUrl={meetingUrl}
      details={[
        { label: "Kund", value: companyName },
        { label: "Ändring", value: changeType },
        { label: "Datum", value: meetingDate },
        { label: "Tid", value: meetingTime },
      ]}
      noticeTitle="Kalendern har uppdaterats"
      noticeText="Kontrollera mötet och deltagarna i adminpanelens kalender."
    />
  );
}
