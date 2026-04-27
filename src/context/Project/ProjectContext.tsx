import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ProjectContext } from "./ProjectContextValue";

const readProjects = async () => {
  const items = await listProjects();
  return items.length > 0 ? items : fallbackProjects;
};

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
      setProjects(await readProjects());
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
    void readProjects()
      .then(setProjects)
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setProjects(fallbackProjects);
        setError(getFetchFallbackMessage("projects", err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
