import { experiences } from "../constants";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Experience = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section
      id="experience"
      className="w-full px-6 py-16 bg-[var(--accent-color)] text-[var(--secondary-text-color)] font-mono"
      ref={ref}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl mb-10 text-center font-bold">
          Work Experience
        </h2>

        {[...experiences]
          .sort((a, b) => b.id - a.id)
          .map((exp, expIndex) => (
            <motion.div
              key={exp.id}
              className="mb-10 bg-[var(--secondary-text-color)] text-[var(--text-color)] p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: expIndex * 0.3 }}
            >
              <h3 className="text-xl font-bold">{exp.company}</h3>
              <p className="text-sm italic mb-4">{exp.period}</p>

              <div className="relative border-l-2 border-[var(--primary-color)] pl-6">
                {[...exp.roles]
                  .sort((a, b) => b.id - a.id)
                  .map((role, roleIndex) => (
                    <motion.div
                      key={role.id}
                      className="mb-6 relative"
                      initial={{ opacity: 0, x: -30 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: expIndex * 0.3 + roleIndex * 0.2,
                      }}
                    >
                      {/* Punto en la línea de tiempo */}
                      <span className="absolute -left-[25px] top-1 w-4 h-4 bg-[var(--primary-color)] rounded-full border-2 border-[var(--secondary-text-color)]"></span>

                      <h4 className="font-semibold text-lg">{role.title}</h4>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        {role.description.map((point, j) => (
                          <li key={`desc-${role.id}-${j}`}>{point}</li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default Experience;
