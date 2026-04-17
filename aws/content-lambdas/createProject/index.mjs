import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.PROJECTS_TABLE ?? "Projects";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

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
  const payload =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};

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
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "title, description, and bullet_points are required in en and es.",
      }),
    };
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

  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify(item),
  };
};
