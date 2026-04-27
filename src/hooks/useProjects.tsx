import { ProjectContext } from "../context/Project/ProjectContextValue";
import { useRequiredContext } from "./useRequiredContext";

export const useProjects = () =>
  useRequiredContext(ProjectContext, "useProjects");
