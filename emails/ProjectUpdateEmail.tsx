import XellensTransactionalEmail from "./components/XellensTransactionalEmail";

export type ProjectUpdateEmailProps = {
  firstName: string;
  projectName: string;
  status: string;
  latestActivity: string;
  nextStep: string;
  deadline: string;
  projectUrl: string;
};

export default function ProjectUpdateEmail({
  firstName = "Emma",
  projectName = "Nordic Skin – Ny hemsida",
  status = "Design pågår",
  latestActivity = "Wireframes för startsidan är klara.",
  nextStep = "Granskning av designförslag.",
  deadline = "10 augusti 2026",
  projectUrl = "https://kund.xellensagency.com/projekt",
}: ProjectUpdateEmailProps) {
  return (
    <XellensTransactionalEmail
      previewText={`Ny uppdatering i projektet ${projectName}.`}
      eyebrow={`HEJ ${firstName.toUpperCase()}!`}
      title={
        <>
          Ny uppdatering
          <br />
          för ditt projekt
        </>
      }
      intro="Här är en kort sammanfattning av vad som har hänt."
      body={
        <>
          Projektet <strong>{projectName}</strong> har
          uppdaterats. Aktuell status är{" "}
          <strong>{status}</strong>.
        </>
      }
      illustrationBadge={status}
      illustrationTitle={projectName}
      ctaLabel="Se projektuppdateringen"
      ctaUrl={projectUrl}
      details={[
        { label: "Projekt", value: projectName },
        { label: "Status", value: status, tone: "accent" },
      ]}
      features={[
        {
          icon: "◷",
          title: "Senaste aktivitet",
          text: latestActivity,
        },
        {
          icon: "⚑",
          title: "Nästa steg",
          text: nextStep,
        },
        {
          icon: "□",
          title: "Deadline",
          text: deadline,
        },
      ]}
      noticeTitle="Följ projektet i realtid"
      noticeText="Tidslinje, filer, möten och kommentarer finns i portalen."
    />
  );
}
