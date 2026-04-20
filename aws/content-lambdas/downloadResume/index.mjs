import {
  getActiveResumeRecord,
  jsonResponse,
  optionsResponse,
  resumesBucketName,
  s3Client,
  sanitizeResumeLanguage,
} from "../_shared/resume-store.mjs";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const buildResumeRedirectUrl = async (resume) => {
  const command = new GetObjectCommand({
    Bucket: resumesBucketName,
    Key: resume.storage_key,
    ResponseContentType: resume.content_type,
    ResponseContentDisposition: `inline; filename="${resume.file_name}"`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 300 });
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

    const redirectUrl = await buildResumeRedirectUrl(activeResume);

    return {
      statusCode: 302,
      headers: {
        "Cache-Control": "no-store",
        Location: redirectUrl,
      },
      body: "",
    };
  } catch (error) {
    console.error("Failed to download resume", error);
    return jsonResponse(500, {
      message: "Failed to download resume.",
    });
  }
};
