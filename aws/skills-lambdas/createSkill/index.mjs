import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.SKILLS_TABLE ?? "Skills";
const validCategories = new Set(["Frontend", "Backend", "Tools"]);

export const handler = async (event) => {
  const payload =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};
  const skill = payload.skill?.trim();
  const category = payload.category?.trim();

  if (!skill || !validCategories.has(category)) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: JSON.stringify({
        message: "skill and a valid category are required.",
      }),
    };
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

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
    body: JSON.stringify(item),
  };
};
