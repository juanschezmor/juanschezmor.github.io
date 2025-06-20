import { useEffect, useState } from "react";
import { skills, skillsCategories } from "../constants";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "../styles/tech-stack.css";

const logos = import.meta.glob("../assets/logos/*.png", {
  eager: true,
  as: "url",
});

const getLogoUrl = (skill: string) => {
  return logos[`../assets/logos/${skill}.png`];
};

function TechStack() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const handleChangeCategory = (category: string) => {
    setActiveCategory(category);
  };

  const handleMouseEnter = (skill: string) => {
    setHoveredSkill(skill);
  };

  const handleMouseLeave = () => {
    setHoveredSkill(null);
  };

  useEffect(() => {
    console.log("Active Category: ", activeCategory);
  }, [activeCategory]);

  return (
    <article id="tech-stack" className="tech-stack" ref={ref}>
      <div className="title-container">
        <h3 className="title">Tech Stack</h3>
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
              {category}
            </button>
          ))}
        </div>

        <div className="skills-container">
          {skills
            .filter(
              (skill) =>
                activeCategory === "All" || skill.category === activeCategory
            )
            .map((skill, index) => (
              <motion.button
                key={skill.skill}
                onMouseEnter={() => handleMouseEnter(skill.skill)}
                onMouseLeave={handleMouseLeave}
                className="skill"
                aria-label={skill.skill}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.15 }}
              >
                <img
                  className="logo"
                  src={getLogoUrl(skill.skill)}
                  alt={skill.skill}
                />
                {hoveredSkill === skill.skill && (
                  <span className="skill-alt">{skill.skill}</span>
                )}
              </motion.button>
            ))}
        </div>
      </div>
    </article>
  );
}

export default TechStack;
