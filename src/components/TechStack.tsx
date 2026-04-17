import { useState } from "react";
import { skills, skillsCategories } from "../constants";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import "../styles/tech-stack.css";
import { useSkills } from "../hooks/useSkills";
import { resolveSkillVisual } from "../skill-icons";

function TechStack() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const { skills: dynamicSkills } = useSkills();
  const { t } = useTranslation();
  const availableSkills = dynamicSkills.length > 0 ? dynamicSkills : skills;

  const handleChangeCategory = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <article id="tech-stack" className="tech-stack" ref={ref}>
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("stack.eyebrow")}</p>
            <h2 className="title">{t("stack.title")}</h2>
          </div>
          <p className="section-copy">{t("stack.copy")}</p>
        </div>

        <div className="tech-container">
          <div className="categories-container">
            {skillsCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleChangeCategory(category)}
                className={`category ${
                  activeCategory === category
                    ? "active-category"
                    : "inactive-category"
                }`}
              >
                {t(`stack.categories.${category.toLowerCase()}`)}
              </button>
            ))}
          </div>

          <div className="skills-container">
            {availableSkills
              .filter(
                (skill) =>
                  activeCategory === "All" || skill.category === activeCategory
              )
              .map((skill, index) => {
                const visual = resolveSkillVisual(skill.skill);
                const Icon = visual.icon;

                return (
                  <motion.button
                    key={skill.id}
                    className="skill"
                    aria-label={skill.skill}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.06 }}
                  >
                    <span
                      className="skill-icon"
                      style={{ color: visual.color }}
                      aria-hidden="true"
                    >
                      <Icon />
                    </span>
                    <span className="skill-name">{skill.skill}</span>
                  </motion.button>
                );
              })}
          </div>
        </div>
      </div>
    </article>
  );
}

export default TechStack;
