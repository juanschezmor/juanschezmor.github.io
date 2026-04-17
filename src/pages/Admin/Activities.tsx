import { useMemo, useState } from "react";
import { formatActivityDateLabel } from "../../formatters/activityDates";
import { useActivities } from "../../hooks/useActivities";

const initialForm = {
  start_date: "",
  end_date: "",
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
  const [mode, setMode] = useState<"manage" | "create">("manage");
  const [query, setQuery] = useState("");
  const datePreview = useMemo(
    () =>
      formatActivityDateLabel({
        start_date: form.start_date,
        end_date: form.end_date || undefined,
      }),
    [form.end_date, form.start_date]
  );

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activities;
    }

    return activities.filter((activity) =>
      [
        activity.date,
        activity.label_i18n?.en ?? activity.label,
        activity.label_i18n?.es ?? activity.label,
        activity.description_i18n?.en ?? activity.description,
        activity.description_i18n?.es ?? activity.description,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [activities, query]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createActivity({
        start_date: form.start_date,
        end_date: form.end_date || undefined,
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
      setMode("manage");
    } catch {
      // Error state is handled in context.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 text-white">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Activity feed</h2>
          <p className="mt-1 text-sm text-slate-400">
            Search the timeline and keep creation separate from the feed list.
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
            <h3 className="text-lg font-semibold text-white">Add activity</h3>
            <p className="text-sm text-slate-400">
              Write the update once, then jump back to the feed.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="activity-start-date"
                className="text-sm text-white/70"
              >
                Start month
              </label>
              <input
                id="activity-start-date"
                type="month"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_date: event.target.value,
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="activity-end-date"
                className="text-sm text-white/70"
              >
                End month
              </label>
              <input
                id="activity-end-date"
                type="month"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    end_date: event.target.value,
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
              />
              <p className="text-xs text-slate-500">
                Optional. Leave empty for a single-month activity.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Generated date label
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {datePreview || "Select a start month to preview the date range."}
              </p>
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="min-h-32 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="min-h-32 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add activity"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-white transition hover:border-white/25 hover:bg-white/5"
              onClick={() => setMode("manage")}
            >
              Back to feed
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {activities.length} total update{activities.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search by date, title or message.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search activity"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white lg:w-80"
              />
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950"
                onClick={() => setMode("create")}
              >
                New activity
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {loading && <p className="text-slate-300">Loading activity feed...</p>}

          {!loading && filteredActivities.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
              {query ? "No activity entries match that search." : "No activity found."}
            </div>
          ) : (
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1">
              {filteredActivities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                >
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-orange-300">
                    {activity.date}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        EN
                      </p>
                      <h3 className="text-lg font-semibold">
                        {activity.label_i18n?.en ?? activity.label}
                      </h3>
                      <p className="mt-2 text-white/70">
                        {activity.description_i18n?.en ?? activity.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        ES
                      </p>
                      <h3 className="text-lg font-semibold">
                        {activity.label_i18n?.es ?? activity.label}
                      </h3>
                      <p className="mt-2 text-white/70">
                        {activity.description_i18n?.es ?? activity.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void deleteActivity(activity.id);
                    }}
                    className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
