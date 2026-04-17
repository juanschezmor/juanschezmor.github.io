import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../../config/api";
import { skills as fallbackSkills } from "../../constants";
import type { SkillCategory, SkillItem } from "../../types/Skill";
import { parseDynamoSkills } from "../../utils";

interface CreateSkillInput {
  skill: string;
  category: SkillCategory;
}

interface SkillContextType {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  fetchSkills: () => Promise<void>;
  createSkill: (input: CreateSkillInput) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

export const SkillContext = createContext<SkillContextType | undefined>(
  undefined
);

export const SkillProvider = ({ children }: { children: React.ReactNode }) => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/skills`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json = await res.json();
      const data = typeof json.body === "string" ? JSON.parse(json.body) : json;
      const parsedSkills = parseDynamoSkills(data);
      setSkills(parsedSkills.length > 0 ? parsedSkills : fallbackSkills);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setSkills(fallbackSkills);
      setError("AWS API unavailable. Showing local skills.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSkill = useCallback(
    async (input: CreateSkillInput) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE_URL}/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        await fetchSkills();
      } catch (err) {
        console.error("Failed to create skill", err);
        setError("Failed to create skill.");
        throw err;
      }
    },
    [fetchSkills]
  );

  const deleteSkill = useCallback(async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/skills/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      setSkills((prev) => prev.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("Failed to delete skill", err);
      setError("Failed to delete skill.");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const value = useMemo(
    () => ({
      skills,
      loading,
      error,
      fetchSkills,
      createSkill,
      deleteSkill,
    }),
    [skills, loading, error, fetchSkills, createSkill, deleteSkill]
  );

  return (
    <SkillContext.Provider value={value}>{children}</SkillContext.Provider>
  );
};
