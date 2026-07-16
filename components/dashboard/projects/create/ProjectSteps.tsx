import styles from "./CreateProjectWizard.module.css";

type ProjectStepsProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
};

const steps = [
  {
    number: 1,
    title: "Grundinfo",
    description: "Projektets bas",
  },
  {
    number: 2,
    title: "Tjänster & paket",
    description: "Vad behövs",
  },
  {
    number: 3,
    title: "Tidsplan",
    description: "När och hur",
  },
  {
    number: 4,
    title: "Team & roller",
    description: "Vem gör vad",
  },
  {
    number: 5,
    title: "Bekräfta",
    description: "Klart att skapa",
  },
];

export default function ProjectSteps({
  activeStep,
  onStepChange,
}: ProjectStepsProps) {
  return (
    <nav
      className={styles.steps}
      aria-label="Steg för att skapa projekt"
    >
      {steps.map((step) => (
        <button
          type="button"
          key={step.number}
          className={`${styles.step} ${
            activeStep === step.number
              ? styles.activeStep
              : ""
          } ${
            activeStep > step.number
              ? styles.completedStep
              : ""
          }`}
          onClick={() =>
            onStepChange(step.number)
          }
        >
          <span className={styles.stepNumber}>
            {activeStep > step.number
              ? "✓"
              : step.number}
          </span>

          <span className={styles.stepText}>
            <strong>{step.title}</strong>
            <small>{step.description}</small>
          </span>
        </button>
      ))}
    </nav>
  );
}
