import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  listProjects,
  type ProjectPayload,
  updateProject as updateProjectRequest,
} from "../../api/projects";
import {
  getFetchFallbackMessage,
  getMutationErrorMessage,
} from "../../api/client";
import { projects as fallbackProjects } from "../../constants";
import type { Project } from "../../types/Project";

interface ProjectContextType {
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

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listProjects();
      setProjects(items.length > 0 ? items : fallbackProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects(fallbackProjects);
      setError(getFetchFallbackMessage("projects", err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (input: ProjectPayload) => {
      try {
        setError(null);
        await createProjectRequest(input);
        await fetchProjects();
      } catch (err) {
        console.error("Failed to create project", err);
        setError(getMutationErrorMessage("create project", err));
        throw err;
      }
    },
    [fetchProjects]
  );

  const updateProject = useCallback(
    async (id: string, input: ProjectPayload) => {
      try {
        setError(null);
        await updateProjectRequest(id, input);
        await fetchProjects();
      } catch (err) {
        console.error("Failed to update project", err);
        setError(getMutationErrorMessage("update project", err));
        throw err;
      }
    },
    [fetchProjects]
  );

  const deleteProject = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteProjectRequest(id);
      setProjects((current) => current.filter((project) => project.id !== id));
    } catch (err) {
      console.error("Failed to delete project", err);
      setError(getMutationErrorMessage("delete project", err));
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const contextValue = useMemo(
    () => ({
      projects,
      loading,
      error,
      fetchProjects,
      createProject,
      updateProject,
      deleteProject,
    }),
    [
      projects,
      loading,
      error,
      fetchProjects,
      createProject,
      updateProject,
      deleteProject,
    ]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
