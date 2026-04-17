import { ActivityContext } from "../context/Activity/ActivityContext";
import { useRequiredContext } from "./useRequiredContext";

export const useActivities = () =>
  useRequiredContext(ActivityContext, "useActivities");
