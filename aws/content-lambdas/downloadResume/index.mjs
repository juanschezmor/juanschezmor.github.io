import {
  binaryResponse,
  getActiveResumeRecord,
  jsonResponse,
  optionsResponse,
  readResumeObject,
  sanitizeResumeLanguage,
} from "../_shared/resume-store.mjs";

const getHeader = (event, name) => {
  const headers = event?.headers ?? {};
  const lowerName = name.toLowerCase();

  return (
    headers[name] ??
    headers[lowerName] ??
    headers[name.toUpperCase()] ??
    null
  );
};

const isIphoneSafari = (event) => {
  const userAgent = getHeader(event, "user-agent");

  if (typeof userAgent !== "string") {
    return false;
  }

  return (
    userAgent.includes("iPhone") &&
    userAgent.includes("Safari") &&
    !userAgent.includes("CriOS") &&
    !userAgent.includes("FxiOS") &&
    !userAgent.includes("EdgiOS") &&
    !userAgent.includes("OPiOS")
  );
};

export const handler = async (event) => {
  if (event?.requestContext?.http?.method === "OPTIONS" || event?.httpMethod === "OPTIONS") {
    return optionsResponse;
  }

  try {
    const language = sanitizeResumeLanguage(
      event?.queryStringParameters?.lang ?? event?.queryStringParameters?.language
    );

    if (!language) {
      return jsonResponse(400, {
        message: 'A valid "lang" query parameter is required.',
      });
    }

    const activeResume = await getActiveResumeRecord(language);

    if (!activeResume) {
      return jsonResponse(404, {
        message: `No active ${language} resume found.`,
      });
    }

    const fileBuffer = await readResumeObject(activeResume.storage_key);
    const forceDownload = isIphoneSafari(event);

    return binaryResponse(200, fileBuffer, {
      "Content-Type": forceDownload
        ? "application/octet-stream"
        : activeResume.content_type,
      "Cache-Control": "no-store",
      "Content-Disposition": forceDownload
        ? `attachment; filename="${activeResume.file_name}"; filename*=UTF-8''${encodeURIComponent(
            activeResume.file_name
          )}`
        : `inline; filename="${activeResume.file_name}"; filename*=UTF-8''${encodeURIComponent(
            activeResume.file_name
          )}`,
    });
  } catch (error) {
    console.error("Failed to download resume", error);
    return jsonResponse(500, {
      message: "Failed to download resume.",
    });
  }
};
