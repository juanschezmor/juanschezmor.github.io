import { useContext } from "react";
import { SkillContext } from "../context/Skill/SkillContext";

export const useSkills = () => {
  const context = useContext(SkillContext);

  if (!context) {
    throw new Error("useSkills must be used within a SkillProvider");
  }

  return context;
};
