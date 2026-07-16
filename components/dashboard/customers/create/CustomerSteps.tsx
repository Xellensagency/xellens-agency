"use client";

import type {
  CustomerWizardStep,
} from "@/lib/dashboard/customers/create-customer-types";

import styles from "./CreateCustomerWizard.module.css";

type CustomerStepsProps = {
  steps: CustomerWizardStep[];
  activeStep: number;
  onStepChange: (step: number) => void;
};

export default function CustomerSteps({
  steps,
  activeStep,
  onStepChange,
}: CustomerStepsProps) {
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
                {step.id}
              </span>

              <span
                className={
                  styles.stepContent
                }
              >
                <strong>
                  {step.title}
                </strong>

                <small>
                  {step.subtitle}
                </small>
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
