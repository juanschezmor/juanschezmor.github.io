import {
  corsHeaders,
  deleteResumeObject,
  deleteResumeRecord,
  getResumeRecordById,
  jsonResponse,
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
    const resumeId = event?.pathParameters?.id;

    if (!resumeId) {
      return jsonResponse(400, {
        message: "Resume id is required.",
      });
    }

    const existingResume = await getResumeRecordById(resumeId);

    if (!existingResume) {
      return jsonResponse(404, {
        message: "Resume not found.",
      });
    }

    if (existingResume.is_active) {
      return jsonResponse(409, {
        message: "Activate another resume before deleting the current active one.",
      });
    }

    await deleteResumeObject(existingResume.storage_key);
    await deleteResumeRecord(existingResume.id);

    return jsonResponse(200, {
      success: true,
      id: existingResume.id,
    });
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to delete resume.");
  }
};
