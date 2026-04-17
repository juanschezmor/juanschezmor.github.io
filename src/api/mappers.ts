import type { ActivityItem } from "../types/Activity";
import type { AdminSessionInfo, AdminSessionSnapshot } from "../types/AdminAuth";
import type { ExperienceItem, ExperienceRole } from "../types/Experience";
import { formatActivityDateLabel } from "../formatters/activityDates";
import type { Project } from "../types/Project";
import type { LocalizedText, LocalizedTextList } from "../types/localized";
import type { ResumeLanguage, ResumeManifest, ResumeVersion } from "../types/Resume";
import type { SkillCategory, SkillItem } from "../types/Skill";
import { ApiContractError } from "./client";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown, fieldName: string) => {
  if (typeof value === "string") {
    return value;
  }

  throw new ApiContractError(`Expected "${fieldName}" to be a string.`);
};

const readOptionalString = (value: unknown) => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  throw new ApiContractError("Expected optional field to be a string.");
};

const readBoolean = (value: unknown, fieldName: string) => {
  if (typeof value === "boolean") {
    return value;
  }

  throw new ApiContractError(`Expected "${fieldName}" to be a boolean.`);
};

const readNumber = (value: unknown, fieldName: string) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  throw new ApiContractError(`Expected "${fieldName}" to be a number.`);
};

const readStringArray = (value: unknown, fieldName: string) => {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    throw new ApiContractError(`Expected "${fieldName}" to be a string array.`);
  }

  return value;
};

const readLocalizedText = (
  value: unknown,
  fieldName: string
): LocalizedText | undefined => {
  if (value == null) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new ApiContractError(`Expected "${fieldName}" to be a localized object.`);
  }

  const en = readString(value.en, `${fieldName}.en`);
  const es =
    value.es == null ? en : readString(value.es, `${fieldName}.es`);

  return { en, es };
};

const readLocalizedTextList = (
  value: unknown,
  fieldName: string
): LocalizedTextList | undefined => {
  if (value == null) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new ApiContractError(`Expected "${fieldName}" to be a localized list.`);
  }

  const en = readStringArray(value.en, `${fieldName}.en`);
  const es = value.es == null ? en : readStringArray(value.es, `${fieldName}.es`);

  return { en, es };
};

const readSkillCategory = (value: unknown): SkillCategory => {
  const category = readString(value, "category");

  if (
    category !== "Frontend" &&
    category !== "Backend" &&
    category !== "Tools"
  ) {
    throw new ApiContractError(`Invalid skill category "${category}".`);
  }

  return category;
};

const readResumeLanguage = (value: unknown, fieldName: string): ResumeLanguage => {
  const language = readString(value, fieldName);

  if (language !== "en" && language !== "es") {
    throw new ApiContractError(`Invalid resume language "${language}".`);
  }

  return language;
};

const readRole = (value: unknown, index: number): ExperienceRole => {
  if (!isRecord(value)) {
    throw new ApiContractError(`Expected "roles[${index}]" to be an object.`);
  }

  const idValue = value.id;
  const id =
    typeof idValue === "number"
      ? idValue
      : Number(readString(idValue, `roles[${index}].id`));

  if (!Number.isFinite(id)) {
    throw new ApiContractError(`Invalid "roles[${index}].id" value.`);
  }

  const titleI18n = readLocalizedText(value.title, `roles[${index}].title`);
  const descriptionI18n = readLocalizedTextList(
    value.description,
    `roles[${index}].description`
  );

  return {
    id,
    title: titleI18n?.en ?? "",
    description: descriptionI18n?.en ?? [],
    title_i18n: titleI18n,
    description_i18n: descriptionI18n,
  };
};

export const mapProjectFromApi = (value: unknown): Project => {
  if (!isRecord(value)) {
    throw new ApiContractError('Expected project item to be an object.');
  }

  const titleI18n = readLocalizedText(value.title, "title");
  const descriptionI18n = readLocalizedText(value.description, "description");
  const bulletPointsI18n = readLocalizedTextList(
    value.bullet_points,
    "bullet_points"
  );

  return {
    id: readString(value.id, "id"),
    title: titleI18n?.en ?? "",
    description: descriptionI18n?.en ?? "",
    github_link: readOptionalString(value.github_link),
    live_link: readOptionalString(value.live_link),
    bullet_points: bulletPointsI18n?.en ?? [],
    image: readOptionalString(value.image),
    title_i18n: titleI18n,
    description_i18n: descriptionI18n,
    bullet_points_i18n: bulletPointsI18n,
  };
};

export const mapActivityFromApi = (value: unknown): ActivityItem => {
  if (!isRecord(value)) {
    throw new ApiContractError('Expected activity item to be an object.');
  }

  const labelI18n = readLocalizedText(value.label, "label");
  const descriptionI18n = readLocalizedText(value.description, "description");
  const startDate = readOptionalString(value.start_date);
  const endDate = readOptionalString(value.end_date);
  const fallbackDate = readOptionalString(value.date);

  return {
    id: readString(value.id, "id"),
    date: formatActivityDateLabel({
      start_date: startDate,
      end_date: endDate,
      fallbackDate,
    }),
    start_date: startDate,
    end_date: endDate,
    label: labelI18n?.en ?? "",
    description: descriptionI18n?.en ?? "",
    label_i18n: labelI18n,
    description_i18n: descriptionI18n,
  };
};

export const mapExperienceFromApi = (value: unknown): ExperienceItem => {
  if (!isRecord(value)) {
    throw new ApiContractError('Expected experience item to be an object.');
  }

  const idValue = value.id;
  const id =
    typeof idValue === "number" ? idValue : Number(readString(idValue, "id"));

  if (!Number.isFinite(id)) {
    throw new ApiContractError('Expected "id" to be numeric.');
  }

  const periodI18n = readLocalizedText(value.period, "period");

  if (!Array.isArray(value.roles)) {
    throw new ApiContractError('Expected "roles" to be an array.');
  }

  return {
    id,
    company: readString(value.company, "company"),
    period: periodI18n?.en ?? "",
    period_i18n: periodI18n,
    roles: value.roles.map((role, index) => readRole(role, index)),
  };
};

export const mapSkillFromApi = (value: unknown): SkillItem => {
  if (!isRecord(value)) {
    throw new ApiContractError('Expected skill item to be an object.');
  }

  return {
    id: readString(value.id, "id"),
    skill: readString(value.skill, "skill"),
    category: readSkillCategory(value.category),
  };
};

export const mapResumeVersionFromApi = (value: unknown): ResumeVersion => {
  if (!isRecord(value)) {
    throw new ApiContractError("Expected resume item to be an object.");
  }

  return {
    id: readString(value.id, "id"),
    language: readResumeLanguage(value.language, "language"),
    file_name: readString(value.file_name, "file_name"),
    storage_key: readString(value.storage_key, "storage_key"),
    content_type: readString(value.content_type, "content_type"),
    size_bytes: readNumber(value.size_bytes, "size_bytes"),
    uploaded_at: readString(value.uploaded_at, "uploaded_at"),
    is_active: readBoolean(value.is_active, "is_active"),
  };
};

export const mapResumeManifestFromApi = (value: unknown): ResumeManifest => {
  if (!isRecord(value)) {
    throw new ApiContractError("Expected resume manifest to be an object.");
  }

  if (!Array.isArray(value.items)) {
    throw new ApiContractError('Expected "items" to be an array.');
  }

  return {
    max_history: readNumber(value.max_history, "max_history"),
    items: value.items.map((item) => mapResumeVersionFromApi(item)),
  };
};

export const mapAdminSessionFromApi = (value: unknown): AdminSessionInfo => {
  if (!isRecord(value)) {
    throw new ApiContractError("Expected admin session payload to be an object.");
  }

  return {
    username: readString(value.username, "username"),
    expires_at: readString(value.expires_at, "expires_at"),
  };
};

export const mapAdminSessionSnapshotFromApi = (
  value: unknown
): AdminSessionSnapshot => {
  if (!isRecord(value)) {
    throw new ApiContractError("Expected admin login payload to be an object.");
  }

  return {
    token: readString(value.token, "token"),
    username: readString(value.username, "username"),
    expires_at: readString(value.expires_at, "expires_at"),
  };
};
