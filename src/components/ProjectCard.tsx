import "../styles/projectcard.css";
import type { Props } from "../types/Project";

const ProjectCard = ({ project }: Props) => {
  return (
    <div className="project w-full flex flex-col md:flex-row gap-6 items-start justify-center">
      {/* Imagen */}
      <div className="w-full md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
        <img
          className="max-w-full h-auto object-contain"
          src={project.image}
          alt={project.title}
        />
      </div>

      {/* Info */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <h3>{project.title}</h3>
        <p className="text-left">{project.description}</p>

        <div>
          <h6>Technologies Used:</h6>
          <ul className="list-disc list-inside">
            {project.bullet_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Enlaces */}
        <div className="links flex gap-6 mt-2">
          <a href={project.github_link} className="project-url text-xl">
            <i className="fa-brands fa-square-github"></i>
          </a>
          {project.live_link !== "not-available" && (
            <a href={project.live_link} className="text-xl">
              <i className="fa-solid fa-link"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
