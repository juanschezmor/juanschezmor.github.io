import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
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
const tableName = process.env.ACTIVITIES_TABLE ?? "Activities";
const allowedMethods = "POST,OPTIONS";

const corsHeaders = buildCorsHeaders(allowedMethods);

const sanitizeTextMap = (value) => ({
  en: value?.en?.trim() ?? "",
  es: value?.es?.trim() ?? "",
});

const sanitizeMonthValue = (value) => {
  const normalizedValue =
    typeof value === "string" ? value.trim() : "";

  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return "";
};

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    requireAdminSession(event);
    const payload = parseJsonBody(event);
    const label = sanitizeTextMap(payload.label);
    const description = sanitizeTextMap(payload.description);
    const startDate = sanitizeMonthValue(payload.start_date);
    const endDate = sanitizeMonthValue(payload.end_date);

    if (
      !startDate ||
      !label.en ||
      !label.es ||
      !description.en ||
      !description.es
    ) {
      return jsonResponse(
        400,
        {
          message:
            "start_date, label, and description are required in en and es.",
        },
        allowedMethods
      );
    }

    if (endDate && endDate < startDate) {
      return jsonResponse(
        400,
        {
          message: "end_date cannot be earlier than start_date.",
        },
        allowedMethods
      );
    }

    const item = {
      id: randomUUID(),
      start_date: startDate,
      end_date: endDate || undefined,
      label,
      description,
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return jsonResponse(201, item, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to create activity.");
  }
};
