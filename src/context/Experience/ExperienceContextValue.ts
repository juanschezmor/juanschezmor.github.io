import { createContext } from "react";
import type { ExperiencePayload } from "../../api/experiences";
import type { ExperienceItem } from "../../types/Experience";

export interface ExperienceContextType {
  experiences: ExperienceItem[];
  loading: boolean;
  error: string | null;
  fetchExperiences: () => Promise<void>;
  createExperience: (input: ExperiencePayload) => Promise<void>;
  updateExperience: (id: number, input: ExperiencePayload) => Promise<void>;
  deleteExperience: (id: number) => Promise<void>;
}

export const ExperienceContext = createContext<
  ExperienceContextType | undefined
>(undefined);
