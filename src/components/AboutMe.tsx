import "../styles/about-me.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";

function AboutMe() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { t } = useTranslation();
  const paragraphs = t("about.paragraphs", { returnObjects: true }) as string[];

  return (
    <article id="about-me" className="about-me" ref={ref}>
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("about.eyebrow")}</p>
            <h2 className="title">{t("about.title")}</h2>
          </div>
        </div>

        <div className="about-layout">
          <motion.div
            className="bio panel-card"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h3>{t("about.aboutTitle")}</h3>
            <div className="about-copy">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="about-side"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <div className="about-sidecard panel-card">
              <h3>{t("about.sideTitle")}</h3>
              <div className="about-points">
                <div>
                  <span>{t("about.current")}</span>
                  <p>{t("about.currentCopy")}</p>
                </div>
                <div>
                  <span>{t("about.learning")}</span>
                  <p>{t("about.learningCopy")}</p>
                </div>
                <div>
                  <span>{t("about.next")}</span>
                  <p>{t("about.nextCopy")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export default AboutMe;
