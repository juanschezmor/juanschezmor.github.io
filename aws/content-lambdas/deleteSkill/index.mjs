import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {
  authErrorResponse,
  isOptionsRequest,
  jsonResponse,
  optionsResponse,
  requireAdminSession,
} from "../_shared/admin-auth.mjs";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.SKILLS_TABLE ?? "Skills";
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

    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id },
      })
    );

    return jsonResponse(200, { success: true, id }, allowedMethods);
  } catch (error) {
    return authErrorResponse(error, allowedMethods, "Failed to delete skill.");
  }
};
