import ProjectCard from './ProjectCard.jsx';
import '../styles/projects.css';
import { projects } from '../constants.js';
import { useEffect, useState } from 'react';

const Projects = () => {
  const [shownProject, setShownProject] = useState(projects[0]);

  const handleNextProject = () => {
    const currentIndex = projects.indexOf(shownProject);
    const nextIndex = (currentIndex + 1) % projects.length;
    setShownProject(projects[nextIndex]);
  };

  const handlePreviousProject = () => {
    const currentIndex = projects.indexOf(shownProject);
    const previousIndex =
      (currentIndex - 1 + projects.length) % projects.length;
    setShownProject(projects[previousIndex]);
  };
  useEffect(() => {
    console.log('PRoject shown', shownProject);
  }, [shownProject]);

  return (
    <article id="projects" className="container-fluid projects">
      <div className="row w-100 h-100">
        <div className="container">
          <h2 className="title text-center mt-3">Projects</h2>
          <p>Here are some of the projects I've worked on.</p>
        </div>
        <div className="row w-100 projects-container">
          <ProjectCard project={shownProject} client:load />
          <div className="row buttons-container">
            <button onClick={handlePreviousProject} className=" col-4 previous">
              <i className="fa-solid fa-backward"></i>
            </button>
            <span className="col-3">
              {projects.indexOf(shownProject) + 1} out of {projects.length}
            </span>
            <button onClick={handleNextProject} className="col-4 next">
              <i className="fa-solid fa-forward"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
export default Projects;
