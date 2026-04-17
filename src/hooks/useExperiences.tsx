import { useContext } from "react";
import { ExperienceContext } from "../context/Experience/ExperienceContext";

export const useExperiences = () => {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error("useExperiences must be used within an ExperienceProvider");
  }

  return context;
};
