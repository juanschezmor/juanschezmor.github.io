import React, { useEffect, useState } from 'react';
import { skills, skillsCategories } from '../constants';
import '../styles/tech-stack.css';

function TechStack() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const handleChangeCategory = (category) => {
    setActiveCategory(category);
  };

  const handleMouseEnter = (skill) => {
    setHoveredSkill(skill);
  };

  const handleMouseLeave = () => {
    setHoveredSkill(null);
  };

  useEffect(() => {
    console.log('Active Category: ', activeCategory);
  }, [activeCategory]);

  return (
    <article id="tech-stack" className="tech-stack">
      <div className="row title-container">
        <h3 className="title">Tech Stack</h3>
      </div>

      <div className="tech-container">
        <div className="row categories-container">
          {skillsCategories.map((category) => (
            <button
              className={`col-md-2 col-sm-10 category inactive-category ${
                activeCategory === category ? 'active-category' : ''
              }`}
              onClick={() => handleChangeCategory(category)}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="row skills-container">
          {skills
            .filter(
              (skill) =>
                activeCategory === 'All' || skill.category === activeCategory
            )
            .map((skill) => (
              <div
                className="skill"
                key={skill.skill}
                onMouseEnter={() => handleMouseEnter(skill.skill)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  className="logo"
                  src={`logos/${skill.skill}.png`}
                  alt={skill.skill}
                />
                {hoveredSkill === skill.skill && (
                  <div className="skill-alt">{skill.skill}</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}

export default TechStack;
