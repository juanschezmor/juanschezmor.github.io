import type { LocalizedText, LocalizedTextList } from "./localized";

export type Project = {
  id: string;
  title: string;
  description: string;
  github_link?: string;
  live_link?: string;
  bullet_points: string[];
  image?: string;
  title_i18n?: LocalizedText;
  description_i18n?: LocalizedText;
  bullet_points_i18n?: LocalizedTextList;
};
