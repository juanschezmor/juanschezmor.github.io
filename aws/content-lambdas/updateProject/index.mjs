import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.PROJECTS_TABLE ?? "Projects";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "PUT,OPTIONS",
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
  const id = event.pathParameters?.id;
  const payload =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};

  if (!id) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "id is required." }),
    };
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
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "title, description, and bullet_points are required in en and es.",
      }),
    };
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

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, id }),
  };
};
