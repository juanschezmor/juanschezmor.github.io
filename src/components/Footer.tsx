const Footer = () => {
  return (
    <footer className="w-full bg-[var(--accent-color)] text-[var(--secondary-text-color)] py-6 mt-12 text-center font-mono text-sm">
      <p>
        &copy; {new Date().getFullYear()} Juan Sánchez Moreno. All rights
        reserved.
      </p>
    </footer>
  );
};

export default Footer;
