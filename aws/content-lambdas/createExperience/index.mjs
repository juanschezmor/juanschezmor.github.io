import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  authErrorResponse,
  buildCorsHeaders,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.EXPERIENCES_TABLE ?? "Experiences";
const allowedMethods = "POST,OPTIONS";

const corsHeaders = buildCorsHeaders(allowedMethods);

const sanitizeTextMap = (value) => ({
  en: value?.en?.trim() ?? "",
  es: value?.es?.trim() ?? "",
});

const sanitizeTextListMap = (value) => ({
  en: Array.isArray(value?.en)
    ? value.en.map((item) => item.trim()).filter(Boolean)
    : [],
  es: Array.isArray(value?.es)
    ? value.es.map((item) => item.trim()).filter(Boolean)
    : [],
});

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    requireAdminSession(event);
    const payload = parseJsonBody(event);

    const company = payload.company?.trim();
    const period = sanitizeTextMap(payload.period);
    const roles = Array.isArray(payload.roles)
      ? payload.roles.map((role) => ({
          id: Number(role.id),
          title: sanitizeTextMap(role.title),
          description: sanitizeTextListMap(role.description),
        }))
      : [];

    if (!company || !period.en || !period.es || roles.length === 0) {
      return jsonResponse(
        400,
        {
          message: "company, period, and at least one role are required.",
        },
        allowedMethods
      );
    }

    const invalidRole = roles.some(
      (role) =>
        !role.id ||
        !role.title.en ||
        !role.title.es ||
        role.description.en.length === 0 ||
        role.description.es.length === 0
    );

    if (invalidRole) {
      return jsonResponse(
        400,
        {
          message: "Every role must have id, title, and description in en and es.",
        },
        allowedMethods
      );
    }

    const scan = await client.send(new ScanCommand({ TableName: tableName }));
    const existingIds = (scan.Items ?? [])
      .map((item) => Number(item.id))
      .filter(Boolean);
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    const item = {
      id: nextId,
      company,
      period,
      roles,
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return jsonResponse(201, item, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to create experience.");
  }
};
