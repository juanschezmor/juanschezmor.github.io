import '../styles/projectcard.css';

const ProjectCard = ({ project }) => {
  return (
    <div className="project">
      <div className="row">
        <div className="col-sm-11 d-flex d-md-block justify-content-center align-items-center col-md-6 mb-4">
          <img className="img-fluid" src={project.image} alt={project.title} />
        </div>
        <div className="col-sm-11 col-md-6">
          <div className="row">
            <h3>{project.title}</h3>
          </div>
          <div className="row">
            <p className="text-start">{project.description}</p>
          </div>
          <div className="row">
            <h6>Technologies Used:</h6>
            {project.bullet_points.map((point, index) => {
              return <li key={index}>{point}</li>;
            })}
          </div>
          <div className="row links">
            <div className="col-md-5 col-sm-11">
              <a href={project.github_link} className="project-url">
                <i className="fa-brands fa-square-github"></i>
              </a>
            </div>
            {project.live_link === 'not-available' ? null : (
              <div className="col-5">
                <a href={project.live_link}>
                  <i className="fa-solid fa-link"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
