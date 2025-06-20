import "./App.css";
import AboutMe from "./components/AboutMe";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import WorkExperience from "./components/Experience";

function App() {
  return (
    <div>
      <Hero />
      <AboutMe />
      <WorkExperience />
      <TechStack />
      <Projects />
      <Contact />
    </div>
  );
}

export default App;
