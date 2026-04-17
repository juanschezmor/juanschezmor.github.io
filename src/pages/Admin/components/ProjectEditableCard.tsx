import type { FC } from "react";
import type { Project } from "../../../types/Project";

interface Props {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectEditableCard: FC<Props> = ({ project, onEdit, onDelete }) => {
  const englishTitle = project.title_i18n?.en ?? project.title;
  const spanishTitle = project.title_i18n?.es ?? project.title;
  const englishDescription =
    project.description_i18n?.en ?? project.description;
  const spanishDescription = project.description_i18n?.es ?? project.description;
  const englishBullets = project.bullet_points_i18n?.en ?? project.bullet_points;
  const spanishBullets = project.bullet_points_i18n?.es ?? project.bullet_points;

  return (
    <div className="grid w-full gap-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.22)] lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="flex items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-3">
        {project.image ? (
          <img
            src={project.image}
            alt={englishTitle}
            className="max-h-44 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold text-slate-100">
              {englishTitle}
            </h3>
            <div className="flex items-center gap-4">
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-slate-400 transition hover:text-orange-200"
                >
                  <i className="fa-brands fa-github"></i>
                </a>
              )}
              {project.live_link && project.live_link !== "not-available" && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-slate-400 transition hover:text-orange-200"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                EN
              </p>
              <p className="mb-3 text-slate-300">{englishDescription}</p>
              {Array.isArray(englishBullets) && englishBullets.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
                  {englishBullets.map((point) => (
                    <li key={`en-${project.id}-${point}`}>{point}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                ES
              </p>
              <p className="mb-3 text-slate-300">{spanishDescription}</p>
              {Array.isArray(spanishBullets) && spanishBullets.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
                  {spanishBullets.map((point) => (
                    <li key={`es-${project.id}-${point}`}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">ES title: {spanishTitle}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditableCard;
