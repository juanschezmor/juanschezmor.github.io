import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createActivity as createActivityRequest,
  deleteActivity as deleteActivityRequest,
  listActivities,
  type ActivityPayload,
} from "../../api/activities";
import {
  getFetchFallbackMessage,
  getMutationErrorMessage,
} from "../../api/client";
import { activities as fallbackActivities } from "../../constants";
import type { ActivityItem } from "../../types/Activity";
import { ActivityContext } from "./ActivityContextValue";

const readActivities = async () => {
  const items = await listActivities();
  return items.length > 0 ? items : fallbackActivities;
};

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
      setActivities(await readActivities());
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities(fallbackActivities);
      setError(getFetchFallbackMessage("activity", err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createActivity = useCallback(
    async (input: ActivityPayload) => {
      try {
        setError(null);
        await createActivityRequest(input);
        await fetchActivities();
      } catch (err) {
        console.error("Failed to create activity", err);
        setError(getMutationErrorMessage("create activity", err));
        throw err;
      }
    },
    [fetchActivities]
  );

  const deleteActivity = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteActivityRequest(id);
      setActivities((current) =>
        current.filter((activity) => activity.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete activity", err);
      setError(getMutationErrorMessage("delete activity", err));
    }
  }, []);

  useEffect(() => {
    void readActivities()
      .then(setActivities)
      .catch((err) => {
        console.error("Error fetching activities:", err);
        setActivities(fallbackActivities);
        setError(getFetchFallbackMessage("activity", err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
