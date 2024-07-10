import '../styles/about-me.css';
import '../styles/terminal.css';
import { useRef, useState } from 'react';
import Plant2 from './Plant2';

function AboutMe() {
  const [isTerminalShown, setIsTerminalShown] = useState(true);
  const terminal = useRef();

  const handleCloseTerminal = () => {
    setIsTerminalShown(false);
  };

  return (
    <article id="about-me" className="container-fluid about-me">
      <div className="row p-4">
        <div className="col-lg-8 mb-4 text-center">
          <h2 className="title">About Me</h2>
        </div>
        <div className="row">
          <div className="col-md-8 bio">
            <h2>Hello world! 👋</h2>

            <p>
              🚀 My journey in software development began as a hobby during my
              younger years, driven by curiosity and a love for technology.
              Today, it has evolved into my job, where I apply my skills and
              passion.
            </p>
            <p>
              🧠 I thrive on learning new technologies and continuously
              expanding my knowledge. This passion makes me highly adaptable and
              open to change.
            </p>

            <p>
              🎓 Degree in Software Development, where I gained foundational
              knowledge in various programming languages, front-end and back-end
              development, databases, and Android development.
            </p>
            <p>
              Join me on this journey of continuous learning and project
              exploration!
            </p>
            <p className="mini-text">
              🌱 Something interesting about me, I have a deep love for plants.
              You might find them peeking out in unexpected places across this
              website!
            </p>
          </div>
          <div className="col-md-4 d-flex justify-content-center align-items-center mt-5">
            <div className="terminal-and-plant">
              <div
                ref={terminal}
                className={`container-terminal ${isTerminalShown ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="terminal_toolbar">
                  <div className="butt">
                    <button
                      onClick={handleCloseTerminal}
                      className="boton-terminal boton-terminal-color"
                    ></button>
                    <button className="boton-terminal"></button>
                    <button className="boton-terminal"></button>
                  </div>
                  <p className="user">juan@admin: ~</p>
                </div>
                <div className="terminal_body">
                  <div className="terminal_promt">
                    <span className="terminal_user">juanschezmor@admin:</span>
                    <span className="terminal_location">~</span>
                    <span className="terminal_bling">$</span>
                    <span className="terminal_cursor"></span>
                  </div>
                </div>
              </div>

              <div className="plant">
                <Plant2 width={'70px'} height={'70px'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AboutMe;
