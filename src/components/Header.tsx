import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="md:sticky top-0 flex flex-col md:flex-row justify-between items-center h-16 px-6 md:px-16 bg-[var(--accent-color)] text-[var(--text-color)] shadow-[0_8px_8px_-4px_rgba(255,255,255,0.2)] font-mono z-10 relative">
      {/* Logo */}
      <div className="flex items-center bg-[var(--secondary-text-color)] rounded-full p-2 hover:bg-[var(--primary-color)] cursor-pointer transition-colors">
        <img
          src={logo}
          alt="logo"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Nav */}
      <nav className="hidden md:flex gap-5 mt-4 md:mt-0">
        <a
          href="/"
          className="text-[var(--secondary-text-color)] text-lg hover:text-[var(--primary-color)] transition-colors"
        >
          Home
        </a>
        <a
          href="#about-me"
          className="text-[var(--secondary-text-color)] text-lg hover:text-[var(--primary-color)] transition-colors"
        >
          About
        </a>
        <a
          href="#tech-stack"
          className="text-[var(--secondary-text-color)] text-lg hover:text-[var(--primary-color)] transition-colors"
        >
          Tech Stack
        </a>
        <a
          href="#projects"
          className="text-[var(--secondary-text-color)] text-lg hover:text-[var(--primary-color)] transition-colors"
        >
          Projects
        </a>
        <a
          href="#contact"
          className="text-[var(--secondary-text-color)] text-lg hover:text-[var(--primary-color)] transition-colors"
        >
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;
