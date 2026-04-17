import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAdminSession, type AdminLoginPayload, loginAdmin } from "../../api/adminAuth";
import {
  clearStoredAdminSession,
  getStoredAdminSession,
  isAdminSessionExpired,
  setStoredAdminSession,
  subscribeToAdminSessionChanges,
} from "../../auth/adminSession";
import type { AdminSessionSnapshot } from "../../types/AdminAuth";

interface AdminAuthContextValue {
  session: AdminSessionSnapshot | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: AdminLoginPayload) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export const AdminAuthContext = createContext<
  AdminAuthContextValue | undefined
>(undefined);

const getInitialSession = () => {
  const session = getStoredAdminSession();

  if (!session || isAdminSessionExpired(session.expires_at)) {
    clearStoredAdminSession();
    return null;
  }

  return session;
};

export function AdminAuthProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<AdminSessionSnapshot | null>(
    getInitialSession
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAdminSessionChanges((nextSession) => {
      setSession(nextSession);
    });

    return unsubscribe;
  }, []);

  const logout = useCallback(() => {
    clearStoredAdminSession();
    setSession(null);
  }, []);

  const login = useCallback(async (input: AdminLoginPayload) => {
    setLoading(true);

    try {
      const nextSession = await loginAdmin(input);
      setStoredAdminSession(nextSession);
      setSession(nextSession);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const currentSession = getStoredAdminSession();

    if (!currentSession || isAdminSessionExpired(currentSession.expires_at)) {
      logout();
      return;
    }

    setLoading(true);

    try {
      const refreshedSession = await getAdminSession();
      const nextSession = {
        ...currentSession,
        username: refreshedSession.username,
        expires_at: refreshedSession.expires_at,
      };

      setStoredAdminSession(nextSession);
      setSession(nextSession);
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      session,
      loading,
      isAuthenticated: session !== null,
      login,
      logout,
      refreshSession,
    }),
    [session, loading, login, logout, refreshSession]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

