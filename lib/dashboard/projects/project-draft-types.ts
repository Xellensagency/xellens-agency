import type {
  ProjectDraft,
  ProjectMilestoneDraft,
  ProjectServiceAssignments,
  ProjectServiceDraft,
  ProjectTeamMemberDraft,
} from "./create-project-types";


export type ProjectDraftPayload = {
  activeStep: number;

  draft:
    ProjectDraft;

  services:
    ProjectServiceDraft[];

  milestones:
    ProjectMilestoneDraft[];

  ownerId:
    string;

  teamMembers:
    ProjectTeamMemberDraft[];

  serviceAssignments:
    ProjectServiceAssignments;
};


export type SavedProjectDraft = {
  id: string;

  user_id: string;

  title: string;

  customer_name:
    string | null;

  current_step: number;

  payload:
    ProjectDraftPayload;

  created_at: string;

  updated_at: string;
};