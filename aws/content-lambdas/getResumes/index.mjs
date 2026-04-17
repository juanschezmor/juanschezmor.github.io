import {
  buildResumeManifest,
  jsonResponse,
  optionsResponse,
} from "../_shared/resume-store.mjs";

export const handler = async (event) => {
  if (event?.requestContext?.http?.method === "OPTIONS" || event?.httpMethod === "OPTIONS") {
    return optionsResponse;
  }

  try {
    return jsonResponse(200, await buildResumeManifest());
  } catch (error) {
    console.error("Failed to list resumes", error);
    return jsonResponse(500, {
      message: "Failed to list resumes.",
    });
  }
};
