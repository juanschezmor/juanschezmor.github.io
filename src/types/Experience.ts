import type { LocalizedText, LocalizedTextList } from "./localized";

export type ExperienceRole = {
  id: number;
  title: string;
  description: string[];
  title_i18n?: LocalizedText;
  description_i18n?: LocalizedTextList;
};

export type ExperienceItem = {
  id: number;
  company: string;
  period: string;
  roles: ExperienceRole[];
  period_i18n?: LocalizedText;
};
