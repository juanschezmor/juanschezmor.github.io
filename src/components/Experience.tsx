import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useExperiences } from "../hooks/useExperiences";

const Experience = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { t, i18n } = useTranslation();
  const { experiences } = useExperiences();
  const language = i18n.resolvedLanguage === "es" ? "es" : "en";

  return (
    <section id="experience" className="experience-section" ref={ref}>
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("experience.eyebrow")}</p>
            <h2 className="title">{t("experience.title")}</h2>
          </div>
        </div>

        {[...experiences]
          .sort((a, b) => b.id - a.id)
          .map((exp, expIndex) => (
            <motion.div
              key={exp.id}
              className="experience-card panel-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: expIndex * 0.3 }}
            >
              <div className="experience-card__header">
                <div>
                  <h3>{exp.company}</h3>
                  <p>{exp.period_i18n?.[language] ?? exp.period}</p>
                </div>
              </div>

              <div className="experience-timeline">
                {[...exp.roles]
                  .sort((a, b) => b.id - a.id)
                  .map((role, roleIndex) => {
                    const title = role.title_i18n?.[language] ?? role.title;
                    const description =
                      role.description_i18n?.[language] ?? role.description;

                    return (
                      <motion.div
                        key={role.id}
                        className="experience-role"
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.5,
                          delay: expIndex * 0.3 + roleIndex * 0.2,
                        }}
                      >
                        <span className="experience-role__dot"></span>

                        <h4>{title}</h4>
                        <ul>
                          {description.map((point, index) => (
                            <li key={`desc-${role.id}-${index}`}>{point}</li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default Experience;
