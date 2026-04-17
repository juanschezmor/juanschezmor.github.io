import { createHmac, timingSafeEqual } from "node:crypto";

const adminIssuer = "juan-portfolio-admin";

export class AdminAuthError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AdminAuthError";
    this.statusCode = statusCode;
  }
}

export const buildCorsHeaders = (allowedMethods) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": allowedMethods,
});

export const optionsResponse = (allowedMethods) => ({
  statusCode: 204,
  headers: buildCorsHeaders(allowedMethods),
  body: "",
});

export const jsonResponse = (statusCode, body, allowedMethods) => ({
  statusCode,
  headers: buildCorsHeaders(allowedMethods),
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const isOptionsRequest = (event) =>
  event?.requestContext?.http?.method === "OPTIONS" ||
  event?.httpMethod === "OPTIONS";

const getAdminConfig = () => {
  const username =
    typeof process.env.ADMIN_USERNAME === "string"
      ? process.env.ADMIN_USERNAME.trim()
      : "";
  const password =
    typeof process.env.ADMIN_PASSWORD === "string"
      ? process.env.ADMIN_PASSWORD
      : "";
  const secret =
    typeof process.env.ADMIN_TOKEN_SECRET === "string"
      ? process.env.ADMIN_TOKEN_SECRET
      : "";

  if (!username || !password || !secret) {
    throw new AdminAuthError(500, "Admin authentication is not configured.");
  }

  return { username, password, secret };
};

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left ?? "", "utf8");
  const rightBuffer = Buffer.from(right ?? "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const signTokenValue = (value, secret) =>
  createHmac("sha256", secret).update(value).digest("base64url");

const decodeJson = (value) => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new AdminAuthError(401, "Admin session is invalid.");
  }
};

const getHeader = (headers, targetName) => {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const target = targetName.toLowerCase();

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() !== target) {
      continue;
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return null;
};

export const requireAdminSession = (event) => {
  const { username, secret } = getAdminConfig();
  const authorizationHeader = getHeader(event?.headers, "authorization");

  if (!authorizationHeader) {
    throw new AdminAuthError(401, "Admin authentication required.");
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new AdminAuthError(401, "Admin authentication required.");
  }

  const tokenParts = match[1].split(".");

  if (tokenParts.length !== 3) {
    throw new AdminAuthError(401, "Admin session is invalid.");
  }

  const [encodedHeader, encodedPayload, signature] = tokenParts;
  const expectedSignature = signTokenValue(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );

  if (!safeCompare(signature, expectedSignature)) {
    throw new AdminAuthError(401, "Admin session is invalid.");
  }

  const header = decodeJson(encodedHeader);
  const payload = decodeJson(encodedPayload);

  if (
    header?.alg !== "HS256" ||
    header?.typ !== "JWT" ||
    payload?.iss !== adminIssuer ||
    payload?.sub !== username ||
    !Number.isFinite(payload?.exp)
  ) {
    throw new AdminAuthError(401, "Admin session is invalid.");
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new AdminAuthError(401, "Admin session has expired.");
  }

  return {
    username: payload.sub,
    expires_at: new Date(payload.exp * 1000).toISOString(),
  };
};

export const authErrorResponse = (error, allowedMethods, fallbackMessage) => {
  if (error instanceof AdminAuthError) {
    return jsonResponse(
      error.statusCode,
      { message: error.message },
      allowedMethods
    );
  }

  console.error(fallbackMessage, error);
  return jsonResponse(500, { message: fallbackMessage }, allowedMethods);
};

