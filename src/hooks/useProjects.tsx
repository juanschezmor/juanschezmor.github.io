import { ProjectContext } from "../context/Project/ProjectContext";
import { useRequiredContext } from "./useRequiredContext";

export const useProjects = () =>
  useRequiredContext(ProjectContext, "useProjects");
