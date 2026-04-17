export type LocalizedActivityText = {
  en: string;
  es: string;
};

export type ActivityItem = {
  id: string;
  date: string;
  label: string;
  description: string;
  label_i18n?: LocalizedActivityText;
  description_i18n?: LocalizedActivityText;
};

export type DynamoActivityItem = {
  id: { S: string };
  date: { S: string };
  label: { S: string } | { M: { en?: { S: string }; es?: { S: string } } };
  description:
    | { S: string }
    | { M: { en?: { S: string }; es?: { S: string } } };
};
