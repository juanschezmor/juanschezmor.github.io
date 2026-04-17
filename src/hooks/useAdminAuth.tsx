import { AdminAuthContext } from "../context/AdminAuth/AdminAuthContext";
import { useRequiredContext } from "./useRequiredContext";

export const useAdminAuth = () =>
  useRequiredContext(AdminAuthContext, "useAdminAuth");

