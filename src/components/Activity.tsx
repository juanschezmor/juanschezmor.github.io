import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { formatActivityDateLabel } from "../formatters/activityDates";
import { useActivities } from "../hooks/useActivities";

function Activity() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const { activities } = useActivities();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "es" ? "es" : "en";

  return (
    <section id="activity" className="activity-section" ref={ref}>
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("activity.eyebrow")}</p>
            <h2 className="title">{t("activity.title")}</h2>
          </div>
          <p className="section-copy">{t("activity.copy")}</p>
        </div>

        <div className="activity-layout panel-card">
          {activities.map((item, index) => {
            const isLocalItem =
              typeof item.id === "string" &&
              /^[0-9]+$/.test(item.id) &&
              i18n.exists(`activity.items.${item.id}.label`);
            const label = item.label_i18n?.[language]
              ? item.label_i18n[language]
              : isLocalItem
                ? t(`activity.items.${item.id}.label`)
                : item.label;
            const description = item.description_i18n?.[language]
              ? item.description_i18n[language]
              : isLocalItem
                ? t(`activity.items.${item.id}.description`)
                : item.description;
            const formattedDate = formatActivityDateLabel({
              start_date: item.start_date,
              end_date: item.end_date,
              fallbackDate: item.date,
              locale: language === "es" ? "es-ES" : "en-US",
            });

            return (
              <motion.article
                key={item.id}
                className={`activity-item ${index % 2 === 0 ? "activity-item--sent" : "activity-item--received"}`}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <div className="activity-item__meta">
                  <span className="activity-item__dot" aria-hidden="true" />
                  <p className="activity-item__date">{formattedDate}</p>
                </div>

                <div className="activity-bubble">
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Activity;
