"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Save,
} from "lucide-react";

import type {
  CreateProjectOptions,
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "@/lib/dashboard/projects/create-project-types";

import { createProjectAction } from "@/app/dashboard/projekt/nytt/actions";

import ProjectSteps from "./ProjectSteps";
import ProjectBasicInfo from "./ProjectBasicInfo";
import ProjectServices from "./ProjectServices";
import ProjectSchedule from "./ProjectSchedule";
import ProjectTeam from "./ProjectTeam";
import ProjectPreview from "./ProjectPreview";
import ProjectConfirmation from "./ProjectConfirmation";

import styles from "./CreateProjectWizard.module.css";

type CreateProjectWizardProps = {
  options: CreateProjectOptions;
};

const initialDraft: ProjectDraft = {
  title: "",
  customerId: "",
  contactId: "",
  categoryIds: [],
  description: "",
  startDate: "",
  endDate: "",
  budgetExVat: "",
  priority: "normal",
  status: "planning",
  customerVisibility: "hidden",
};

export default function CreateProjectWizard({
  options,
}: CreateProjectWizardProps) {
  const router = useRouter();

  const [activeStep, setActiveStep] =
    useState(1);

  const [draft, setDraft] =
    useState<ProjectDraft>(initialDraft);

  const [
    selectedServices,
    setSelectedServices,
  ] = useState<ProjectServiceDraft[]>([]);

  const [
    milestones,
    setMilestones,
  ] = useState<ProjectMilestoneDraft[]>([]);

  const [ownerId, setOwnerId] =
    useState<string>(() => {
      const superAdmin =
        options.team_members.find(
          (member) =>
            member.role === "super_admin"
        );

      return (
        superAdmin?.id ??
        options.team_members[0]?.id ??
        ""
      );
    });

  const [
    teamMembers,
    setTeamMembers,
  ] = useState<ProjectTeamMemberDraft[]>(
    []
  );

  const [
    serviceAssignments,
    setServiceAssignments,
  ] =
    useState<ProjectServiceAssignments>(
      {}
    );

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  function updateDraft<
    K extends keyof ProjectDraft
  >(
    field: K,
    value: ProjectDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitError("");
  }

  function changeStep(step: number) {
    const safeStep = Math.min(
      Math.max(step, 1),
      5
    );

    setActiveStep(safeStep);
    setSubmitError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const canCreateProject = Boolean(
    draft.title.trim() &&
      draft.customerId &&
      draft.categoryIds.length > 0 &&
      draft.description.trim() &&
      ownerId &&
      !(
        draft.startDate &&
        draft.endDate &&
        draft.endDate < draft.startDate
      )
  );

  async function handleCreateProject() {
    if (!canCreateProject || isCreating) {
      setSubmitError(
        "Kontrollera de obligatoriska uppgifterna innan projektet skapas."
      );

      return;
    }

    setIsCreating(true);
    setSubmitError("");

    const result =
      await createProjectAction({
        draft,
        services: selectedServices,
        milestones,
        ownerId,
        teamMembers,
        serviceAssignments,
      });

    if (!result.ok) {
      setSubmitError(result.error);
      setIsCreating(false);
      return;
    }

    router.push(
      "/dashboard/projekt?created=1"
    );

    router.refresh();
  }

  return (
    <div className={styles.page}>
      <ProjectSteps
        activeStep={activeStep}
        onStepChange={changeStep}
      />

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          {activeStep === 1 && (
            <ProjectBasicInfo
              options={options}
              draft={draft}
              onChange={updateDraft}
            />
          )}

          {activeStep === 2 && (
            <ProjectServices
              options={options}
              services={selectedServices}
              onChange={
                setSelectedServices
              }
            />
          )}

          {activeStep === 3 && (
            <ProjectSchedule
              options={options}
              draft={draft}
              milestones={milestones}
              onDraftChange={updateDraft}
              onChange={setMilestones}
            />
          )}

          {activeStep === 4 && (
            <ProjectTeam
              options={options}
              ownerId={ownerId}
              teamMembers={teamMembers}
              services={selectedServices}
              serviceAssignments={
                serviceAssignments
              }
              onOwnerChange={setOwnerId}
              onTeamChange={setTeamMembers}
              onServiceAssignmentsChange={
                setServiceAssignments
              }
            />
          )}

          {activeStep === 5 && (
            <ProjectConfirmation
              options={options}
              draft={draft}
              services={selectedServices}
              milestones={milestones}
              ownerId={ownerId}
              teamMembers={teamMembers}
              serviceAssignments={
                serviceAssignments
              }
              onEditStep={changeStep}
            />
          )}

          {submitError && (
            <div
              className={
                styles.submitError
              }
              role="alert"
            >
              {submitError}
            </div>
          )}

          <footer className={styles.actions}>
            {activeStep === 1 ? (
              <Link
                href="/dashboard/projekt"
                className={
                  styles.cancelButton
                }
              >
                Avbryt
              </Link>
            ) : (
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  changeStep(
                    activeStep - 1
                  )
                }
                disabled={isCreating}
              >
                <ArrowLeft
                  size={17}
                  strokeWidth={1.8}
                />

                Föregående
              </button>
            )}

            <button
              type="button"
              className={styles.saveButton}
              disabled={isCreating}
            >
              <Save
                size={17}
                strokeWidth={1.8}
              />

              Spara utkast
            </button>

            {activeStep < 5 ? (
              <button
                type="button"
                className={
                  styles.nextButton
                }
                onClick={() =>
                  changeStep(
                    activeStep + 1
                  )
                }
              >
                Nästa steg

                <ArrowRight
                  size={18}
                  strokeWidth={1.8}
                />
              </button>
            ) : (
              <button
                type="button"
                className={
                  styles.nextButton
                }
                onClick={
                  handleCreateProject
                }
                disabled={
                  isCreating ||
                  !canCreateProject
                }
              >
                {isCreating ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className={
                        styles.spinner
                      }
                    />

                    Skapar projekt...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={18}
                      strokeWidth={1.8}
                    />

                    Skapa projekt
                  </>
                )}
              </button>
            )}
          </footer>
        </div>

        <ProjectPreview
          options={options}
          draft={draft}
          services={selectedServices}
          milestones={milestones}
          ownerId={ownerId}
          teamMembers={teamMembers}
          serviceAssignments={
            serviceAssignments
          }
        />
      </div>
    </div>
  );
}

