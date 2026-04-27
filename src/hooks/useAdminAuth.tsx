import { AdminAuthContext } from "../context/AdminAuth/AdminAuthContextValue";
import { useRequiredContext } from "./useRequiredContext";

export const useAdminAuth = () =>
  useRequiredContext(AdminAuthContext, "useAdminAuth");

