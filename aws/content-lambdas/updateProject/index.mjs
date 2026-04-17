import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";
import { deleteManagedProjectImageByUrl } from "../_shared/project-images.mjs";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.PROJECTS_TABLE ?? "Projects";
const allowedMethods = "PUT,OPTIONS";

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
    const id = event.pathParameters?.id;
    const payload = parseJsonBody(event);

    if (!id) {
      return jsonResponse(400, { message: "id is required." }, allowedMethods);
    }

    const currentProjectResponse = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: { id },
      })
    );
    const currentProject = currentProjectResponse.Item;

    if (!currentProject) {
      return jsonResponse(404, { message: "Project not found." }, allowedMethods);
    }

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

    const updates = {
      title,
      description,
      bullet_points: bulletPoints,
      github_link: payload.github_link?.trim() || undefined,
      live_link: payload.live_link?.trim() || undefined,
      image: payload.image?.trim() || undefined,
    };

    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression:
          "SET title = :title, description = :description, bullet_points = :bulletPoints, github_link = :githubLink, live_link = :liveLink, image = :image",
        ExpressionAttributeValues: {
          ":title": updates.title,
          ":description": updates.description,
          ":bulletPoints": updates.bullet_points,
          ":githubLink": updates.github_link ?? null,
          ":liveLink": updates.live_link ?? null,
          ":image": updates.image ?? null,
        },
      })
    );

    if (
      typeof currentProject.image === "string" &&
      currentProject.image !== updates.image
    ) {
      try {
        await deleteManagedProjectImageByUrl(currentProject.image);
      } catch (cleanupError) {
        console.error("Failed to clean up previous project image.", cleanupError);
      }
    }

    return jsonResponse(200, { success: true, id }, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to update project.");
  }
};
