import type { ActivityItem } from "../types/Activity";
import { compareActivitiesByDateDesc } from "../formatters/activityDates";
import { fetchCollection, sendJson, sendRequest } from "./client";
import { mapActivityFromApi } from "./mappers";

export interface ActivityPayload {
  start_date: string;
  end_date?: string;
  label: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
}

export const listActivities = async () => {
  const items = await fetchCollection("/activities", mapActivityFromApi);
  return items.slice().sort(compareActivitiesByDateDesc);
};

export const createActivity = (input: ActivityPayload) =>
  sendJson<ActivityItem, ActivityPayload>(
    "/activities",
    "POST",
    input,
    mapActivityFromApi,
    { requiresAuth: true }
  );

export const deleteActivity = (id: string) =>
  sendRequest(`/activities/${id}`, { method: "DELETE" }, { requiresAuth: true });
