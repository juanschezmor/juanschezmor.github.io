import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSkill as createSkillRequest,
  deleteSkill as deleteSkillRequest,
  listSkills,
  type SkillPayload,
} from "../../api/skills";
import {
  getFetchFallbackMessage,
  getMutationErrorMessage,
} from "../../api/client";
import { skills as fallbackSkills } from "../../constants";
import type { SkillItem } from "../../types/Skill";
import { SkillContext } from "./SkillContextValue";

export const SkillProvider = ({ children }: { children: React.ReactNode }) => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listSkills();
      setSkills(items.length > 0 ? items : fallbackSkills);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setSkills(fallbackSkills);
      setError(getFetchFallbackMessage("skills", err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createSkill = useCallback(
    async (input: SkillPayload) => {
      try {
        setError(null);
        await createSkillRequest(input);
        await fetchSkills();
      } catch (err) {
        console.error("Failed to create skill", err);
        setError(getMutationErrorMessage("create skill", err));
        throw err;
      }
    },
    [fetchSkills]
  );

  const deleteSkill = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteSkillRequest(id);
      setSkills((current) => current.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("Failed to delete skill", err);
      setError(getMutationErrorMessage("delete skill", err));
    }
  }, []);

  useEffect(() => {
    void fetchSkills();
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

  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>;
};
