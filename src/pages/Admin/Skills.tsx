import { useState } from "react";
import { useSkills } from "../../hooks/useSkills";
import { resolveSkillVisual } from "../../skill-icons";
import type { SkillCategory } from "../../types/Skill";

const initialForm: { skill: string; category: SkillCategory } = {
  skill: "",
  category: "Frontend",
};

export default function Skills() {
  const { skills, createSkill, deleteSkill, loading, error } = useSkills();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createSkill(form);
      setForm(initialForm);
    } catch {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Skills</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 mb-8"
      >
        <div className="grid gap-2">
          <label htmlFor="skill-name" className="text-sm text-white/70">
            Skill name
          </label>
          <input
            id="skill-name"
            value={form.skill}
            onChange={(event) =>
              setForm((current) => ({ ...current, skill: event.target.value }))
            }
            placeholder="Redis"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="skill-category" className="text-sm text-white/70">
            Category
          </label>
          <select
            id="skill-category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as SkillCategory,
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Tools">Tools</option>
          </select>
        </div>

        <p className="text-sm text-white/60">
          Icon is resolved automatically from the skill name when supported.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-lg bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add skill"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-slate-300">Loading skills...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          const visual = resolveSkillVisual(skill.skill);
          const Icon = visual.icon;

          return (
            <article
              key={skill.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/20 text-2xl"
                  style={{ color: visual.color }}
                >
                  <Icon />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{skill.skill}</h2>
                  <p className="text-sm text-white/60">{skill.category}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  void deleteSkill(skill.id);
                }}
                className="mt-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
