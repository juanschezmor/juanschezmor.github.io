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

export const getResumeDownloadUrl = (language: ResumeLanguage) =>
  `${API_BASE_URL}/resumes/download?lang=${language}`;

const fetchResumeBlob = async (language: ResumeLanguage) => {
  const response = await fetch(getResumeDownloadUrl(language));

  if (!response.ok) {
    throw new Error(
      `Resume request failed with status ${response.status}.`
    );
  }

  return response.blob();
};

const openPreviewWindow = () => {
  const previewWindow = window.open("", "_blank");

  if (!previewWindow) {
    return null;
  }

  previewWindow.document.write(
    "<!doctype html><title>Loading CV...</title><p style=\"font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px;\">Loading CV...</p>"
  );
  previewWindow.document.close();
  return previewWindow;
};

const openBlobInWindow = (blob: Blob, targetWindow: Window | null) => {
  const objectUrl = URL.createObjectURL(blob);

  if (targetWindow) {
    targetWindow.location.replace(objectUrl);
  } else {
    window.location.assign(objectUrl);
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 60_000);
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

export const openActiveResumeFromAws = async (language: ResumeLanguage) => {
  const fallback = getLegacyResumeFallback(language);
  const previewWindow = openPreviewWindow();

  try {
    const blob = await fetchResumeBlob(language);
    openBlobInWindow(blob, previewWindow);
  } catch {
    previewWindow?.close();
    triggerDownload(fallback.publicPath, fallback.downloadName);
  }
};

export const downloadActiveResume = (language: ResumeLanguage) => {
  const fallback = getLegacyResumeFallback(language);

  try {
    triggerDownload(getResumeDownloadUrl(language));
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
