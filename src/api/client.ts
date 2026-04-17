import { API_BASE_URL } from "../config/api";
import {
  clearStoredAdminSession,
  getStoredAdminSession,
  isAdminSessionExpired,
} from "../auth/adminSession";

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiContractError";
  }
}

export class ApiNetworkError extends Error {
  cause?: unknown;

  constructor(message = "Network request failed.", cause?: unknown) {
    super(message);
    this.name = "ApiNetworkError";
    this.cause = cause;
  }
}

export class ApiHttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiHttpError";
    this.status = status;
  }
}

interface RequestOptions {
  requiresAuth?: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const unwrapApiBody = (payload: unknown) => {
  if (isRecord(payload) && typeof payload.body === "string") {
    try {
      return JSON.parse(payload.body) as unknown;
    } catch {
      throw new ApiContractError("Expected API body to contain valid JSON.");
    }
  }

  return payload;
};

const parseResponsePayload = async (response: Response) => {
  const rawText = await response.text();

  if (!rawText) {
    return undefined;
  }

  try {
    return unwrapApiBody(JSON.parse(rawText) as unknown);
  } catch {
    if (!response.ok) {
      return rawText;
    }

    throw new ApiContractError("Expected API response to contain valid JSON.");
  }
};

const buildRequestHeaders = (
  headers: HeadersInit | undefined,
  requiresAuth: boolean
) => {
  const requestHeaders = new Headers(headers);

  if (!requiresAuth) {
    return requestHeaders;
  }

  const session = getStoredAdminSession();

  if (!session || isAdminSessionExpired(session.expires_at)) {
    clearStoredAdminSession();
    throw new ApiHttpError(401, "Your admin session has expired. Please sign in again.");
  }

  requestHeaders.set("Authorization", `Bearer ${session.token}`);
  return requestHeaders;
};

const request = async (
  path: string,
  init?: RequestInit,
  options: RequestOptions = {}
) => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: buildRequestHeaders(init?.headers, options.requiresAuth === true),
    });
  } catch (error) {
    throw new ApiNetworkError(
      "Unable to reach the API.",
      error instanceof Error ? error : undefined
    );
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    if (options.requiresAuth && (response.status === 401 || response.status === 403)) {
      clearStoredAdminSession();
    }

    const message =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : undefined;

    throw new ApiHttpError(response.status, message);
  }

  return payload;
};

export const fetchCollection = async <T>(
  path: string,
  mapper: (item: unknown, index: number) => T,
  options?: RequestOptions
) => {
  const payload = await request(path, undefined, options);

  if (!Array.isArray(payload)) {
    throw new ApiContractError(`Expected an array response for ${path}.`);
  }

  return payload.map((item, index) => mapper(item, index));
};

export const fetchJson = async <T>(
  path: string,
  mapper: (payload: unknown) => T,
  options?: RequestOptions
) => mapper(await request(path, undefined, options));

export const sendJson = async <TResponse, TRequest = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  body: TRequest,
  mapper?: (payload: unknown) => TResponse,
  options?: RequestOptions
) => {
  const payload = await request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, options);

  if (!mapper) {
    return payload as TResponse;
  }

  return mapper(payload);
};

export const sendRequest = async (
  path: string,
  init?: RequestInit,
  options?: RequestOptions
) => {
  await request(path, init, options);
};

export const getFetchFallbackMessage = (
  resourceLabel: string,
  error: unknown
) => {
  if (error instanceof ApiContractError) {
    return `API response for ${resourceLabel} is invalid. Showing local fallback content.`;
  }

  if (error instanceof ApiHttpError) {
    return `API returned ${error.status} for ${resourceLabel}. Showing local fallback content.`;
  }

  if (error instanceof ApiNetworkError) {
    return `Unable to reach the API for ${resourceLabel}. Showing local fallback content.`;
  }

  return `Unexpected error while loading ${resourceLabel}. Showing local fallback content.`;
};

export const getMutationErrorMessage = (
  actionLabel: string,
  error: unknown
) => {
  if (error instanceof ApiHttpError) {
    if (error.status === 401 || error.status === 403) {
      return error.message || "Your admin session has expired. Please sign in again.";
    }

    return error.message || `Failed to ${actionLabel}.`;
  }

  if (error instanceof ApiContractError) {
    return `API response was invalid while trying to ${actionLabel}.`;
  }

  if (error instanceof ApiNetworkError) {
    return `Unable to reach the API to ${actionLabel}.`;
  }

  return `Unexpected error while trying to ${actionLabel}.`;
};
