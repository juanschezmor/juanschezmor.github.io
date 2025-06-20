import Linkedin from "../icons/Linkedin";
import Github from "../icons/Github";
import Mail from "../icons/Mail";
import "../styles/socials.css"; // Assuming you have some styles for the Socials component
const Socials = () => {
  return (
    <div className="socials">
      <a
        href="https://www.linkedin.com/in/juanschezmor/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin width="25px" height="25px" />
      </a>
      <a
        href="https://github.com/juanschezmor"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github width="25px" height="25px" />
      </a>
      <a href="mailto:juanschezmor@gmail.com">
        <Mail width="25px" height="25px" />
      </a>
    </div>
  );
};

export default Socials;
