import type { ActivityItem, DynamoActivityItem } from "./types/Activity";
import type {
  DynamoExperienceItem,
  ExperienceItem,
} from "./types/Experience";
import type { DynamoProject, Project } from "./types/Project";
import type { DynamoSkillItem, SkillItem } from "./types/Skill";

const parseLocalizedText = (
  field:
    | { S: string }
    | { M: { en?: { S: string }; es?: { S: string } } }
    | undefined
) => {
  if (!field) {
    return null;
  }

  if ("S" in field) {
    return {
      en: field.S,
      es: field.S,
    };
  }

  return {
    en: field.M.en?.S ?? "",
    es: field.M.es?.S ?? field.M.en?.S ?? "",
  };
};

const parseLocalizedTextList = (
  field:
    | { L: { S: string }[] }
    | {
        M: {
          en?: { L: { S: string }[] };
          es?: { L: { S: string }[] };
        };
      }
    | undefined
) => {
  if (!field) {
    return null;
  }

  if ("L" in field) {
    const values = field.L.map((entry) => entry.S);

    return {
      en: values,
      es: values,
    };
  }

  return {
    en: field.M.en?.L.map((entry) => entry.S) ?? [],
    es:
      field.M.es?.L.map((entry) => entry.S) ??
      field.M.en?.L.map((entry) => entry.S) ??
      [],
  };
};

export const parseDynamoProjects = (data: DynamoProject[]): Project[] => {
  return data.map((item) => ({
    id: item.id.S,
    title: parseLocalizedText(item.title)?.en ?? "",
    description: parseLocalizedText(item.description)?.en ?? "",
    github_link: item.github_link?.S,
    live_link: item.live_link?.S,
    bullet_points: parseLocalizedTextList(item.bullet_points)?.en ?? [],
    image: item.image?.S,
    title_i18n: parseLocalizedText(item.title) ?? undefined,
    description_i18n: parseLocalizedText(item.description) ?? undefined,
    bullet_points_i18n: parseLocalizedTextList(item.bullet_points) ?? undefined,
  }));
};

export const parseDynamoActivities = (
  data: DynamoActivityItem[]
): ActivityItem[] => {
  return data
    .map((item) => ({
      id: item.id.S,
      date: item.date.S,
      label: parseLocalizedText(item.label)?.en ?? "",
      description: parseLocalizedText(item.description)?.en ?? "",
      label_i18n: parseLocalizedText(item.label) ?? undefined,
      description_i18n: parseLocalizedText(item.description) ?? undefined,
    }))
    .reverse();
};

export const parseDynamoExperiences = (
  data: DynamoExperienceItem[]
): ExperienceItem[] => {
  return data
    .map((item) => {
      const id = "N" in item.id ? Number(item.id.N) : Number(item.id.S);

      return {
        id,
        company: item.company.S,
        period: parseLocalizedText(item.period)?.en ?? "",
        period_i18n: parseLocalizedText(item.period) ?? undefined,
        roles:
          item.roles.L.map((role) => ({
            id: Number(role.M.id.N),
            title: parseLocalizedText(role.M.title)?.en ?? "",
            description: parseLocalizedTextList(role.M.description)?.en ?? [],
            title_i18n: parseLocalizedText(role.M.title) ?? undefined,
            description_i18n:
              parseLocalizedTextList(role.M.description) ?? undefined,
          })) ?? [],
      };
    })
    .sort((a, b) => b.id - a.id);
};

export const parseDynamoSkills = (data: DynamoSkillItem[]): SkillItem[] => {
  return data
    .map((item) => {
      if ("S" in item.id) {
        return {
          id: item.id.S,
          skill: item.skill.S,
          category: item.category.S,
        };
      }

      return item as unknown as SkillItem;
    })
    .sort((a, b) => a.skill.localeCompare(b.skill));
};
