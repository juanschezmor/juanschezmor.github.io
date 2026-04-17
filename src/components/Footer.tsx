import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="section-shell site-footer__inner">
        <p>&copy; {new Date().getFullYear()} Juan Sánchez Moreno.</p>
        <p>{t("footer.builtWith")}</p>
      </div>
    </footer>
  );
};

export default Footer;
