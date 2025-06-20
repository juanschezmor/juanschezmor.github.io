import { useRef, useState } from "react";
import Plant2 from "./Plant2";
import "../styles/about-me.css";
import "../styles/terminal.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function AboutMe() {
  const [isTerminalShown, setIsTerminalShown] = useState(true);
  const terminal = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const handleCloseTerminal = () => setIsTerminalShown(false);

  return (
    <article id="about-me" className="about-me" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="title text-center mb-8">About Me</h2>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* BIO */}
          <motion.div
            className="bio lg:w-2/3"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono text-[var(--secondary-text-color)]">
              Hello world! 👋
            </h2>
            <div className="space-y-6 text-lg font-mono text-[var(--secondary-text-color)]">
              <p>
                🚀 My journey in tech began as a teenager, tinkering with code
                and building small projects late at night. What started as a
                hobby has grown into a real passion and profession.
              </p>
              <p>
                🧠 I'm always eager to learn — every new technology feels like a
                new opportunity. I adapt quickly, explore with curiosity, and
                love facing new challenges.
              </p>
              <p>
                🎓 I studied Software Development, gaining hands-on experience
                with both front-end and back-end technologies.
              </p>
              <p>
                🌍 I believe in creating things that are both functional and
                thoughtfully designed. I’m especially excited about working in
                international environments — not only to grow professionally,
                but also to learn from different cultures and perspectives.
              </p>
              <p className="mini-text italic">
                🌱 Bonus fact: I'm a plant lover. You might notice some of my
                green friends hiding around the site — feel free to say hi 🪴
              </p>
            </div>
          </motion.div>

          {/* TERMINAL + PLANT */}
          <motion.div
            className="lg:w-1/3 flex justify-center items-center relative mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <div className="terminal-and-plant">
              {/* Terminal */}
              <div
                ref={terminal}
                className={`container-terminal transition-opacity duration-500 ${
                  isTerminalShown ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="terminal_toolbar">
                  <div className="butt">
                    <button
                      onClick={handleCloseTerminal}
                      className="boton-terminal boton-terminal-color"
                    />
                    <button className="boton-terminal" />
                    <button className="boton-terminal" />
                  </div>
                  <p className="user">juan@admin: ~</p>
                </div>
                <div className="terminal_body">
                  <div className="terminal_promt">
                    <span className="terminal_user">juanschezmor@admin:</span>
                    <span className="terminal_location">~</span>
                    <span className="terminal_bling">$</span>
                    <span className="terminal_cursor" />
                  </div>
                </div>
              </div>

              {/* Plant */}
              <div className="plant">
                <Plant2 width={70} height={70} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export default AboutMe;
