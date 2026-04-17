import logo from "../assets/logo.png";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

const Header = ({ theme, onToggleTheme }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "es" ? "es" : "en";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="site-brand">
          <img
            src={logo}
            alt="Juan Sánchez Moreno logo"
            className="site-brand__logo"
          />
          <div className="site-brand__copy">
            <span>Juan Sánchez Moreno</span>
            <small>{t("header.role")}</small>
          </div>
        </a>

        <nav className="site-nav">
          <a href="#activity">{t("header.nav.activity")}</a>
          <a href="#about-me">{t("header.nav.about")}</a>
          <a href="#experience">{t("header.nav.experience")}</a>
          <a href="#projects">{t("header.nav.projects")}</a>
          <a href="#tech-stack">{t("header.nav.stack")}</a>
          <a href="#contact">{t("header.nav.contact")}</a>
        </nav>

        <div className="site-header__controls">
          <a
            href="/Juan-Sanchez-Moreno-CV.pdf"
            download="Juan_Sanchez_CV.pdf"
            className="site-header__cta"
          >
            CV
          </a>
          <button
            type="button"
            className="language-toggle"
            onClick={() => i18n.changeLanguage(language === "en" ? "es" : "en")}
            aria-label={t("header.languageLabel")}
          >
            <span className="language-toggle__track" aria-hidden="true">
              <span className="language-toggle__flag language-toggle__flag--left">
                🇬🇧
              </span>
              <span className="language-toggle__flag language-toggle__flag--right">
                🇪🇸
              </span>
              <span
                className={`language-toggle__thumb ${
                  language === "es" ? "language-toggle__thumb--es" : ""
                }`}
              >
                <span className="language-toggle__thumb-flag">
                  {language === "es" ? "🇪🇸" : "🇬🇧"}
                </span>
              </span>
            </span>
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark"
                ? t("header.themeToLight")
                : t("header.themeToDark")
            }
          >
            <span className="theme-toggle__track" aria-hidden="true">
              <span className="theme-toggle__icon">
                {theme === "dark" ? "🌙" : "☀️"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
