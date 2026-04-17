import {
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";

const allowedMethods = "GET,OPTIONS";

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    return jsonResponse(200, requireAdminSession(event), allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to verify admin session.");
  }
};

