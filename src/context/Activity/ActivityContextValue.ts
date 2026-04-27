import { createContext } from "react";
import type { ActivityPayload } from "../../api/activities";
import type { ActivityItem } from "../../types/Activity";

export interface ActivityContextType {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  createActivity: (input: ActivityPayload) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);
