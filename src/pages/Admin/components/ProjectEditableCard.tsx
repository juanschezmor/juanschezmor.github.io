import type { FC } from "react";
import type { Project } from "../../../types/Project";

interface Props {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectEditableCard: FC<Props> = ({ project, onEdit, onDelete }) => {
  const englishTitle = project.title_i18n?.en ?? project.title;
  const spanishTitle = project.title_i18n?.es ?? project.title;
  const englishDescription =
    project.description_i18n?.en ?? project.description;
  const spanishDescription = project.description_i18n?.es ?? project.description;

  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_rgba(2,6,23,0.22)] md:flex-row">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <img
          src={project.image}
          alt={englishTitle}
          className="rounded-lg max-h-64 object-contain"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
        <div>
          <h3 className="mb-2 text-2xl font-semibold text-slate-100">
            {englishTitle}
          </h3>
          <p className="mb-1 text-sm font-medium text-slate-500">ES</p>
          <p className="mb-4 text-slate-300">{spanishTitle}</p>
          <p className="mb-1 text-sm font-medium text-slate-500">EN</p>
          <p className="mb-3 text-slate-300">{englishDescription}</p>
          <p className="mb-1 text-sm font-medium text-slate-500">ES</p>
          <p className="mb-4 text-slate-300">{spanishDescription}</p>

          {Array.isArray(project.bullet_points) &&
            project.bullet_points.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                {project.bullet_points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
        </div>

        <div className="flex items-center gap-4 mt-2">
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

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onEdit(project.id)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditableCard;
