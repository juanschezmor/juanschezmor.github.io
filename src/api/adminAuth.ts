import type { AdminSessionInfo, AdminSessionSnapshot } from "../types/AdminAuth";
import { fetchJson, sendJson } from "./client";
import {
  mapAdminSessionFromApi,
  mapAdminSessionSnapshotFromApi,
} from "./mappers";

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export const loginAdmin = (input: AdminLoginPayload) =>
  sendJson<AdminSessionSnapshot, AdminLoginPayload>(
    "/auth/login",
    "POST",
    input,
    mapAdminSessionSnapshotFromApi
  );

export const getAdminSession = () =>
  fetchJson<AdminSessionInfo>("/auth/session", mapAdminSessionFromApi, {
    requiresAuth: true,
  });

