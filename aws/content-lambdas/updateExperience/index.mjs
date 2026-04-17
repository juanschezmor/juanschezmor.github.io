import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
const allowedMethods = "PUT,OPTIONS";

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
    const id = Number(event.pathParameters?.id);
    const payload = parseJsonBody(event);

    if (!id) {
      return jsonResponse(400, { message: "id is required." }, allowedMethods);
    }

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

    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id },
        ConditionExpression: "attribute_exists(id)",
        UpdateExpression:
          "SET company = :company, period = :period, #roles = :roles",
        ExpressionAttributeNames: {
          "#roles": "roles",
        },
        ExpressionAttributeValues: {
          ":company": company,
          ":period": period,
          ":roles": roles,
        },
      })
    );

    return jsonResponse(200, { success: true, id }, allowedMethods);
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") {
      return jsonResponse(404, { message: "Experience not found." }, allowedMethods);
    }

    if (error?.name === "ValidationException" && error?.message) {
      return jsonResponse(400, { message: error.message }, allowedMethods);
    }

    return authErrorResponse(error, allowedMethods, "Failed to update experience.");
  }
};
