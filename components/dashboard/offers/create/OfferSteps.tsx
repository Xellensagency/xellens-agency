"use client";

import {
  Check,
} from "lucide-react";

import styles from "./CreateOfferWizard.module.css";

type OfferStepsProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
};

const steps = [
  {
    id: 1,
    title: "Information",
    subtitle: "Kund & projekt",
  },
  {
    id: 2,
    title: "Tjänster",
    subtitle: "Välj tjänster",
  },
  {
    id: 3,
    title: "Tillägg",
    subtitle: "Extra funktioner",
  },
  {
    id: 4,
    title: "Förhandsvisning",
    subtitle: "Granska & skicka",
  },
];

export default function OfferSteps({
  activeStep,
  onStepChange,
}: OfferStepsProps) {
  return (
    <div className={styles.steps}>
      {steps.map((step, index) => {
        const isActive =
          step.id === activeStep;

        const isCompleted =
          step.id < activeStep;

        return (
          <div
            key={step.id}
            className={styles.stepWrapper}
          >
            <button
              type="button"
              className={[
                styles.step,
                isActive
                  ? styles.stepActive
                  : "",
                isCompleted
                  ? styles.stepCompleted
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                onStepChange(step.id)
              }
            >
              <span
                className={
                  styles.stepNumber
                }
              >
                {isCompleted ? (
                  <Check size={17} />
                ) : (
                  step.id
                )}
              </span>

              <span
                className={
                  styles.stepText
                }
              >
                <strong>{step.title}</strong>
                <small>{step.subtitle}</small>
              </span>
            </button>

            {index < steps.length - 1 && (
              <span
                className={
                  styles.stepLine
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
