import { useId } from "react";
import logo from "../assets/logo.png";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getResumeDownloadUrl } from "../api/resumes";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

const FlagIcon = ({ language }: { language: "en" | "es" }) => {
  const clipPathId = useId();

  if (language === "es") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="language-toggle__flag-icon"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="12" fill="#C60B1E" />
        <path d="M0 6h24v12H0z" fill="#FFC400" />
        <circle
          cx="12"
          cy="12"
          r="12"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.75"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="language-toggle__flag-icon"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipPathId}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipPathId})`}>
        <rect width="24" height="24" fill="#012169" />
        <path d="M-2 2h8l20 20h-8zM26 2h-8L-2 22h8z" fill="#FFF" />
        <path
          d="M-2 3.5h4.2L26 21.8v2.2h-4.2zM26 3.5h-4.2L-2 21.8v2.2h4.2z"
          fill="#C8102E"
        />
        <path d="M9 0h6v24H9zM0 9h24v6H0z" fill="#FFF" />
        <path d="M10.2 0h3.6v24h-3.6zM0 10.2h24v3.6H0z" fill="#C8102E" />
      </g>
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.75"
      />
    </svg>
  );
};

const Header = ({ theme, onToggleTheme }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "es" ? "es" : "en";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="site-brand">
          <img
            src={logo}
            alt={"Juan S\u00E1nchez Moreno logo"}
            className="site-brand__logo"
          />
          <div className="site-brand__copy">
            <span>{"Juan S\u00E1nchez Moreno"}</span>
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
            className="site-header__cta"
            aria-label={t("hero.ctas.cv")}
            href={getResumeDownloadUrl(language)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              toast.success(t("hero.cvToast"), {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }}
          >
            <span className="site-header__cta-icon" aria-hidden="true">
              ↓
            </span>
            <span>{t("hero.ctas.cv")}</span>
          </a>
          <button
            type="button"
            className="language-toggle"
            onClick={() => i18n.changeLanguage(language === "en" ? "es" : "en")}
            aria-label={t("header.languageLabel")}
          >
            <span className="language-toggle__track" aria-hidden="true">
              <span className="language-toggle__flag language-toggle__flag--left">
                <FlagIcon language="en" />
              </span>
              <span className="language-toggle__flag language-toggle__flag--right">
                <FlagIcon language="es" />
              </span>
              <span
                className={`language-toggle__thumb ${
                  language === "es" ? "language-toggle__thumb--es" : ""
                }`}
              >
                <span className="language-toggle__thumb-flag">
                  <FlagIcon language={language} />
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
                {theme === "dark" ? "\u{1F319}" : "\u2600\uFE0F"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
