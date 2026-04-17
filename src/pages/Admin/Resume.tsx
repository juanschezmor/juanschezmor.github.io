import { useEffect, useMemo, useRef, useState } from "react";
import {
  activateResume,
  deleteResumeVersion,
  downloadActiveResume,
  groupResumesByLanguage,
  listResumes,
  uploadResume,
} from "../../api/resumes";
import { getMutationErrorMessage } from "../../api/client";
import {
  getLegacyResumeFallback,
  RESUME_HISTORY_LIMIT_FALLBACK,
  RESUME_MAX_FILE_SIZE_BYTES,
} from "../../config/resume";
import type {
  ResumeLanguage,
  ResumeManifest,
  ResumeVersion,
} from "../../types/Resume";

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read file."));
        return;
      }

      const [, base64 = ""] = reader.result.split(",");
      resolve(base64);
    };

    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const languageLabels: Record<ResumeLanguage, string> = {
  en: "English",
  es: "Español",
};

function Resume() {
  const [manifest, setManifest] = useState<ResumeManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<ResumeLanguage>("en");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activateOnUpload, setActivateOnUpload] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listResumes();
      setManifest(response);
    } catch (loadError) {
      console.error("Failed to load resumes", loadError);
      setManifest(null);
      setError(
        "Resume API unavailable or not deployed yet. The legacy static PDF is still available below."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResumes();
  }, []);

  const groupedResumes = useMemo(
    () =>
      manifest
        ? groupResumesByLanguage(manifest)
        : {
            en: [] as ResumeVersion[],
            es: [] as ResumeVersion[],
          },
    [manifest]
  );

  const maxHistory = manifest?.max_history ?? RESUME_HISTORY_LIMIT_FALLBACK;
  const selectedLanguageResumes = groupedResumes[selectedLanguage];
  const activeResume = selectedLanguageResumes.find((item) => item.is_active);
  const legacyFallback = getLegacyResumeFallback(selectedLanguage);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a PDF file before uploading.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are supported for resumes.");
      return;
    }

    if (selectedFile.size > RESUME_MAX_FILE_SIZE_BYTES) {
      setError(
        `Resume file is too large. Max allowed size is ${formatFileSize(
          RESUME_MAX_FILE_SIZE_BYTES
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const fileBase64 = await readFileAsBase64(selectedFile);

      await uploadResume({
        language: selectedLanguage,
        file_name: selectedFile.name,
        content_type: selectedFile.type,
        file_base64: fileBase64,
        activate: activateOnUpload,
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadResumes();
    } catch (uploadError) {
      console.error("Failed to upload resume", uploadError);
      setError(getMutationErrorMessage("upload resume", uploadError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (resumeId: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await activateResume(resumeId);
      await loadResumes();
    } catch (activationError) {
      console.error("Failed to activate resume", activationError);
      setError(getMutationErrorMessage("activate resume", activationError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resume: ResumeVersion) => {
    const confirmed = window.confirm(
      `Delete ${resume.file_name} from ${languageLabels[resume.language]} history?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await deleteResumeVersion(resume.id);
      await loadResumes();
    } catch (deleteError) {
      console.error("Failed to delete resume", deleteError);
      setError(getMutationErrorMessage("delete resume", deleteError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 text-white">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Resume manager</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Manage one active CV for English and one for Spanish, keep a short
              history in AWS, and automatically stop retaining old files once you
              hit the configured maximum.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-slate-950/70 p-1">
            {(["en", "es"] as const).map((language) => (
              <button
                key={language}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedLanguage === language
                    ? "bg-orange-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
                onClick={() => setSelectedLanguage(language)}
              >
                {languageLabels[language]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {languageLabels[selectedLanguage]} resumes
              </h3>
              <p className="text-sm text-slate-400">
                {selectedLanguageResumes.length} / {maxHistory} stored version
                {maxHistory === 1 ? "" : "s"} for this language.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/25 hover:bg-white/5"
              onClick={() => void downloadActiveResume(selectedLanguage)}
            >
              Download active {languageLabels[selectedLanguage]} CV
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Active version
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {activeResume ? activeResume.file_name : "None in AWS yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                History cap
              </p>
              <p className="mt-2 text-sm text-slate-200">{maxHistory} per language</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Legacy fallback
              </p>
              <p className="mt-2 text-sm text-slate-200">{legacyFallback.sourceFile}</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <label
                htmlFor="resume-upload"
                className="mb-2 block text-sm font-medium text-white"
              >
                Upload a new {languageLabels[selectedLanguage]} resume
              </label>
              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept="application/pdf"
                className="block w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:font-semibold file:text-slate-950"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] ?? null)
                }
              />
              <p className="mt-2 text-xs text-slate-500">
                PDF only. Max size {formatFileSize(RESUME_MAX_FILE_SIZE_BYTES)}.
                When the language reaches the cap, the oldest inactive versions
                are removed automatically.
              </p>
            </div>

            <label className="inline-flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
                checked={activateOnUpload}
                onChange={(event) => setActivateOnUpload(event.target.checked)}
              />
              Make this the active resume immediately after upload
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload resume"}
              </button>
              <a
                href={legacyFallback.publicPath}
                download={legacyFallback.downloadName}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/25 hover:bg-white/5"
              >
                Download legacy fallback
              </a>
            </div>
          </form>
        </article>

        <aside className="grid gap-4">
          {error && (
            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          )}

          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">History</h3>
            <p className="mt-2 text-sm text-slate-400">
              Keep only the most useful recent versions. Active files stay pinned,
              and old inactive ones get pruned once the language exceeds the cap.
            </p>

            <div className="mt-4 grid max-h-[32rem] gap-3 overflow-y-auto pr-1">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                  Loading resume history...
                </div>
              ) : selectedLanguageResumes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                  No {languageLabels[selectedLanguage].toLowerCase()} resumes in
                  AWS yet.
                </div>
              ) : (
                selectedLanguageResumes.map((resume) => (
                  <article
                    key={resume.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {resume.file_name}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded {formatDate(resume.uploaded_at)}
                          </p>
                        </div>

                        {resume.is_active && (
                          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="grid gap-2 text-xs text-slate-400">
                        <p>Size: {formatFileSize(resume.size_bytes)}</p>
                        <p>Type: {resume.content_type}</p>
                        <p className="break-all">Key: {resume.storage_key}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!resume.is_active && (
                          <button
                            type="button"
                            disabled={submitting}
                            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            onClick={() => void handleActivate(resume.id)}
                          >
                            Make active
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={submitting || resume.is_active}
                          className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => void handleDelete(resume)}
                        >
                          {resume.is_active ? "Active resume" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default Resume;
