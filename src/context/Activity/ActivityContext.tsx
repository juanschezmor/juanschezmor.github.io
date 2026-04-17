import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../../config/api";
import { activities as fallbackActivities } from "../../constants";
import type { ActivityItem } from "../../types/Activity";
import { parseDynamoActivities } from "../../utils";

interface CreateActivityInput {
  date: string;
  label: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
}

interface ActivityContextType {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  createActivity: (input: CreateActivityInput) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/activities`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();
      const data = typeof json.body === "string" ? JSON.parse(json.body) : json;
      const parsedActivities = parseDynamoActivities(data);
      setActivities(
        parsedActivities.length > 0 ? parsedActivities : fallbackActivities
      );
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities(fallbackActivities);
      setError("AWS API unavailable. Showing local activity feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createActivity = useCallback(
    async (input: CreateActivityInput) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE_URL}/activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        await fetchActivities();
      } catch (err) {
        console.error("Failed to create activity", err);
        setError("Failed to create activity.");
        throw err;
      }
    },
    [fetchActivities]
  );

  const deleteActivity = useCallback(async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/activities/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (err) {
      console.error("Failed to delete activity", err);
      setError("Failed to delete activity.");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const value = useMemo(
    () => ({
      activities,
      loading,
      error,
      fetchActivities,
      createActivity,
      deleteActivity,
    }),
    [activities, loading, error, fetchActivities, createActivity, deleteActivity]
  );

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
