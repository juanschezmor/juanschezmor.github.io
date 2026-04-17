import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.SKILLS_TABLE ?? "Skills";

export const handler = async () => {
  const result = await client.send(new ScanCommand({ TableName: tableName }));

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    },
    body: JSON.stringify(result.Items ?? []),
  };
};
