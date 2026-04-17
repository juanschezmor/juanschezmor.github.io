import { API_BASE_URL } from "../config/api";
import { getLegacyResumeFallback } from "../config/resume";
import type {
  ResumeLanguage,
  ResumeManifest,
  ResumeVersion,
} from "../types/Resume";
import {
  ApiContractError,
  ApiHttpError,
  ApiNetworkError,
  fetchJson,
  sendJson,
  sendRequest,
} from "./client";
import {
  mapResumeManifestFromApi,
  mapResumeVersionFromApi,
} from "./mappers";

export interface ResumeUploadPayload {
  language: ResumeLanguage;
  file_name: string;
  content_type: string;
  file_base64: string;
  activate?: boolean;
}

const buildResumeDownloadUrl = (language: ResumeLanguage) =>
  `${API_BASE_URL}/resumes/download?lang=${language}`;

const extractFileNameFromDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fallbackMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return fallbackMatch?.[1] ?? null;
};

const triggerBrowserDownload = (href: string, fileName: string) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const objectUrl = window.URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, fileName);
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
};

export const listResumes = () =>
  fetchJson("/resumes", mapResumeManifestFromApi);

export const uploadResume = (input: ResumeUploadPayload) =>
  sendJson<ResumeVersion, ResumeUploadPayload>(
    "/resumes",
    "POST",
    input,
    mapResumeVersionFromApi,
    { requiresAuth: true }
  );

export const activateResume = (id: string) =>
  sendRequest(
    `/resumes/${id}/activate`,
    { method: "POST" },
    { requiresAuth: true }
  );

export const deleteResumeVersion = (id: string) =>
  sendRequest(`/resumes/${id}`, { method: "DELETE" }, { requiresAuth: true });

export const downloadActiveResume = async (language: ResumeLanguage) => {
  try {
    const response = await fetch(buildResumeDownloadUrl(language));

    if (!response.ok) {
      throw new ApiHttpError(response.status);
    }

    const blob = await response.blob();
    const fileName =
      extractFileNameFromDisposition(response.headers.get("content-disposition")) ??
      getLegacyResumeFallback(language).downloadName;

    if (!blob.type.includes("pdf")) {
      throw new ApiContractError("Expected resume download to be a PDF.");
    }

    triggerBlobDownload(blob, fileName);
    return;
  } catch (error) {
    if (
      error instanceof ApiHttpError ||
      error instanceof ApiNetworkError ||
      error instanceof ApiContractError ||
      error instanceof TypeError
    ) {
      const fallback = getLegacyResumeFallback(language);
      triggerBrowserDownload(fallback.publicPath, fallback.downloadName);
      return;
    }

    throw error;
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
