import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.EXPERIENCES_TABLE ?? "Experiences";

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
  const id = Number(event.pathParameters?.id);
  const payload =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body ?? {};

  if (!id) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "id is required." }),
    };
  }

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

  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: "SET company = :company, period = :period, roles = :roles",
      ExpressionAttributeValues: {
        ":company": company,
        ":period": period,
        ":roles": roles,
      },
    })
  );

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, id }),
  };
};
