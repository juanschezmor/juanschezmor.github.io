import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";
import { deleteManagedProjectImageByUrl } from "../_shared/project-images.mjs";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.PROJECTS_TABLE ?? "Projects";
const allowedMethods = "DELETE,OPTIONS";

export const handler = async (event) => {
  if (isOptionsRequest(event)) {
    return optionsResponse(allowedMethods);
  }

  try {
    requireAdminSession(event);
    const id = event.pathParameters?.id;

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

    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id },
      })
    );

    if (typeof currentProject.image === "string") {
      try {
        await deleteManagedProjectImageByUrl(currentProject.image);
      } catch (cleanupError) {
        console.error("Failed to clean up deleted project image.", cleanupError);
      }
    }

    return jsonResponse(200, { success: true, id }, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to delete project.");
  }
};
