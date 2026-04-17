export type ResumeLanguage = "en" | "es";

export type ResumeVersion = {
  id: string;
  language: ResumeLanguage;
  file_name: string;
  storage_key: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
  is_active: boolean;
};

export type ResumeManifest = {
  max_history: number;
  items: ResumeVersion[];
};
