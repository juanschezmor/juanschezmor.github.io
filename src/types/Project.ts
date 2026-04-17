export type LocalizedText = {
  en: string;
  es: string;
};

export type LocalizedTextList = {
  en: string[];
  es: string[];
};

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

export type DynamoProject = {
  id: { S: string };
  title: { S: string } | { M: { en?: { S: string }; es?: { S: string } } };
  description:
    | { S: string }
    | { M: { en?: { S: string }; es?: { S: string } } };
  github_link?: { S: string };
  live_link?: { S: string };
  bullet_points?:
    | { L: { S: string }[] }
    | {
        M: {
          en?: { L: { S: string }[] };
          es?: { L: { S: string }[] };
        };
      };
  image?: { S: string };
};
