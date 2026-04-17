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
const tableName = process.env.PROJECTS_TABLE ?? "Projects";
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

    const title = sanitizeTextMap(payload.title);
    const description = sanitizeTextMap(payload.description);
    const bulletPoints = sanitizeTextListMap(payload.bullet_points);

    if (
      !title.en ||
      !title.es ||
      !description.en ||
      !description.es ||
      bulletPoints.en.length === 0 ||
      bulletPoints.es.length === 0
    ) {
      return jsonResponse(
        400,
        {
          message: "title, description, and bullet_points are required in en and es.",
        },
        allowedMethods
      );
    }

    const item = {
      id: randomUUID(),
      title,
      description,
      bullet_points: bulletPoints,
      github_link: payload.github_link?.trim() || undefined,
      live_link: payload.live_link?.trim() || undefined,
      image: payload.image?.trim() || undefined,
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return jsonResponse(201, item, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to create project.");
  }
};
