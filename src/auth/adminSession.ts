import type { AdminSessionSnapshot } from "../types/AdminAuth";

const ADMIN_SESSION_STORAGE_KEY = "portfolio-admin-session";
const ADMIN_SESSION_CHANGED_EVENT = "portfolio-admin-session-changed";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const canUseWindow = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const notifyAdminSessionChanged = () => {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
};

export const isAdminSessionExpired = (expiresAt: string) => {
  const expiresAtMs = Date.parse(expiresAt);
  return !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now();
};

export const getStoredAdminSession = (): AdminSessionSnapshot | null => {
  if (!canUseWindow()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (
      !isRecord(parsed) ||
      typeof parsed.token !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.expires_at !== "string"
    ) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return null;
    }

    if (isAdminSessionExpired(parsed.expires_at)) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return null;
    }

    return {
      token: parsed.token,
      username: parsed.username,
      expires_at: parsed.expires_at,
    };
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return null;
  }
};

export const setStoredAdminSession = (session: AdminSessionSnapshot) => {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(
    ADMIN_SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
  notifyAdminSessionChanged();
};

export const clearStoredAdminSession = () => {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  notifyAdminSessionChanged();
};

export const subscribeToAdminSessionChanges = (
  onChange: (session: AdminSessionSnapshot | null) => void
) => {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const handleChange = () => {
    onChange(getStoredAdminSession());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_SESSION_STORAGE_KEY) {
      handleChange();
    }
  };

  window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};

