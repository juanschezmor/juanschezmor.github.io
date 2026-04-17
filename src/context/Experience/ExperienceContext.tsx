import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createExperience as createExperienceRequest,
  deleteExperience as deleteExperienceRequest,
  listExperiences,
  type ExperiencePayload,
  updateExperience as updateExperienceRequest,
} from "../../api/experiences";
import {
  getFetchFallbackMessage,
  getMutationErrorMessage,
} from "../../api/client";
import { experiences as fallbackExperiences } from "../../constants";
import type { ExperienceItem } from "../../types/Experience";

interface ExperienceContextType {
  experiences: ExperienceItem[];
  loading: boolean;
  error: string | null;
  fetchExperiences: () => Promise<void>;
  createExperience: (input: ExperiencePayload) => Promise<void>;
  updateExperience: (id: number, input: ExperiencePayload) => Promise<void>;
  deleteExperience: (id: number) => Promise<void>;
}

export const ExperienceContext = createContext<
  ExperienceContextType | undefined
>(undefined);

export const ExperienceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listExperiences();
      setExperiences(items.length > 0 ? items : fallbackExperiences);
    } catch (err) {
      console.error("Error fetching experiences:", err);
      setExperiences(fallbackExperiences);
      setError(getFetchFallbackMessage("experience content", err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createExperience = useCallback(
    async (input: ExperiencePayload) => {
      try {
        setError(null);
        await createExperienceRequest(input);
        await fetchExperiences();
      } catch (err) {
        console.error("Failed to create experience", err);
        setError(getMutationErrorMessage("create experience", err));
        throw err;
      }
    },
    [fetchExperiences]
  );

  const updateExperience = useCallback(
    async (id: number, input: ExperiencePayload) => {
      try {
        setError(null);
        await updateExperienceRequest(id, input);
        await fetchExperiences();
      } catch (err) {
        console.error("Failed to update experience", err);
        setError(getMutationErrorMessage("update experience", err));
        throw err;
      }
    },
    [fetchExperiences]
  );

  const deleteExperience = useCallback(async (id: number) => {
    try {
      setError(null);
      await deleteExperienceRequest(id);
      setExperiences((current) =>
        current.filter((experience) => experience.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete experience", err);
      setError(getMutationErrorMessage("delete experience", err));
    }
  }, []);

  useEffect(() => {
    void fetchExperiences();
  }, [fetchExperiences]);

  const value = useMemo(
    () => ({
      experiences,
      loading,
      error,
      fetchExperiences,
      createExperience,
      updateExperience,
      deleteExperience,
    }),
    [
      experiences,
      loading,
      error,
      fetchExperiences,
      createExperience,
      updateExperience,
      deleteExperience,
    ]
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};
