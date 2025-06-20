import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "../styles/hero.css";
import heroImage from "../assets/hero-image.png";
import plant1 from "../assets/plant1.svg";
import Socials from "./Socials";
import { TypeAnimation } from "react-type-animation";

const Hero = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <article
      ref={ref}
      className="home flex flex-col justify-center items-center min-h-screen px-5 py-10"
    >
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Avatar */}
        <motion.div
          className="w-full lg:w-7/12 flex justify-center items-center avatar"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={heroImage}
            alt="Juan Sánchez Moreno"
            className="hero-image"
          />
        </motion.div>

        {/* Texto + botones */}
        <motion.div
          className="w-full lg:w-5/12 mt-6 lg:mt-0 flex flex-col justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="flex flex-col w-full max-w-md mx-auto px-4 lg:w-4/5">
            <div className="text-6xl">
              <h3 className="font-mono text-center lg:text-start font-bold text-[var(--secondary-text-color)]">
                JUAN
                <br />
                SANCHEZ
                <br />
                MORENO
              </h3>
            </div>

            <div className="title text-center mt-2">
              <p className="text-[var(--primary-color)] font-mono text-lg">
                Full-stack Developer
              </p>
            </div>

            <div className="text-center md:text-start font-mono text-[var(--secondary-text-color)] text-lg mt-4">
              <TypeAnimation
                sequence={[
                  "Always curious",
                  1000,
                  "Always improving",
                  1000,
                  "That’s how I grow as a developer",
                  2000,
                ]}
                speed={50}
                repeat={Infinity}
                wrapper="p"
                className="text-start font-mono text-[var(--secondary-text-color)] text-lg mt-4"
              />
            </div>

            <motion.div
              id="hire-me-btn"
              className="mt-6 hire-me-container z-10 flex flex-row gap-3 items-center relative"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a className="btn-primary mb-4" href="#contact">
                Hire me!
              </a>
              <a
                className="btn-primary mb-4"
                href="/Juan-Sanchez-Moreno-CV.pdf"
                download="Juan_Sanchez_CV.pdf"
              >
                Download CV
              </a>
              <img
                src={plant1}
                alt="Plant 1"
                className="plant hidden sm:block absolute"
              />
            </motion.div>

            <Socials />
          </div>
        </motion.div>
      </div>
    </article>
  );
};

export default Hero;
