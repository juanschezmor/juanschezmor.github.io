import { createContext } from "react";
import type { AdminLoginPayload } from "../../api/adminAuth";
import type { AdminSessionSnapshot } from "../../types/AdminAuth";

export interface AdminAuthContextValue {
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
