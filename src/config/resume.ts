import type { ResumeLanguage } from "../types/Resume";

export const RESUME_HISTORY_LIMIT_FALLBACK = 5;
export const RESUME_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const LEGACY_RESUME_FALLBACKS: Record<
  ResumeLanguage,
  {
    publicPath: string;
    downloadName: string;
    sourceFile: string;
  }
> = {
  en: {
    publicPath: "/Juan-Sanchez-Moreno-CV.pdf",
    downloadName: "Juan_Sanchez_CV_EN.pdf",
    sourceFile: "public/Juan-Sanchez-Moreno-CV.pdf",
  },
  es: {
    publicPath: "/Juan-Sanchez-Moreno-CV.pdf",
    downloadName: "Juan_Sanchez_CV_ES.pdf",
    sourceFile: "public/Juan-Sanchez-Moreno-CV.pdf",
  },
};

export const getLegacyResumeFallback = (language: ResumeLanguage) =>
  LEGACY_RESUME_FALLBACKS[language];
