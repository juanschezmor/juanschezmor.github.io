import { useContext } from "react";
import { ActivityContext } from "../context/Activity/ActivityContext";

export const useActivities = () => {
  const context = useContext(ActivityContext);

  if (!context) {
    throw new Error("useActivities must be used within an ActivityProvider");
  }

  return context;
};
