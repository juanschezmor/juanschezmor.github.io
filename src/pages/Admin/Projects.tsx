import { useMemo, useState } from "react";
import { getMutationErrorMessage } from "../../api/client";
import { uploadProjectImage } from "../../api/projectImages";
import {
  projectImageAccept,
  projectImageMaxBytes,
} from "../../config/projectImages";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"manage" | "editor">("manage");
  const [query, setQuery] = useState("");

  const actionLabel = useMemo(
    () => (editingId ? "Update project" : "Add project"),
    [editingId]
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return projects;
    }

    return projects.filter((project) => {
      const englishTitle = project.title_i18n?.en ?? project.title;
      const spanishTitle = project.title_i18n?.es ?? project.title;
      const englishDescription =
        project.description_i18n?.en ?? project.description;
      const spanishDescription =
        project.description_i18n?.es ?? project.description;

      return [
        englishTitle,
        spanishTitle,
        englishDescription,
        spanishDescription,
        project.github_link ?? "",
        project.live_link ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [projects, query]);

  const resetEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageUploadError(null);
  };

  const projectImagePreview = form.image.trim();

  const handleProjectImageSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > projectImageMaxBytes) {
      setImageUploadError(
        `Image is too large. Maximum size is ${Math.round(
          projectImageMaxBytes / (1024 * 1024)
        )} MB.`
      );
      return;
    }

    setUploadingImage(true);
    setImageUploadError(null);

    try {
      const asset = await uploadProjectImage(selectedFile);
      setForm((current) => ({
        ...current,
        image: asset.url,
      }));
    } catch (error) {
      setImageUploadError(getMutationErrorMessage("upload project image", error));
    } finally {
      setUploadingImage(false);
    }
  };

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
          <h2 className="text-xl font-semibold text-white">Project workspace</h2>
          <p className="mt-1 text-sm text-slate-400">
            Switch between a compact list and the editor instead of stacking both.
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
              if (!editingId) {
                resetEditor();
              }
              setMode("editor");
            }}
          >
            {editingId ? "Edit" : "Create"}
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
              <h3 className="text-lg font-semibold text-white">{actionLabel}</h3>
              <p className="text-sm text-slate-400">
                Fill both languages here and return to the list when saved.
              </p>
            </div>

            {editingId && (
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
              <label className="text-sm text-white/70">Title EN</label>
              <input
                value={form.title.en}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: { ...current.title, en: event.target.value },
                  }))
                }
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Bullet points EN</label>
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
                className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Bullet points ES</label>
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
                placeholder="Un punto por linea"
                className="min-h-28 rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
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
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="text-sm text-white/70">Project image</label>
                <p className="mt-1 text-xs text-slate-500">
                  Upload to AWS from here or paste a manual URL below.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5">
                <input
                  type="file"
                  accept={projectImageAccept}
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    void handleProjectImageSelection(event);
                  }}
                />
                {uploadingImage ? "Uploading..." : "Upload image"}
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-3">
                {projectImagePreview ? (
                  <img
                    src={projectImagePreview}
                    alt="Project preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
                    No image selected
                  </div>
                )}
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
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
                  placeholder="https://..."
                />
                <p className="text-xs text-slate-500">
                  Managed uploads will fill this field automatically with the S3 URL.
                </p>
                {imageUploadError && (
                  <p className="text-sm text-red-400">{imageUploadError}</p>
                )}
                {projectImagePreview && (
                  <button
                    type="button"
                    className="mt-1 w-fit rounded-xl border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/25 hover:bg-white/5"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        image: "",
                      }))
                    }
                  >
                    Clear image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
            >
              {submitting ? "Saving..." : actionLabel}
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
                {projects.length} total project{projects.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search by title, description or link.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects"
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
                New project
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {loading && <p className="text-slate-300">Loading projects...</p>}

          {!loading && filteredProjects.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
              {query ? "No projects match that search." : "No projects found."}
            </div>
          ) : (
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1">
              {filteredProjects.map((project) => (
                <ProjectEditableCard
                  key={project.id}
                  project={project}
                  onEdit={() => {
                    setEditingId(project.id);
                    setForm(mapProjectToForm(project));
                    setMode("editor");
                  }}
                  onDelete={() => {
                    void deleteProject(project.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
