import { SkillContext } from "../context/Skill/SkillContext";
import { useRequiredContext } from "./useRequiredContext";

export const useSkills = () =>
  useRequiredContext(SkillContext, "useSkills");
