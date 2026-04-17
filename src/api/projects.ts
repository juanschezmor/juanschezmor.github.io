import type { Project } from "../types/Project";
import { fetchCollection, sendJson, sendRequest } from "./client";
import { mapProjectFromApi } from "./mappers";

export interface ProjectPayload {
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

export const listProjects = () =>
  fetchCollection("/projects", mapProjectFromApi);

export const createProject = (input: ProjectPayload) =>
  sendJson<Project, ProjectPayload>(
    "/projects",
    "POST",
    input,
    mapProjectFromApi,
    { requiresAuth: true }
  );

export const updateProject = (id: string, input: ProjectPayload) =>
  sendJson(`/projects/${id}`, "PUT", input, undefined, { requiresAuth: true });

export const deleteProject = (id: string) =>
  sendRequest(`/projects/${id}`, { method: "DELETE" }, { requiresAuth: true });
