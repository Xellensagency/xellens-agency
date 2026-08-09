"use client";

import {
  Check,
  CircleDollarSign,
  FileCheck2,
  Layers3,
  UserRound,
} from "lucide-react";

import styles from "./CreateOfferWizard.module.css";


type OfferStepsProps = {
  activeStep: number;
  onStepChange: (
    step: number
  ) => void;
};


const steps = [
  {
    id: 1,
    title: "Kund & uppdrag",
    subtitle:
      "Grundinformation",
    icon: UserRound,
  },
  {
    id: 2,
    title: "Tjänster",
    subtitle:
      "Omfattning & paket",
    icon: Layers3,
  },
  {
    id: 3,
    title: "Pris & villkor",
    subtitle:
      "Tillägg & rabatt",
    icon: CircleDollarSign,
  },
  {
    id: 4,
    title: "Granska",
    subtitle:
      "Förhandsvisa & skicka",
    icon: FileCheck2,
  },
];


export default function OfferSteps({
  activeStep,
  onStepChange,
}: OfferStepsProps) {
  return (
    <nav
      className={
        styles.steps
      }
      aria-label="Offertsteg"
    >
      {steps.map(
        (
          step,
          index
        ) => {
          const Icon =
            step.icon;

          const active =
            step.id ===
            activeStep;

          const completed =
            step.id <
            activeStep;

          return (
            <div
              key={
                step.id
              }
              className={
                styles.stepWrapper
              }
            >
              <button
                type="button"
                className={[
                  styles.step,
                  active
                    ? styles.stepActive
                    : "",
                  completed
                    ? styles.stepCompleted
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onStepChange(
                    step.id
                  )
                }
              >
                <span
                  className={
                    styles.stepNumber
                  }
                >
                  {completed ? (
                    <Check
                      size={16}
                    />
                  ) : (
                    <Icon
                      size={16}
                    />
                  )}
                </span>

                <span
                  className={
                    styles.stepText
                  }
                >
                  <small>
                    STEG {step.id}
                  </small>

                  <strong>
                    {step.title}
                  </strong>

                  <em>
                    {
                      step.subtitle
                    }
                  </em>
                </span>
              </button>

              {index <
                steps.length -
                  1 && (
                <span
                  className={
                    styles.stepLine
                  }
                />
              )}
            </div>
          );
        }
      )}
    </nav>
  );
}