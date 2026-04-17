import type { LocalizedText } from "./localized";

export type ActivityItem = {
  id: string;
  date: string;
  start_date?: string;
  end_date?: string;
  label: string;
  description: string;
  label_i18n?: LocalizedText;
  description_i18n?: LocalizedText;
};
