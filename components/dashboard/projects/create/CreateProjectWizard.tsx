"use client";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudCheck,
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

import {
  createProjectAction,
} from "@/app/dashboard/projekt/nytt/actions";

import {
  deleteProjectDraftAction,
  loadProjectDraftAction,
  saveProjectDraftAction,
} from "@/app/dashboard/projekt/nytt/draft-actions";

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

type StoredProjectDraft = {
  activeStep: number;
  draft: ProjectDraft;
  services: ProjectServiceDraft[];
  milestones: ProjectMilestoneDraft[];
  ownerId: string;
  teamMembers: ProjectTeamMemberDraft[];
  serviceAssignments: ProjectServiceAssignments;
};

const STORAGE_KEY =
  "vorix-create-project-draft-v1";

const AUTOSAVE_KEY =
  "vorix-create-project-draft-v1";

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

const timeFormatter =
  new Intl.DateTimeFormat(
    "sv-SE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

export default function CreateProjectWizard({
  options,
}: CreateProjectWizardProps) {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const defaultOwnerId =
    options.team_members.find(
      (member) =>
        member.role === "super_admin"
    )?.id ??
    options.team_members[0]?.id ??
    "";

  const [activeStep, setActiveStep] =
    useState(1);

  const [draft, setDraft] =
    useState<ProjectDraft>(
      initialDraft
    );

  const [
    selectedServices,
    setSelectedServices,
  ] =
    useState<ProjectServiceDraft[]>(
      []
    );

  const [
    milestones,
    setMilestones,
  ] =
    useState<ProjectMilestoneDraft[]>(
      []
    );

  const [ownerId, setOwnerId] =
    useState<string>(
      defaultOwnerId
    );

  const [
    teamMembers,
    setTeamMembers,
  ] =
    useState<
      ProjectTeamMemberDraft[]
    >([]);

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
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  const [
    stepError,
    setStepError,
  ] =
    useState("");

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);

  const [
    draftSavedAt,
    setDraftSavedAt,
  ] =
    useState("");

  const [
    serverDraftId,
    setServerDraftId,
  ] =
    useState<string | null>(
      null
    );

  const [
    savingDraft,
    setSavingDraft,
  ] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        return;
      }

      const saved =
        JSON.parse(
          stored
        ) as Partial<StoredProjectDraft>;

      if (saved.draft) {
        setDraft({
          ...initialDraft,
          ...saved.draft,
          categoryIds:
            saved.draft.categoryIds ??
            [],
        });
      }

      if (
        Array.isArray(
          saved.services
        )
      ) {
        setSelectedServices(
          saved.services
        );
      }

      if (
        Array.isArray(
          saved.milestones
        )
      ) {
        setMilestones(
          saved.milestones
        );
      }

      if (
        saved.ownerId &&
        options.team_members.some(
          (member) =>
            member.id ===
            saved.ownerId
        )
      ) {
        setOwnerId(
          saved.ownerId
        );
      }

      if (
        Array.isArray(
          saved.teamMembers
        )
      ) {
        setTeamMembers(
          saved.teamMembers
        );
      }

      if (
        saved.serviceAssignments
      ) {
        setServiceAssignments(
          saved.serviceAssignments
        );
      }

      if (
        saved.activeStep &&
        saved.activeStep >= 1 &&
        saved.activeStep <= 5
      ) {
        setActiveStep(
          saved.activeStep
        );
      }
    } catch {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } finally {
      setHydrated(true);
    }
  }, [
    options.team_members,
  ]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const payload:
            StoredProjectDraft = {
              activeStep,
              draft,
              services:
                selectedServices,
              milestones,
              ownerId,
              teamMembers,
              serviceAssignments,
            };

          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(
                payload
              )
            );

            setDraftSavedAt(
              timeFormatter.format(
                new Date()
              )
            );
          } catch {
            // Projektet kan fortfarande
            // skapas även om lokal lagring
            // inte är tillgänglig.
          }
        },
        700
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    hydrated,
    activeStep,
    draft,
    selectedServices,
    milestones,
    ownerId,
    teamMembers,
    serviceAssignments,
  ]);

  /* VORIX SERVER DRAFT LOAD */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const draftId =
      searchParams.get(
        "draft"
      );

    if (
      !draftId ||
      draftId ===
        serverDraftId
    ) {
      return;
    }

    const safeDraftId =
      draftId;

    let cancelled =
      false;


    async function loadServerDraft() {
      setSubmitError("");

      const result =
        await loadProjectDraftAction(
          safeDraftId
        );


      if (cancelled) {
        return;
      }


      if (!result.ok) {
        setSubmitError(
          result.error
        );

        return;
      }


      const saved =
        result.draft;

      const payload =
        saved.payload;


      setServerDraftId(
        saved.id
      );


      setActiveStep(
        Math.min(
          5,
          Math.max(
            1,
            Number(
              payload.activeStep ??
              saved.current_step ??
              1
            )
          )
        )
      );


      setDraft({
        ...initialDraft,

        ...payload.draft,

        categoryIds:
          Array.isArray(
            payload.draft
              ?.categoryIds
          )
            ? payload.draft
                .categoryIds
            : [],
      });


      setSelectedServices(
        Array.isArray(
          payload.services
        )
          ? payload.services
          : []
      );


      setMilestones(
        Array.isArray(
          payload.milestones
        )
          ? payload.milestones
          : []
      );


      if (
        payload.ownerId &&
        options.team_members.some(
          (member) =>
            member.id ===
            payload.ownerId
        )
      ) {
        setOwnerId(
          payload.ownerId
        );
      }


      setTeamMembers(
        Array.isArray(
          payload.teamMembers
        )
          ? payload.teamMembers
          : []
      );


      setServiceAssignments(
        payload.serviceAssignments &&
        typeof payload.serviceAssignments ===
          "object"
          ? payload.serviceAssignments
          : {}
      );


      setDraftSavedAt(
        new Intl.DateTimeFormat(
          "sv-SE",
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        ).format(
          new Date(
            saved.updated_at
          )
        )
      );
    }


    void loadServerDraft();


    return () => {
      cancelled =
        true;
    };
  }, [
    hydrated,
    searchParams,
    serverDraftId,
    options.team_members,
  ]);

  function updateDraft<
    K extends keyof ProjectDraft
  >(
    field: K,
    value: ProjectDraft[K]
  ) {
    setDraft(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setStepError("");
    setSubmitError("");
  }

  function validateStep(
    step: number
  ) {
    if (step === 1) {
      if (!draft.title.trim()) {
        return "Ange ett projektnamn.";
      }

      if (!draft.customerId) {
        return "Välj vilken kund projektet tillhör.";
      }

      if (
        draft.categoryIds.length ===
        0
      ) {
        return "Välj minst en projektkategori.";
      }

      if (
        !draft.description.trim()
      ) {
        return "Lägg till en projektbeskrivning.";
      }
    }

    if (step === 3) {
      if (
        draft.startDate &&
        draft.endDate &&
        draft.endDate <
          draft.startDate
      ) {
        return "Slutdatum kan inte ligga före startdatum.";
      }
    }

    if (step === 4) {
      if (!ownerId) {
        return "Välj en projektledare innan du fortsätter.";
      }
    }

    return "";
  }

  function changeStep(
    step: number
  ) {
    const safeStep =
      Math.min(
        Math.max(
          step,
          1
        ),
        5
      );

    if (
      safeStep >
      activeStep
    ) {
      for (
        let checkStep = 1;
        checkStep <
        safeStep;
        checkStep += 1
      ) {
        const error =
          validateStep(
            checkStep
          );

        if (error) {
          setStepError(
            error
          );

          setActiveStep(
            checkStep
          );

          return;
        }
      }
    }

    setActiveStep(
      safeStep
    );

    setStepError("");
    setSubmitError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleNext() {
    const error =
      validateStep(
        activeStep
      );

    if (error) {
      setStepError(error);
      return;
    }

    changeStep(
      activeStep + 1
    );
  }

  async function handleSaveDraft() {
    if (savingDraft) {
      return;
    }

    setSavingDraft(true);
    setSubmitError("");

    const customerName =
      options.customers.find(
        (customer) =>
          customer.id ===
          draft.customerId
      )?.name ?? null;

    const result =
      await saveProjectDraftAction({
        title:
          draft.title.trim() ||
          "Nytt projekt",

        currentStep:
          activeStep,
        draftId:
          serverDraftId,

        customerName,

        payload: {
          activeStep,

          draft,

          services:
            selectedServices,

          milestones,

          ownerId,

          teamMembers,

          serviceAssignments,
        },
      });

    if (!result.ok) {
      setSubmitError(
        result.error
      );

      setSavingDraft(false);

      return;
    }

    setServerDraftId(
      result.draftId
    );

    setDraftSavedAt(
      timeFormatter.format(
        new Date(
          result.updatedAt
        )
      )
    );

    router.replace(
      `/dashboard/projekt/nytt?draft=${result.draftId}`,
      {
        scroll: false,
      }
    );

    setSavingDraft(false);
  }

  const canCreateProject =
    !validateStep(1) &&
    !validateStep(3) &&
    !validateStep(4);

  async function handleCreateProject() {
    if (
      !canCreateProject ||
      isCreating
    ) {
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
        services:
          selectedServices,
        milestones,
        ownerId,
        teamMembers,
        serviceAssignments,
      });

    if (!result.ok) {
      setSubmitError(
        result.error
      );

      setIsCreating(false);

      return;
    }

    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch {
      // Projektet är redan skapat.
    }

    /* VORIX DELETE SERVER DRAFT AFTER CREATE */

    if (serverDraftId) {
      await deleteProjectDraftAction(
        serverDraftId
      );
    }

    try {
      window.localStorage.removeItem(
        AUTOSAVE_KEY
      );
    }
    catch {
      // Lokal autosave ska inte blockera projektet.
    }

    router.push(
      "/dashboard/projekt?created=1"
    );

    router.refresh();
  }

  return (
    <div className={styles.page}>
      <section
        className={
          styles.wizardIntro
        }
      >
        <div>
          <span
            className={
              styles.wizardEyebrow
            }
          >
            Nytt projekt
          </span>

          <h2>
            Skapa ett komplett projekt
          </h2>

          <p>
            Lägg grunden, välj tjänster,
            planera tidslinjen och sätt
            rätt team innan projektet
            skapas.
          </p>
        </div>

        <div
          className={
            styles.wizardMeta
          }
        >
          <span
            className={
              styles.saveStatus
            }
          >
            <CloudCheck
              size={16}
              strokeWidth={1.8}
            />

            {draftSavedAt
              ? `Utkast sparat ${draftSavedAt}`
              : "Autosparning aktiv"}
          </span>

          <span
            className={
              styles.stepBadge
            }
          >
            Steg {activeStep} av 5
          </span>
        </div>
      </section>

      <ProjectSteps
        activeStep={
          activeStep
        }
        onStepChange={
          changeStep
        }
      />

      <div
        className={
          styles.layout
        }
      >
        <div
          className={
            styles.formColumn
          }
        >
          {activeStep === 1 && (
            <ProjectBasicInfo
              options={options}
              draft={draft}
              onChange={
                updateDraft
              }
            />
          )}

          {activeStep === 2 && (
            <ProjectServices
              options={options}
              services={
                selectedServices
              }
              onChange={
                setSelectedServices
              }
            />
          )}

          {activeStep === 3 && (
            <ProjectSchedule
              options={options}
              draft={draft}
              milestones={
                milestones
              }
              onDraftChange={
                updateDraft
              }
              onChange={
                setMilestones
              }
            />
          )}

          {activeStep === 4 && (
            <ProjectTeam
              options={options}
              ownerId={ownerId}
              teamMembers={
                teamMembers
              }
              services={
                selectedServices
              }
              serviceAssignments={
                serviceAssignments
              }
              onOwnerChange={
                setOwnerId
              }
              onTeamChange={
                setTeamMembers
              }
              onServiceAssignmentsChange={
                setServiceAssignments
              }
            />
          )}

          {activeStep === 5 && (
            <ProjectConfirmation
              options={options}
              draft={draft}
              services={
                selectedServices
              }
              milestones={
                milestones
              }
              ownerId={ownerId}
              teamMembers={
                teamMembers
              }
              serviceAssignments={
                serviceAssignments
              }
              onEditStep={
                changeStep
              }
            />
          )}

          {stepError && (
            <div
              className={
                styles.stepError
              }
              role="alert"
            >
              {stepError}
            </div>
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

          <footer
            className={
              styles.actions
            }
          >
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
                disabled={
                  isCreating
                }
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
              className={
                styles.saveButton
              }
              onClick={
                handleSaveDraft
              }
              disabled={
                isCreating
              }
            >
              <Save
                size={17}
                strokeWidth={1.8}
              />

              {savingDraft
                ? "Sparar..."
                : "Spara utkast"}
            </button>

            {activeStep < 5 ? (
              <button
                type="button"
                className={
                  styles.nextButton
                }
                onClick={
                  handleNext
                }
                disabled={
                  isCreating
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
          services={
            selectedServices
          }
          milestones={
            milestones
          }
          ownerId={ownerId}
          teamMembers={
            teamMembers
          }
          serviceAssignments={
            serviceAssignments
          }
        />
      </div>
    </div>
  );
}