import type { SkillCategory, SkillItem } from "../types/Skill";
import { fetchCollection, sendJson, sendRequest } from "./client";
import { mapSkillFromApi } from "./mappers";

export interface SkillPayload {
  skill: string;
  category: SkillCategory;
}

export const listSkills = async () => {
  const items = await fetchCollection("/skills", mapSkillFromApi);
  return items.slice().sort((a, b) => a.skill.localeCompare(b.skill));
};

export const createSkill = (input: SkillPayload) =>
  sendJson<SkillItem, SkillPayload>(
    "/skills",
    "POST",
    input,
    mapSkillFromApi,
    { requiresAuth: true }
  );

export const deleteSkill = (id: string) =>
  sendRequest(`/skills/${id}`, { method: "DELETE" }, { requiresAuth: true });
