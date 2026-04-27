import { ActivityContext } from "../context/Activity/ActivityContextValue";
import { useRequiredContext } from "./useRequiredContext";

export const useActivities = () =>
  useRequiredContext(ActivityContext, "useActivities");
