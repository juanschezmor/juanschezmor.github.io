import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  authErrorResponse,
  buildCorsHeaders,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.SKILLS_TABLE ?? "Skills";
const validCategories = new Set(["Frontend", "Backend", "Tools"]);
const allowedMethods = "POST,OPTIONS";
const corsHeaders = buildCorsHeaders(allowedMethods);

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    requireAdminSession(event);
    const payload =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};
    const skill = payload.skill?.trim();
    const category = payload.category?.trim();

    if (!skill || !validCategories.has(category)) {
      return jsonResponse(
        400,
        {
          message: "skill and a valid category are required.",
        },
        allowedMethods
      );
    }

    const item = {
      id: randomUUID(),
      skill,
      category,
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return jsonResponse(201, item, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to create skill.");
  }
};
