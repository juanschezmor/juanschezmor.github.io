import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const projectImagesBucketName = process.env.PROJECT_IMAGES_BUCKET;
export const projectImageMaxFileBytes = Math.max(
  1024 * 1024,
  Number(process.env.PROJECT_IMAGE_MAX_FILE_BYTES ?? 5 * 1024 * 1024)
);

const region = process.env.AWS_REGION ?? "eu-north-1";
const s3Client = new S3Client({ region });

const validProjectImageContentTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

const sanitizePathSegment = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

const encodeStorageKey = (storageKey) =>
  storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const getProjectImageHostCandidates = () => [
  `${projectImagesBucketName}.s3.${region}.amazonaws.com`,
  `${projectImagesBucketName}.s3.amazonaws.com`,
];

export const ensureProjectImageStorageConfigured = () => {
  if (!projectImagesBucketName) {
    throw new Error("PROJECT_IMAGES_BUCKET environment variable is required.");
  }
};

export const sanitizeProjectImageFileName = (fileName) => {
  const normalizedValue =
    typeof fileName === "string" ? fileName.trim() : "";
  const sanitizedName = sanitizePathSegment(normalizedValue);

  return sanitizedName || "project-image";
};

export const sanitizeProjectImageContentType = (contentType) => {
  const normalizedValue =
    typeof contentType === "string" ? contentType.trim().toLowerCase() : "";

  return validProjectImageContentTypes.has(normalizedValue)
    ? normalizedValue
    : null;
};

export const createProjectImageStorageKey = (fileName) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `project-images/${timestamp}-${randomUUID()}-${fileName}`;
};

export const buildProjectImageUrl = (storageKey) => {
  ensureProjectImageStorageConfigured();
  return `https://${projectImagesBucketName}.s3.${region}.amazonaws.com/${encodeStorageKey(storageKey)}`;
};

export const uploadProjectImageObject = async ({
  storageKey,
  fileBuffer,
  contentType,
}) => {
  ensureProjectImageStorageConfigured();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: projectImagesBucketName,
      Key: storageKey,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      ServerSideEncryption: "AES256",
    })
  );
};

export const deleteProjectImageObject = async (storageKey) => {
  ensureProjectImageStorageConfigured();

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: projectImagesBucketName,
      Key: storageKey,
    })
  );
};

export const extractManagedProjectImageStorageKey = (imageUrl) => {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);

    if (!getProjectImageHostCandidates().includes(parsedUrl.host)) {
      return null;
    }

    const storageKey = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
    return storageKey || null;
  } catch {
    return null;
  }
};

export const deleteManagedProjectImageByUrl = async (imageUrl) => {
  const storageKey = extractManagedProjectImageStorageKey(imageUrl);

  if (!storageKey) {
    return false;
  }

  await deleteProjectImageObject(storageKey);
  return true;
};
