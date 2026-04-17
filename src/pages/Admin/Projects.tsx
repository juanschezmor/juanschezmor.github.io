import { useMemo, useState } from "react";
import { useProjects } from "../../hooks/useProjects";
import ProjectEditableCard from "./components/ProjectEditableCard";
import type { Project } from "../../types/Project";

const emptyForm = {
  title: { en: "", es: "" },
  description: { en: "", es: "" },
  bullet_points: { en: "", es: "" },
  github_link: "",
  live_link: "",
  image: "",
};

const mapProjectToForm = (project: Project) => ({
  title: {
    en: project.title_i18n?.en ?? project.title,
    es: project.title_i18n?.es ?? project.title,
  },
  description: {
    en: project.description_i18n?.en ?? project.description,
    es: project.description_i18n?.es ?? project.description,
  },
  bullet_points: {
    en: (project.bullet_points_i18n?.en ?? project.bullet_points).join("\n"),
    es: (project.bullet_points_i18n?.es ?? project.bullet_points).join("\n"),
  },
  github_link: project.github_link ?? "",
  live_link: project.live_link ?? "",
  image: project.image ?? "",
});

export default function Projects() {
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    loading,
    error,
  } = useProjects();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const actionLabel = useMemo(
    () => (editingId ? "Update project" : "Add project"),
    [editingId]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      title: {
        en: form.title.en.trim(),
        es: form.title.es.trim(),
      },
      description: {
        en: form.description.en.trim(),
        es: form.description.es.trim(),
      },
      bullet_points: {
        en: form.bullet_points.en
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        es: form.bullet_points.es
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
      github_link: form.github_link.trim() || undefined,
      live_link: form.live_link.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-slate-300">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 mb-8"
      >
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Title EN</label>
          <input
            value={form.title.en}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: { ...current.title, en: event.target.value },
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Title ES</label>
          <input
            value={form.title.es}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: { ...current.title, es: event.target.value },
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Description EN</label>
          <textarea
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
            className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Description ES</label>
          <textarea
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
            className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">
            Bullet points EN
          </label>
          <textarea
            value={form.bullet_points.en}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                bullet_points: {
                  ...current.bullet_points,
                  en: event.target.value,
                },
              }))
            }
            placeholder="One point per line"
            className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">
            Bullet points ES
          </label>
          <textarea
            value={form.bullet_points.es}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                bullet_points: {
                  ...current.bullet_points,
                  es: event.target.value,
                },
              }))
            }
            placeholder="Un punto por línea"
            className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">GitHub link</label>
          <input
            value={form.github_link}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                github_link: event.target.value,
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Live link</label>
          <input
            value={form.live_link}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                live_link: event.target.value,
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Image URL</label>
          <input
            value={form.image}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                image: event.target.value,
              }))
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-lg bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Saving..." : actionLabel}
          </button>

          {editingId && (
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
      {projects.length === 0 && <p className="text-slate-300">No projects found.</p>}

      <ul className="space-y-4">
        {projects.map((project) => (
          <ProjectEditableCard
            key={project.id}
            project={project}
            onEdit={() => {
              setEditingId(project.id);
              setForm(mapProjectToForm(project));
            }}
            onDelete={() => {
              deleteProject(project.id);
            }}
          />
        ))}
      </ul>
    </div>
  );
}
