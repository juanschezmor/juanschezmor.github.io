import {
  authenticateAdminCredentials,
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
} from "../_shared/admin-auth.mjs";

const allowedMethods = "POST,OPTIONS";

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    const payload = parseJsonBody(event);
    const session = authenticateAdminCredentials(
      payload.username,
      payload.password
    );

    return jsonResponse(200, session, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to sign in.");
  }
};

