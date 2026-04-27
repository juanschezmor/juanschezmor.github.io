import { ExperienceContext } from "../context/Experience/ExperienceContextValue";
import { useRequiredContext } from "./useRequiredContext";

export const useExperiences = () =>
  useRequiredContext(ExperienceContext, "useExperiences");
