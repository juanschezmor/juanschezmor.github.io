const DEFAULT_API_BASE_URL =
  "https://gte913rmml.execute-api.eu-north-1.amazonaws.com/prod";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
