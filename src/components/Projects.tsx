import ProjectCard from "./ProjectCard";
import "../styles/projects.css";
import { projects } from "../constants";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Projects = () => {
  const [shownProject, setShownProject] = useState(projects[0]);
  const [direction, setDirection] = useState(0);

  const handleNextProject = () => {
    const currentIndex = projects.indexOf(shownProject);
    const nextIndex = (currentIndex + 1) % projects.length;
    setDirection(1);
    setShownProject(projects[nextIndex]);
  };

  const handlePreviousProject = () => {
    const currentIndex = projects.indexOf(shownProject);
    const previousIndex =
      (currentIndex - 1 + projects.length) % projects.length;
    setDirection(-1);
    setShownProject(projects[previousIndex]);
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
    <article id="projects" className="projects w-full h-full px-4 py-12">
      <div className="flex flex-col items-center justify-center w-full h-full gap-6">
        <div className="container text-center">
          <h2 className="title mb-2">Projects</h2>
          <p>Here are some of the projects I've worked on.</p>
        </div>

        <div className="projects-container w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={shownProject.title}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center items-center"
            >
              <ProjectCard project={shownProject} />
            </motion.div>
          </AnimatePresence>

          <div className="buttons-container flex items-center justify-center gap-6">
            <button
              onClick={handlePreviousProject}
              className="previous text-xl hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-backward"></i>
            </button>

            <span className="font-mono text-sm">
              {projects.indexOf(shownProject) + 1} out of {projects.length}
            </span>

            <button
              onClick={handleNextProject}
              className="next text-xl hover:scale-110 transition-transform"
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
