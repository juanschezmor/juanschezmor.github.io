import { createContext } from "react";
import type { SkillPayload } from "../../api/skills";
import type { SkillItem } from "../../types/Skill";

export interface SkillContextType {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  fetchSkills: () => Promise<void>;
  createSkill: (input: SkillPayload) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

export const SkillContext = createContext<SkillContextType | undefined>(
  undefined
);
