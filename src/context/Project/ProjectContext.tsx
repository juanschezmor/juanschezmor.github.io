// src/pages/Admin/ProjectContext.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../../config/api";
import type { Project } from "../../types/Project";
import { parseDynamoProjects } from "../../utils";
import { projects as fallbackProjects } from "../../constants";

interface ProjectPayload {
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  bullet_points: {
    en: string[];
    es: string[];
  };
  github_link?: string;
  live_link?: string;
  image?: string;
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json = await res.json();
      const data = typeof json.body === "string" ? JSON.parse(json.body) : json;
      const parsedProjects = parseDynamoProjects(data);
      setProjects(parsedProjects.length > 0 ? parsedProjects : fallbackProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects(fallbackProjects);
      setError("AWS API unavailable. Showing local projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (input: ProjectPayload) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        await fetchProjects();
      } catch (err) {
        console.error("Failed to create project", err);
        setError("Failed to create project.");
        throw err;
      }
    },
    [fetchProjects]
  );

  const updateProject = useCallback(
    async (id: string, input: ProjectPayload) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        await fetchProjects();
      } catch (err) {
        console.error("Failed to update project", err);
        setError("Failed to update project.");
        throw err;
      }
    },
    [fetchProjects]
  );

  const deleteProject = async (id: string) => {
    try {
      setError(null);
      await fetch(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project", err);
      setError("Failed to delete project.");
    }
  };

  useEffect(() => {
    fetchProjects();
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
    [projects, loading, error, fetchProjects, createProject, updateProject]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
