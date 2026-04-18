import "server-only";

import { getAdminSession } from "@/server/auth/adminSession";

import { CoreApiError } from "./coreErrors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface CoreRequestInput {
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  adminId?: string;
  cache?: RequestCache;
}

function resolveCoreApiBaseUrl(): string {
  const baseUrl = process.env.CORE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("Missing required env CORE_API_BASE_URL");
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(path: string, query?: CoreRequestInput["query"]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${resolveCoreApiBaseUrl()}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function resolveAdminId(explicitAdminId?: string): Promise<string | undefined> {
  if (explicitAdminId) {
    return explicitAdminId;
  }

  const session = await getAdminSession();
  if (session?.adminId) {
    return session.adminId;
  }

  return process.env.ADMIN_DEFAULT_ID?.trim();
}

function normalizeErrorMessage(status: number, details: unknown): string {
  if (typeof details === "object" && details && "message" in details) {
    const message = (details as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  if (status === 401) {
    return "Unauthorized request to core API";
  }

  if (status === 403) {
    return "Forbidden request to core API";
  }

  return "Core API request failed";
}

export async function requestCore<T>(input: CoreRequestInput): Promise<T> {
  const adminId = await resolveAdminId(input.adminId);
  const headers = new Headers({
    Accept: "application/json",
  });

  if (adminId) {
    headers.set("x-admin-id", adminId);
  }

  const method = input.method ?? "GET";
  const hasBody = input.body !== undefined;
  if (hasBody) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(buildUrl(input.path, input.query), {
    method,
    headers,
    body: hasBody ? JSON.stringify(input.body) : undefined,
    cache: input.cache ?? "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    throw new CoreApiError(normalizeErrorMessage(response.status, payload), response.status, payload);
  }

  return payload as T;
}

export const coreClient = {
  get: <T>(path: string, query?: CoreRequestInput["query"]) =>
    requestCore<T>({ path, method: "GET", query }),
  post: <T>(path: string, body?: unknown) => requestCore<T>({ path, method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => requestCore<T>({ path, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => requestCore<T>({ path, method: "PUT", body }),
  delete: <T>(path: string, body?: unknown) => requestCore<T>({ path, method: "DELETE", body }),
};
