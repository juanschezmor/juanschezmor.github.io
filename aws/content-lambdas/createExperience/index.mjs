import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.EXPERIENCES_TABLE ?? "Experiences";

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

  const company = payload.company?.trim();
  const period = sanitizeTextMap(payload.period);
  const roles = Array.isArray(payload.roles)
    ? payload.roles.map((role) => ({
        id: Number(role.id),
        title: sanitizeTextMap(role.title),
        description: sanitizeTextListMap(role.description),
      }))
    : [];

  if (!company || !period.en || !period.es || roles.length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "company, period, and at least one role are required.",
      }),
    };
  }

  const invalidRole = roles.some(
    (role) =>
      !role.id ||
      !role.title.en ||
      !role.title.es ||
      role.description.en.length === 0 ||
      role.description.es.length === 0
  );

  if (invalidRole) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Every role must have id, title, and description in en and es.",
      }),
    };
  }

  const scan = await client.send(new ScanCommand({ TableName: tableName }));
  const existingIds = (scan.Items ?? []).map((item) => Number(item.id)).filter(Boolean);
  const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

  const item = {
    id: nextId,
    company,
    period,
    roles,
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
