import { ExperienceContext } from "../context/Experience/ExperienceContext";
import { useRequiredContext } from "./useRequiredContext";

export const useExperiences = () =>
  useRequiredContext(ExperienceContext, "useExperiences");
