import { SkillContext } from "../context/Skill/SkillContextValue";
import { useRequiredContext } from "./useRequiredContext";

export const useSkills = () =>
  useRequiredContext(SkillContext, "useSkills");
