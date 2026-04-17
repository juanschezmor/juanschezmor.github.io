import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./router";
import "./App.css";
import { ActivityProvider } from "./context/Activity/ActivityContext";
import { ExperienceProvider } from "./context/Experience/ExperienceContext";
import { ProjectProvider } from "./context/Project/ProjectContext";
import { SkillProvider } from "./context/Skill/SkillContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

type Theme = "dark" | "light";

function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("portfolio-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return (
    <ProjectProvider>
      <ActivityProvider>
        <ExperienceProvider>
          <SkillProvider>
            <div className="app-shell">
              <Header
                theme={theme}
                onToggleTheme={() =>
                  setTheme((currentTheme) =>
                    currentTheme === "dark" ? "light" : "dark"
                  )
                }
              />
              <AppRouter />
              <Footer />
              <ToastContainer />
            </div>
          </SkillProvider>
        </ExperienceProvider>
      </ActivityProvider>
    </ProjectProvider>
  );
}

export default App;
