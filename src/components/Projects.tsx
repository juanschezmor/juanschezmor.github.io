import ProjectCard from "./ProjectCard";
import "../styles/projects.css";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useProjects } from "../hooks/useProjects";
import { projects as fallbackProjects } from "../constants";
import type { Project } from "../types/Project";

const Projects = () => {
  const { projects, loading, error } = useProjects();
  const { t } = useTranslation();
  const activeProjects = useMemo(
    () => (projects.length > 0 ? projects : fallbackProjects),
    [projects]
  );
  const [shownProject, setShownProject] = useState<Project>(activeProjects[0]);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setShownProject(activeProjects[0]);
  }, [activeProjects]);

  const handleNextProject = () => {
    const currentIndex = activeProjects.findIndex(
      (project) => project.id === shownProject.id
    );
    const nextIndex = (currentIndex + 1) % activeProjects.length;
    setDirection(1);
    setShownProject(activeProjects[nextIndex]);
  };

  const handlePreviousProject = () => {
    const currentIndex = activeProjects.findIndex(
      (project) => project.id === shownProject.id
    );
    const previousIndex =
      (currentIndex - 1 + activeProjects.length) % activeProjects.length;
    setDirection(-1);
    setShownProject(activeProjects[previousIndex]);
  };

  const slideVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <article id="projects" className="projects">
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("projects.eyebrow")}</p>
            <h2 className="title">{t("projects.title")}</h2>
          </div>
          <p className="section-copy">{t("projects.copy")}</p>
        </div>

        <div className="projects-status">
          <p>{loading ? t("projects.loading") : error ? t("projects.fallback") : ""}</p>
        </div>

        <div className="projects-container">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={shownProject.id}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="projects-stage"
            >
              <ProjectCard project={shownProject} />
            </motion.div>
          </AnimatePresence>

          <div className="buttons-container">
            <button
              onClick={handlePreviousProject}
              className="previous"
              aria-label={t("projects.previous")}
            >
              <i className="fa-solid fa-backward"></i>
            </button>

            <span>
              {t("projects.counter", {
                current:
                  activeProjects.findIndex(
                    (project) => project.id === shownProject.id
                  ) + 1,
                total: activeProjects.length,
              })}
            </span>

            <button
              onClick={handleNextProject}
              className="next"
              aria-label={t("projects.next")}
            >
              <i className="fa-solid fa-forward"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Projects;
