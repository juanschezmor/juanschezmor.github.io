import { API_BASE_URL } from "../config/api";
import { getLegacyResumeFallback } from "../config/resume";
import type {
  ResumeLanguage,
  ResumeManifest,
  ResumeVersion,
} from "../types/Resume";
import { fetchJson, sendJson, sendRequest } from "./client";
import { mapResumeManifestFromApi, mapResumeVersionFromApi } from "./mappers";

export interface ResumeUploadPayload {
  language: ResumeLanguage;
  file_name: string;
  content_type: string;
  file_base64: string;
  activate?: boolean;
}

const buildResumeDownloadUrl = (language: ResumeLanguage) =>
  `${API_BASE_URL}/resumes/download?lang=${language}`;

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const listResumes = () =>
  fetchJson("/resumes", mapResumeManifestFromApi);

export const uploadResume = (input: ResumeUploadPayload) =>
  sendJson<ResumeVersion, ResumeUploadPayload>(
    "/resumes",
    "POST",
    input,
    mapResumeVersionFromApi,
    { requiresAuth: true },
  );

export const activateResume = (id: string) =>
  sendRequest(
    `/resumes/${id}/activate`,
    { method: "POST" },
    { requiresAuth: true },
  );

export const deleteResumeVersion = (id: string) =>
  sendRequest(`/resumes/${id}`, { method: "DELETE" }, { requiresAuth: true });

export const downloadActiveResume = (language: ResumeLanguage) => {
  try {
    openInNewTab(buildResumeDownloadUrl(language));
  } catch {
    const fallback = getLegacyResumeFallback(language);
    openInNewTab(fallback.publicPath);
  }
};

export const groupResumesByLanguage = (manifest: ResumeManifest) => ({
  en: manifest.items
    .filter((item) => item.language === "en")
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)),
  es: manifest.items
    .filter((item) => item.language === "es")
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)),
});
