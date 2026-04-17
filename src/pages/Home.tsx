import AboutMe from "../components/AboutMe";
import Activity from "../components/Activity";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Contact from "../components/Contact";
import WorkExperience from "../components/Experience";
import "react-toastify/dist/ReactToastify.css";
function Home() {
  return (
    <div>
      <Hero />
      <Activity />
      <AboutMe />
      <WorkExperience />
      <Projects />
      <TechStack />
      <Contact />
    </div>
  );
}

export default Home;
