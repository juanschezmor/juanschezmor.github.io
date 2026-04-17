import { useState } from "react";
import { useActivities } from "../../hooks/useActivities";

const initialForm = {
  date: "",
  label: {
    en: "",
    es: "",
  },
  description: {
    en: "",
    es: "",
  },
};

export default function Activities() {
  const { activities, createActivity, deleteActivity, loading, error } =
    useActivities();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createActivity({
        date: form.date.trim(),
        label: {
          en: form.label.en.trim(),
          es: form.label.es.trim(),
        },
        description: {
          en: form.description.en.trim(),
          es: form.description.es.trim(),
        },
      });
      setForm(initialForm);
    } catch {
      // Error state is handled in context.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Activity feed</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 mb-8"
      >
        <div className="grid gap-2">
          <label htmlFor="activity-date" className="text-sm text-white/70">
            Date label
          </label>
          <input
            id="activity-date"
            value={form.date}
            onChange={(event) =>
              setForm((current) => ({ ...current, date: event.target.value }))
            }
            placeholder="Apr 2026"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="activity-label-en" className="text-sm text-white/70">
            Title EN
          </label>
          <input
            id="activity-label-en"
            value={form.label.en}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                label: { ...current.label, en: event.target.value },
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="activity-label-es" className="text-sm text-white/70">
            Title ES
          </label>
          <input
            id="activity-label-es"
            value={form.label.es}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                label: { ...current.label, es: event.target.value },
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="activity-description-en"
            className="text-sm text-white/70"
          >
            Message EN
          </label>
          <textarea
            id="activity-description-en"
            value={form.description.en}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: {
                  ...current.description,
                  en: event.target.value,
                },
              }))
            }
            className="min-h-28 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="activity-description-es"
            className="text-sm text-white/70"
          >
            Message ES
          </label>
          <textarea
            id="activity-description-es"
            value={form.description.es}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: {
                  ...current.description,
                  es: event.target.value,
                },
              }))
            }
            className="min-h-28 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-lg bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add activity"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-slate-300">Loading activity feed...</p>}

      <div className="grid gap-4">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-orange-300">
              {activity.date}
            </p>
            <div className="grid gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                  EN
                </p>
                <h2 className="text-lg font-semibold">
                  {activity.label_i18n?.en ?? activity.label}
                </h2>
                <p className="text-white/70">
                  {activity.description_i18n?.en ?? activity.description}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                  ES
                </p>
                <h2 className="text-lg font-semibold">
                  {activity.label_i18n?.es ?? activity.label}
                </h2>
                <p className="text-white/70">
                  {activity.description_i18n?.es ?? activity.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void deleteActivity(activity.id);
              }}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
