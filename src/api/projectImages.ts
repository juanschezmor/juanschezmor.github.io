import { ApiContractError, sendJson } from "./client";

export interface ProjectImageAsset {
  file_name: string;
  content_type: string;
  size_bytes: number;
  storage_key: string;
  url: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown, fieldName: string) => {
  if (typeof value === "string") {
    return value;
  }

  throw new ApiContractError(`Expected "${fieldName}" to be a string.`);
};

const readNumber = (value: unknown, fieldName: string) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  throw new ApiContractError(`Expected "${fieldName}" to be a number.`);
};

const mapProjectImageAssetFromApi = (value: unknown): ProjectImageAsset => {
  if (!isRecord(value)) {
    throw new ApiContractError("Expected project image payload to be an object.");
  }

  return {
    file_name: readString(value.file_name, "file_name"),
    content_type: readString(value.content_type, "content_type"),
    size_bytes: readNumber(value.size_bytes, "size_bytes"),
    storage_key: readString(value.storage_key, "storage_key"),
    url: readString(value.url, "url"),
  };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error(`Failed to read ${file.name}.`));
    };

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`Failed to read ${file.name}.`));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });

const extractBase64Payload = (dataUrl: string) => {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);

  if (!match?.[1]) {
    throw new Error("Expected image file to be encoded as base64 data URL.");
  }

  return match[1];
};

export const uploadProjectImage = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);

  return sendJson<
    ProjectImageAsset,
    {
      file_name: string;
      content_type: string;
      file_base64: string;
    }
  >(
    "/project-images",
    "POST",
    {
      file_name: file.name,
      content_type: file.type,
      file_base64: extractBase64Payload(dataUrl),
    },
    mapProjectImageAssetFromApi,
    { requiresAuth: true }
  );
};
