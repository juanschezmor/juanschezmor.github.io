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

const triggerPreview = (url: string) => {
  const link = document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const triggerDownload = (url: string, downloadName?: string) => {
  const link = document.createElement("a");

  link.href = url;
  link.rel = "noopener noreferrer";

  if (downloadName) {
    link.download = downloadName;
  }

  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
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

export const openActiveResumePreview = (language: ResumeLanguage) => {
  const fallback = getLegacyResumeFallback(language);

  try {
    triggerPreview(buildResumeDownloadUrl(language));
  } catch {
    triggerPreview(fallback.publicPath);
  }
};

export const downloadActiveResume = (language: ResumeLanguage) => {
  const fallback = getLegacyResumeFallback(language);

  try {
    triggerDownload(buildResumeDownloadUrl(language));
  } catch {
    triggerDownload(fallback.publicPath, fallback.downloadName);
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
