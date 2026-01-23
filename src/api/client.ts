import { getStoredToken } from "../auth/authStorage";

export const API_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

type ApiError = Error & {
  status: number;
  details?: unknown;
};

const buildUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let details: unknown = text;

    try {
      details = text ? JSON.parse(text) : null;
    } catch {
      details = text;
    }

    let message: string = "Request failed";
    if (
      details &&
      typeof details === "object" &&
      "error" in details &&
      typeof (details as { error?: unknown }).error === "string"
    ) {
      message = (details as { error: string }).error;
    } else if (typeof details === "string" && details.trim()) {
      message = details;
    } else if (response.statusText) {
      message = response.statusText;
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.details = details;
    throw error;
  }

  return parseResponse<T>(response);
};
