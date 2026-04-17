import "../styles/projectcard.css";
import { useTranslation } from "react-i18next";
import type { Project } from "../types/Project";

interface ProjectCardProps {
  project: Project;
}

const normalizeUrl = (url?: string) => {
  if (!url || url === "not-available") {
    return null;
  }

  return url.startsWith("http") ? url : `https://${url}`;
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "es" ? "es" : "en";
  const githubLink = normalizeUrl(project.github_link);
  const liveLink = normalizeUrl(project.live_link);
  const canTranslate = i18n.exists(`projects.items.${project.id}.description`);
  const title = project.title_i18n?.[language]
    ? project.title_i18n[language]
    : canTranslate && i18n.exists(`projects.items.${project.id}.title`)
      ? t(`projects.items.${project.id}.title`)
      : project.title;
  const description = project.description_i18n?.[language]
    ? project.description_i18n[language]
    : canTranslate
      ? t(`projects.items.${project.id}.description`)
      : project.description;
  const bulletPoints = project.bullet_points_i18n?.[language]?.length
    ? project.bullet_points_i18n[language]
    : canTranslate
      ? (t(`projects.items.${project.id}.bullet_points`, {
          returnObjects: true,
        }) as string[])
      : project.bullet_points;

  return (
    <div className="project panel-card">
      <div className="project-media">
        {project.image ? (
          <img className="project-image" src={project.image} alt={title} />
        ) : (
          <div className="project-image-placeholder" aria-hidden="true">
            <span>{title}</span>
          </div>
        )}
      </div>

      <div className="project-copy">
        <p className="project-kicker">{t("projects.kicker")}</p>
        <h3>{title}</h3>
        <p className="project-description">{description}</p>

        <div className="project-details">
          <h6>{t("projects.highlights")}</h6>
          <ul>
            {bulletPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="links">
          {githubLink && (
            <a
              href={githubLink}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-square-github"></i>
              <span>{t("projects.code")}</span>
            </a>
          )}
          {liveLink && (
            <a
              href={liveLink}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-link"></i>
              <span>{t("projects.live")}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
