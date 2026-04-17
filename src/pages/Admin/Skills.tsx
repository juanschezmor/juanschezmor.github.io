import { useMemo, useState } from "react";
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
  const [mode, setMode] = useState<"manage" | "create">("manage");
  const [query, setQuery] = useState("");

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return skills;
    }

    return skills.filter((skill) =>
      [skill.skill, skill.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query, skills]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createSkill(form);
      setForm(initialForm);
      setMode("manage");
    } catch {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 text-white">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Skills library</h2>
          <p className="mt-1 text-sm text-slate-400">
            Browse the stack fast and keep skill creation in its own view.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-slate-950/70 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "manage"
                ? "bg-orange-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setMode("manage")}
          >
            Manage
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "create"
                ? "bg-orange-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setMode("create")}
          >
            Create
          </button>
        </div>
      </div>

      {mode === "create" ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
        >
          <div>
            <h3 className="text-lg font-semibold text-white">Add skill</h3>
            <p className="text-sm text-slate-400">
              The icon is still resolved automatically from the skill name.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add skill"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-white transition hover:border-white/25 hover:bg-white/5"
              onClick={() => setMode("manage")}
            >
              Back to library
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {skills.length} total skill{skills.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Filter by name or category.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skills"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white lg:w-80"
              />
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950"
                onClick={() => setMode("create")}
              >
                New skill
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {loading && <p className="text-slate-300">Loading skills...</p>}

          {!loading && filteredSkills.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
              {query ? "No skills match that search." : "No skills found."}
            </div>
          ) : (
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSkills.map((skill) => {
                const visual = resolveSkillVisual(skill.skill);
                const Icon = visual.icon;

                return (
                  <article
                    key={skill.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/20 text-2xl"
                        style={{ color: visual.color }}
                      >
                        <Icon />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{skill.skill}</h3>
                        <p className="text-sm text-white/60">{skill.category}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void deleteSkill(skill.id);
                      }}
                      className="mt-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Delete
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
