import { createContext } from "react";
import type { ProjectPayload } from "../../api/projects";
import type { Project } from "../../types/Project";

export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (input: ProjectPayload) => Promise<void>;
  updateProject: (id: string, input: ProjectPayload) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);
