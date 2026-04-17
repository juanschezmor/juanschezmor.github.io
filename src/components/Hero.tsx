import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Github from "../icons/Github";
import Linkedin from "../icons/Linkedin";
import Mail from "../icons/Mail";
import "../styles/hero.css";
import "react-toastify/dist/ReactToastify.css";

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/juanschezmor/",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    href: "https://github.com/juanschezmor",
    icon: Github,
  },
  {
    label: "Mail",
    href: "mailto:juanschezmor@gmail.com",
    icon: Mail,
  },
];

const Hero = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 });
  const { t } = useTranslation();
  const heroPoints = t("hero.points", { returnObjects: true }) as string[];

  return (
    <article ref={ref} className="home hero-desktop">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-orb hero-orb--left" aria-hidden="true" />
      <div className="hero-orb hero-orb--right" aria-hidden="true" />

      <div className="hero-shell">
        <motion.div
          className="hero-window"
          initial={{ opacity: 0, y: 36, scale: 0.985 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="hero-window__bar">
            <div className="hero-window__lights" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="hero-window__content hero-window__content--single">
            <div className="hero-copy">
              <h1>
                <span className="hero-title__name">Juan Sánchez</span>
                <span className="hero-title__role">{t("hero.role")}</span>
              </h1>
              <p className="hero-subtitle">{t("hero.subtitle")}</p>

              <ul className="hero-points">
                {heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <p className="hero-current">{t("hero.current")}</p>

              <div className="hero-actions">
                <a className="btn-primary" href="#projects">
                  {t("hero.ctas.projects")}
                </a>
                <a className="btn-secondary" href="#contact">
                  {t("hero.ctas.contact")}
                </a>
                <a
                  className="btn-ghost"
                  href="/Juan-Sanchez-Moreno-CV.pdf"
                  download="Juan_Sanchez_CV.pdf"
                  onClick={() =>
                    toast.success(t("hero.cvToast"), {
                      position: "top-center",
                      autoClose: 3000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    })
                  }
                >
                  {t("hero.ctas.cv")}
                </a>
              </div>
            </div>

            <motion.aside
              className="hero-signal"
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
            >
              <div className="hero-signal__bar">
                <span className="hero-signal__prompt">C:\juan\profile\cmd.exe</span>
                <span className="hero-signal__status">{t("hero.signal.running")}</span>
              </div>

              <div className="hero-signal__body">
                <div className="hero-signal__line">
                  <span className="hero-signal__cmd">C:\juan&gt; whoami</span>
                  <p>{t("hero.signal.whoami")}</p>
                </div>

                <div className="hero-signal__line">
                  <span className="hero-signal__cmd">C:\juan&gt; exp --years</span>
                  <p>{t("hero.signal.years")}</p>
                </div>

                <div className="hero-signal__line">
                  <span className="hero-signal__cmd">C:\juan&gt; where</span>
                  <p>{t("hero.signal.where")}</p>
                </div>

                <div className="hero-signal__line">
                  <span className="hero-signal__cmd">C:\juan&gt; tech stack --main</span>
                  <p>{t("hero.signal.stack")}</p>
                </div>

                <div className="hero-signal__line">
                  <span className="hero-signal__cmd">C:\juan&gt; mindset</span>
                  <p>{t("hero.signal.mindset")}</p>
                </div>

                <div className="hero-signal__line hero-signal__line--cursor">
                  <span className="hero-signal__cmd hero-signal__cmd--cursor">C:\juan&gt;</span>
                  <span className="hero-signal__cursor" aria-hidden="true" />
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>

        <motion.div
          className="hero-dock"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="hero-dock__group">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="hero-dock__item"
                aria-label={label}
              >
                <Icon width="24px" height="24px" />
              </a>
            ))}
          </div>

          <a className="hero-dock__resume" href="#about-me">
            {t("hero.dock")}
          </a>
        </motion.div>
      </div>
    </article>
  );
};

export default Hero;
