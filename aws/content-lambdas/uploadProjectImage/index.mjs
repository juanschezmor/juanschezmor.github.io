import {
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";
import {
  buildProjectImageUrl,
  createProjectImageStorageKey,
  projectImageMaxFileBytes,
  sanitizeProjectImageContentType,
  sanitizeProjectImageFileName,
  uploadProjectImageObject,
} from "../_shared/project-images.mjs";

const allowedMethods = "POST,OPTIONS";

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    requireAdminSession(event);
    const payload = parseJsonBody(event);
    const fileName = sanitizeProjectImageFileName(payload.file_name);
    const contentType = sanitizeProjectImageContentType(payload.content_type);
    const fileBase64 =
      typeof payload.file_base64 === "string" ? payload.file_base64.trim() : "";

    if (!contentType || !fileBase64) {
      return jsonResponse(
        400,
        {
          message: "file_name, content_type, and file_base64 are required.",
        },
        allowedMethods
      );
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");

    if (fileBuffer.length === 0) {
      return jsonResponse(
        400,
        {
          message: "Image file is empty.",
        },
        allowedMethods
      );
    }

    if (fileBuffer.length > projectImageMaxFileBytes) {
      return jsonResponse(
        400,
        {
          message: `Image exceeds the ${projectImageMaxFileBytes} byte limit.`,
        },
        allowedMethods
      );
    }

    const storageKey = createProjectImageStorageKey(fileName);

    await uploadProjectImageObject({
      storageKey,
      fileBuffer,
      contentType,
    });

    return jsonResponse(
      201,
      {
        file_name: fileName,
        content_type: contentType,
        size_bytes: fileBuffer.length,
        storage_key: storageKey,
        url: buildProjectImageUrl(storageKey),
      },
      allowedMethods
    );
  } catch (error) {
    return authErrorResponse(
      error,
      allowedMethods,
      "Failed to upload project image."
    );
  }
};
