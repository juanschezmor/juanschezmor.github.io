import { useState } from "react";
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

      setEditingId(null);
      setForm(emptyForm);
    } catch {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Experiences</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 mb-8"
      >
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Company</label>
          <input
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
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
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Period ES</label>
          <input
            value={form.period.es}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                period: { ...current.period, es: event.target.value },
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-6">
          {form.roles.map((role, index) => (
            <div
              key={role.id}
              className="rounded-2xl border border-white/10 bg-black/10 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Role {index + 1}</h2>
                {form.roles.length > 1 && (
                  <button
                    type="button"
                    className="rounded-lg bg-red-500 px-3 py-1 text-sm font-semibold text-white"
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

              <div className="grid gap-3">
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
                              title: { ...item.title, en: event.target.value },
                            }
                          : item
                      ),
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
                  required
                />

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
                              title: { ...item.title, es: event.target.value },
                            }
                          : item
                      ),
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
                  required
                />

                <label className="text-sm text-white/70">
                  Bullet points EN
                </label>
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
                  className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
                  required
                />

                <label className="text-sm text-white/70">
                  Bullet points ES
                </label>
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
                  className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border border-white/20 px-4 py-2 text-white"
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
            className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : editingId !== null
                ? "Update experience"
                : "Add experience"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="rounded-lg border border-white/20 px-4 py-2 text-white"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-slate-300">Loading experiences...</p>}

      <div className="grid gap-4">
        {experiences.map((experience) => (
          <article
            key={experience.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{experience.company}</h2>
              <p className="text-sm text-white/60">
                EN: {experience.period_i18n?.en ?? experience.period}
              </p>
              <p className="text-sm text-white/60">
                ES: {experience.period_i18n?.es ?? experience.period}
              </p>
            </div>

            <div className="grid gap-4">
              {experience.roles
                .sort((a, b) => b.id - a.id)
                .map((role) => (
                  <div
                    key={role.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      EN
                    </p>
                    <h3 className="text-lg font-semibold">
                      {role.title_i18n?.en ?? role.title}
                    </h3>
                    <ul className="mt-2 list-disc pl-5 text-white/70">
                      {(role.description_i18n?.en ?? role.description).map((point) => (
                        <li key={`en-${role.id}-${point}`}>{point}</li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">
                      ES
                    </p>
                    <h3 className="text-lg font-semibold">
                      {role.title_i18n?.es ?? role.title}
                    </h3>
                    <ul className="mt-2 list-disc pl-5 text-white/70">
                      {(role.description_i18n?.es ?? role.description).map((point) => (
                        <li key={`es-${role.id}-${point}`}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setEditingId(experience.id);
                  setForm(mapExperienceToForm(experience));
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
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
    </div>
  );
}

export default Experiences;
