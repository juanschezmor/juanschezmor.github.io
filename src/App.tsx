import "./App.css";
import AboutMe from "./components/AboutMe";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import WorkExperience from "./components/Experience";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <div>
      <Hero />
      <AboutMe />
      <WorkExperience />
      <TechStack />
      <Projects />
      <Contact />
      <ToastContainer />
    </div>
  );
}

export default App;
