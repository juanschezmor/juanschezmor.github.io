import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.ACTIVITIES_TABLE ?? "Activities";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const sanitizeTextMap = (value) => ({
  en: value?.en?.trim() ?? "",
  es: value?.es?.trim() ?? "",
});

export const handler = async (event) => {
  const payload =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};

  const label = sanitizeTextMap(payload.label);
  const description = sanitizeTextMap(payload.description);
  const date = payload.date?.trim();

  if (!date || !label.en || !label.es || !description.en || !description.es) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "date, label, and description are required in en and es.",
      }),
    };
  }

  const item = {
    id: randomUUID(),
    date,
    label,
    description,
  };

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );

  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify(item),
  };
};
