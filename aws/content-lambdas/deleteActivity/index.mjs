import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.ACTIVITIES_TABLE ?? "Activities";

export const handler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "DELETE,OPTIONS",
      },
      body: JSON.stringify({ message: "id is required." }),
    };
  }

  await client.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { id },
    })
  );

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "DELETE,OPTIONS",
    },
    body: JSON.stringify({ success: true, id }),
  };
};
