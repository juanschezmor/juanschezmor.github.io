import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../../config/api";
import { experiences as fallbackExperiences } from "../../constants";
import type { ExperienceItem } from "../../types/Experience";
import { parseDynamoExperiences } from "../../utils";

interface ExperiencePayload {
  company: string;
  period: {
    en: string;
    es: string;
  };
  roles: Array<{
    id: number;
    title: {
      en: string;
      es: string;
    };
    description: {
      en: string[];
      es: string[];
    };
  }>;
}

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

      const response = await fetch(`${API_BASE_URL}/experiences`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();
      const data = typeof json.body === "string" ? JSON.parse(json.body) : json;
      const parsed = parseDynamoExperiences(data);
      setExperiences(parsed.length > 0 ? parsed : fallbackExperiences);
    } catch (err) {
      console.error("Error fetching experiences:", err);
      setExperiences(fallbackExperiences);
      setError("AWS API unavailable. Showing local experience content.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createExperience = useCallback(
    async (input: ExperiencePayload) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/experiences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        await fetchExperiences();
      } catch (err) {
        console.error("Failed to create experience", err);
        setError("Failed to create experience.");
        throw err;
      }
    },
    [fetchExperiences]
  );

  const updateExperience = useCallback(
    async (id: number, input: ExperiencePayload) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/experiences/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        await fetchExperiences();
      } catch (err) {
        console.error("Failed to update experience", err);
        setError("Failed to update experience.");
        throw err;
      }
    },
    [fetchExperiences]
  );

  const deleteExperience = useCallback(async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/experiences/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setExperiences((prev) => prev.filter((experience) => experience.id !== id));
    } catch (err) {
      console.error("Failed to delete experience", err);
      setError("Failed to delete experience.");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
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
