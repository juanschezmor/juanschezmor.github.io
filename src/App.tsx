import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./router";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppProviders from "./components/AppProviders";

type Theme = "dark" | "light";

function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = globalThis.localStorage.getItem("portfolio-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    globalThis.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return (
    <AppProviders>
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
    </AppProviders>
  );
}

export default App;
