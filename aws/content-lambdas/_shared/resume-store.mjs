import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const dynamoBaseClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
export const dynamoClient = DynamoDBDocumentClient.from(dynamoBaseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const resumesTableName = process.env.RESUMES_TABLE ?? "Resumes";
export const resumesBucketName = process.env.RESUMES_BUCKET;
export const resumesByLanguageIndexName =
  process.env.RESUMES_BY_LANGUAGE_INDEX ?? "LanguageUploadedAtIndex";
export const resumeHistoryLimit = Math.max(
  1,
  Number(process.env.RESUME_HISTORY_LIMIT ?? 5)
);
export const resumeMaxFileBytes = Math.max(
  1024 * 1024,
  Number(process.env.RESUME_MAX_FILE_BYTES ?? 5 * 1024 * 1024)
);

export const validResumeLanguages = new Set(["en", "es"]);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Expose-Headers":
    "Content-Disposition,Content-Length,Content-Type",
};

const isRecord = (value) => typeof value === "object" && value !== null;

export const optionsResponse = {
  statusCode: 204,
  headers: corsHeaders,
  body: "",
};

export const jsonResponse = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    ...corsHeaders,
    ...headers,
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const binaryResponse = (statusCode, buffer, headers = {}) => ({
  statusCode,
  isBase64Encoded: true,
  headers: {
    ...corsHeaders,
    ...headers,
  },
  body: buffer.toString("base64"),
});

export const parseJsonBody = (event) => {
  if (!event?.body) {
    return {};
  }

  if (typeof event.body !== "string") {
    return event.body;
  }

  return JSON.parse(event.body);
};

export const ensureResumeStorageConfigured = () => {
  if (!resumesBucketName) {
    throw new Error("RESUMES_BUCKET environment variable is required.");
  }
};

export const normalizeResumeRecord = (item) => {
  if (!isRecord(item)) {
    return null;
  }

  const {
    id,
    language,
    file_name,
    storage_key,
    content_type,
    size_bytes,
    uploaded_at,
    is_active,
  } = item;

  if (
    typeof id !== "string" ||
    typeof language !== "string" ||
    !validResumeLanguages.has(language) ||
    typeof file_name !== "string" ||
    typeof storage_key !== "string" ||
    typeof content_type !== "string" ||
    typeof size_bytes !== "number" ||
    typeof uploaded_at !== "string" ||
    typeof is_active !== "boolean"
  ) {
    return null;
  }

  return {
    id,
    language,
    file_name,
    storage_key,
    content_type,
    size_bytes,
    uploaded_at,
    is_active,
  };
};

export const listResumeRecords = async () => {
  const languages = Array.from(validResumeLanguages);
  const itemsByLanguage = await Promise.all(
    languages.map((language) => listResumeRecordsByLanguage(language))
  );

  return itemsByLanguage
    .flat()
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
};

export const listResumeRecordsByLanguage = async (language) => {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: resumesTableName,
      IndexName: resumesByLanguageIndexName,
      KeyConditionExpression: "#language = :language",
      ExpressionAttributeNames: {
        "#language": "language",
      },
      ExpressionAttributeValues: {
        ":language": language,
      },
      ScanIndexForward: false,
    })
  );

  return (response.Items ?? [])
    .map((item) => normalizeResumeRecord(item))
    .filter(Boolean);
};

export const getResumeRecordById = async (id) => {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: resumesTableName,
      Key: { id },
    })
  );

  return normalizeResumeRecord(response.Item) ?? null;
};

export const getActiveResumeRecord = async (language) => {
  const items = await listResumeRecordsByLanguage(language);
  return items.find((item) => item.is_active) ?? null;
};

export const sanitizeResumeLanguage = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  return validResumeLanguages.has(value) ? value : null;
};

export const sanitizeResumeFileName = (value, language) => {
  const normalized =
    typeof value === "string" ? value.trim().replace(/\s+/g, "-") : "";
  const safeName = normalized.replace(/[^a-zA-Z0-9._-]/g, "");
  const baseName = safeName.replace(/\.pdf$/i, "") || `${language}-resume`;

  return `${baseName}.pdf`;
};

export const createResumeStorageKey = (language, fileName) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `resumes/${language}/${timestamp}-${randomUUID()}-${fileName}`;
};

export const uploadResumeObject = async ({
  storageKey,
  fileBuffer,
  contentType,
}) => {
  ensureResumeStorageConfigured();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: resumesBucketName,
      Key: storageKey,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );
};

export const deleteResumeObject = async (storageKey) => {
  ensureResumeStorageConfigured();

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: resumesBucketName,
      Key: storageKey,
    })
  );
};

export const createResumeRecord = async (item) => {
  await dynamoClient.send(
    new PutCommand({
      TableName: resumesTableName,
      Item: item,
    })
  );
};

export const updateResumeActiveState = async (id, isActive) => {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: resumesTableName,
      Key: { id },
      UpdateExpression: "SET is_active = :isActive",
      ExpressionAttributeValues: {
        ":isActive": isActive,
      },
    })
  );
};

export const deleteResumeRecord = async (id) => {
  await dynamoClient.send(
    new DeleteCommand({
      TableName: resumesTableName,
      Key: { id },
    })
  );
};

export const activateResumeRecord = async (resumeId) => {
  const targetResume = await getResumeRecordById(resumeId);

  if (!targetResume) {
    return null;
  }

  const languageResumes = await listResumeRecordsByLanguage(targetResume.language);
  const currentlyActiveResumes = languageResumes.filter(
    (resume) => resume.id !== targetResume.id && resume.is_active
  );

  await dynamoClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: resumesTableName,
            Key: { id: targetResume.id },
            UpdateExpression: "SET is_active = :isActive",
            ExpressionAttributeValues: {
              ":isActive": true,
            },
          },
        },
        ...currentlyActiveResumes.map((resume) => ({
          Update: {
            TableName: resumesTableName,
            Key: { id: resume.id },
            UpdateExpression: "SET is_active = :isActive",
            ExpressionAttributeValues: {
              ":isActive": false,
            },
          },
        })),
      ],
    })
  );

  return {
    ...targetResume,
    is_active: true,
  };
};

export const pruneResumeHistory = async (language) => {
  const languageResumes = await listResumeRecordsByLanguage(language);
  const keepIds = new Set();
  const activeResume = languageResumes.find((resume) => resume.is_active);

  if (activeResume) {
    keepIds.add(activeResume.id);
  }

  for (const resume of languageResumes) {
    if (keepIds.size >= resumeHistoryLimit) {
      break;
    }

    keepIds.add(resume.id);
  }

  const removableResumes = languageResumes.filter(
    (resume) => !keepIds.has(resume.id)
  );

  await Promise.all(
    removableResumes.map(async (resume) => {
      await deleteResumeObject(resume.storage_key);
      await deleteResumeRecord(resume.id);
    })
  );
};

export const buildResumeManifest = async () => ({
  max_history: resumeHistoryLimit,
  items: await listResumeRecords(),
});

export const readResumeObject = async (storageKey) => {
  ensureResumeStorageConfigured();

  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: resumesBucketName,
      Key: storageKey,
    })
  );

  if (!response.Body) {
    throw new Error("Resume object body is empty.");
  }

  if (typeof response.Body.transformToByteArray === "function") {
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  const chunks = [];

  for await (const chunk of response.Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};
