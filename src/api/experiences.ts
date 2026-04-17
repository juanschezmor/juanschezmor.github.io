import type { ExperienceItem } from "../types/Experience";
import { fetchCollection, sendJson, sendRequest } from "./client";
import { mapExperienceFromApi } from "./mappers";

export interface ExperiencePayload {
  company: string;
  period: {
    en: string;
    es: string;
  };
  roles: Array<{
    id: number;
    title: {
      en: string;
      es: string;
    };
    description: {
      en: string[];
      es: string[];
    };
  }>;
}

export const listExperiences = async () => {
  const items = await fetchCollection("/experiences", mapExperienceFromApi);
  return items.slice().sort((a, b) => b.id - a.id);
};

export const createExperience = (input: ExperiencePayload) =>
  sendJson<ExperienceItem, ExperiencePayload>(
    "/experiences",
    "POST",
    input,
    mapExperienceFromApi,
    { requiresAuth: true }
  );

export const updateExperience = (id: number, input: ExperiencePayload) =>
  sendJson(`/experiences/${id}`, "PUT", input, undefined, { requiresAuth: true });

export const deleteExperience = (id: number) =>
  sendRequest(`/experiences/${id}`, { method: "DELETE" }, { requiresAuth: true });
