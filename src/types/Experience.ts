export type LocalizedExperienceText = {
  en: string;
  es: string;
};

export type LocalizedExperienceTextList = {
  en: string[];
  es: string[];
};

export type ExperienceRole = {
  id: number;
  title: string;
  description: string[];
  title_i18n?: LocalizedExperienceText;
  description_i18n?: LocalizedExperienceTextList;
};

export type ExperienceItem = {
  id: number;
  company: string;
  period: string;
  roles: ExperienceRole[];
  period_i18n?: LocalizedExperienceText;
};

export type DynamoExperienceRole = {
  M: {
    id: { N: string };
    title:
      | { S: string }
      | { M: { en?: { S: string }; es?: { S: string } } };
    description:
      | { L: { S: string }[] }
      | {
          M: {
            en?: { L: { S: string }[] };
            es?: { L: { S: string }[] };
          };
        };
  };
};

export type DynamoExperienceItem = {
  id: { N: string } | { S: string };
  company: { S: string };
  period: { S: string } | { M: { en?: { S: string }; es?: { S: string } } };
  roles: { L: DynamoExperienceRole[] };
};
