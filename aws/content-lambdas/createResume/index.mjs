import { randomUUID } from "node:crypto";
import {
  activateResumeRecord,
  createResumeRecord,
  createResumeStorageKey,
  corsHeaders,
  jsonResponse,
  listResumeRecordsByLanguage,
  parseJsonBody,
  pruneResumeHistory,
  resumeMaxFileBytes,
  sanitizeResumeFileName,
  sanitizeResumeLanguage,
  uploadResumeObject,
} from "../_shared/resume-store.mjs";
import {
  authErrorResponse,
  isOptionsRequest,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";

const allowedMethods = corsHeaders["Access-Control-Allow-Methods"];

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    requireAdminSession(event);
    const payload = parseJsonBody(event);
    const language = sanitizeResumeLanguage(payload.language);
    const contentType = typeof payload.content_type === "string"
      ? payload.content_type.trim()
      : "";
    const fileBase64 = typeof payload.file_base64 === "string"
      ? payload.file_base64.trim()
      : "";
    const activate = payload.activate !== false;

    if (!language || !contentType || !fileBase64) {
      return jsonResponse(400, {
        message: "language, content_type, and file_base64 are required.",
      });
    }

    if (contentType !== "application/pdf") {
      return jsonResponse(400, {
        message: "Only application/pdf resumes are supported.",
      });
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");

    if (fileBuffer.length === 0) {
      return jsonResponse(400, {
        message: "Resume file payload is empty.",
      });
    }

    if (fileBuffer.length > resumeMaxFileBytes) {
      return jsonResponse(400, {
        message: `Resume exceeds the max file size of ${resumeMaxFileBytes} bytes.`,
      });
    }

    const existingLanguageResumes = await listResumeRecordsByLanguage(language);
    const shouldActivate = activate || !existingLanguageResumes.some((item) => item.is_active);
    const fileName = sanitizeResumeFileName(payload.file_name, language);
    const resumeId = randomUUID();
    const uploadedAt = new Date().toISOString();
    const storageKey = createResumeStorageKey(language, fileName);

    const newResume = {
      id: resumeId,
      language,
      file_name: fileName,
      storage_key: storageKey,
      content_type: contentType,
      size_bytes: fileBuffer.length,
      uploaded_at: uploadedAt,
      is_active: false,
    };

    await uploadResumeObject({
      storageKey,
      fileBuffer,
      contentType,
    });

    await createResumeRecord(newResume);

    if (shouldActivate) {
      await activateResumeRecord(resumeId);
    }

    await pruneResumeHistory(language);

    return jsonResponse(201, {
      ...newResume,
      is_active: shouldActivate,
    });
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to create resume.");
  }
};
