import { useMemo, useState } from "react";
import { useExperiences } from "../../hooks/useExperiences";
import type { ExperienceItem } from "../../types/Experience";

const emptyRole = (id: number) => ({
  id,
  title: { en: "", es: "" },
  description: { en: "", es: "" },
});

const emptyForm = {
  company: "",
  period: { en: "", es: "" },
  roles: [emptyRole(1)],
};

const mapExperienceToForm = (experience: ExperienceItem) => ({
  company: experience.company,
  period: {
    en: experience.period_i18n?.en ?? experience.period,
    es: experience.period_i18n?.es ?? experience.period,
  },
  roles: experience.roles.map((role) => ({
    id: role.id,
    title: {
      en: role.title_i18n?.en ?? role.title,
      es: role.title_i18n?.es ?? role.title,
    },
    description: {
      en: (role.description_i18n?.en ?? role.description).join("\n"),
      es: (role.description_i18n?.es ?? role.description).join("\n"),
    },
  })),
});

function Experiences() {
  const {
    experiences,
    createExperience,
    updateExperience,
    deleteExperience,
    loading,
    error,
  } = useExperiences();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"manage" | "editor">("manage");
  const [query, setQuery] = useState("");

  const filteredExperiences = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return experiences;
    }

    return experiences.filter((experience) => {
      const values = [
        experience.company,
        experience.period_i18n?.en ?? experience.period,
        experience.period_i18n?.es ?? experience.period,
        ...experience.roles.flatMap((role) => [
          role.title_i18n?.en ?? role.title,
          role.title_i18n?.es ?? role.title,
          ...(role.description_i18n?.en ?? role.description),
          ...(role.description_i18n?.es ?? role.description),
        ]),
      ];

      return values.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [experiences, query]);

  const resetEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      company: form.company.trim(),
      period: {
        en: form.period.en.trim(),
        es: form.period.es.trim(),
      },
      roles: form.roles.map((role) => ({
        id: role.id,
        title: {
          en: role.title.en.trim(),
          es: role.title.es.trim(),
        },
        description: {
          en: role.description.en
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          es: role.description.es
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
      })),
    };

    try {
      if (editingId !== null) {
        await updateExperience(editingId, payload);
      } else {
        await createExperience(payload);
      }

      resetEditor();
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
          <h2 className="text-xl font-semibold text-white">Experience timeline</h2>
          <p className="mt-1 text-sm text-slate-400">
            Browse entries quickly and open the full editor only when needed.
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
              mode === "editor"
                ? "bg-orange-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => {
              if (editingId === null) {
                resetEditor();
              }
              setMode("editor");
            }}
          >
            {editingId !== null ? "Edit" : "Create"}
          </button>
        </div>
      </div>

      {mode === "editor" ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {editingId !== null ? "Update experience" : "Add experience"}
              </h3>
              <p className="text-sm text-slate-400">
                Use the editor for the full timeline entry and keep the list separate.
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/25 hover:bg-white/5"
                onClick={() => {
                  resetEditor();
                  setMode("manage");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Company</label>
              <input
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Period EN</label>
              <input
                value={form.period.en}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    period: { ...current.period, en: event.target.value },
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-2 md:col-start-2">
              <label className="text-sm text-white/70">Period ES</label>
              <input
                value={form.period.es}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    period: { ...current.period, es: event.target.value },
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="grid gap-4">
            {form.roles.map((role, index) => (
              <div
                key={role.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold">Role {index + 1}</h4>
                    <p className="text-sm text-slate-400">
                      Titles and bullet points in both languages.
                    </p>
                  </div>
                  {form.roles.length > 1 && (
                    <button
                      type="button"
                      className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.filter((item) => item.id !== role.id),
                        }))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm text-white/70">Title EN</label>
                    <input
                      value={role.title.en}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.map((item) =>
                            item.id === role.id
                              ? {
                                  ...item,
                                  title: {
                                    ...item.title,
                                    en: event.target.value,
                                  },
                                }
                              : item
                          ),
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-white/70">Title ES</label>
                    <input
                      value={role.title.es}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.map((item) =>
                            item.id === role.id
                              ? {
                                  ...item,
                                  title: {
                                    ...item.title,
                                    es: event.target.value,
                                  },
                                }
                              : item
                          ),
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-white/70">Bullet points EN</label>
                    <textarea
                      value={role.description.en}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.map((item) =>
                            item.id === role.id
                              ? {
                                  ...item,
                                  description: {
                                    ...item.description,
                                    en: event.target.value,
                                  },
                                }
                              : item
                          ),
                        }))
                      }
                      className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-white/70">Bullet points ES</label>
                    <textarea
                      value={role.description.es}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.map((item) =>
                            item.id === role.id
                              ? {
                                  ...item,
                                  description: {
                                    ...item.description,
                                    es: event.target.value,
                                  },
                                }
                              : item
                          ),
                        }))
                      }
                      className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-white transition hover:border-white/25 hover:bg-white/5"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  roles: [
                    ...current.roles,
                    emptyRole(Math.max(...current.roles.map((role) => role.id)) + 1),
                  ],
                }))
              }
            >
              Add role
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : editingId !== null
                  ? "Update experience"
                  : "Add experience"}
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-white transition hover:border-white/25 hover:bg-white/5"
              onClick={() => {
                resetEditor();
                setMode("manage");
              }}
            >
              Back to list
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {experiences.length} total compan{experiences.length === 1 ? "y" : "ies"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search by company, role, period or bullet points.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search experiences"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white lg:w-80"
              />
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950"
                onClick={() => {
                  resetEditor();
                  setMode("editor");
                }}
              >
                New experience
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {loading && <p className="text-slate-300">Loading experiences...</p>}

          {!loading && filteredExperiences.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
              {query ? "No experiences match that search." : "No experiences found."}
            </div>
          ) : (
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1">
              {filteredExperiences.map((experience) => (
                <article
                  key={experience.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{experience.company}</h3>
                    <div className="mt-2 grid gap-1 text-sm text-white/60 md:grid-cols-2">
                      <p>EN: {experience.period_i18n?.en ?? experience.period}</p>
                      <p>ES: {experience.period_i18n?.es ?? experience.period}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {experience.roles
                      .sort((a, b) => b.id - a.id)
                      .map((role) => (
                        <div
                          key={role.id}
                          className="rounded-xl border border-white/10 bg-black/10 p-4"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                                EN
                              </p>
                              <h4 className="text-lg font-semibold">
                                {role.title_i18n?.en ?? role.title}
                              </h4>
                              <ul className="mt-2 list-disc pl-5 text-white/70">
                                {(role.description_i18n?.en ?? role.description).map(
                                  (point) => (
                                    <li key={`en-${role.id}-${point}`}>{point}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                                ES
                              </p>
                              <h4 className="text-lg font-semibold">
                                {role.title_i18n?.es ?? role.title}
                              </h4>
                              <ul className="mt-2 list-disc pl-5 text-white/70">
                                {(role.description_i18n?.es ?? role.description).map(
                                  (point) => (
                                    <li key={`es-${role.id}-${point}`}>{point}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        setEditingId(experience.id);
                        setForm(mapExperienceToForm(experience));
                        setMode("editor");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        void deleteExperience(experience.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Experiences;
