import "server-only";

import { clearAdminSession, getAdminSession, setAdminSession, type AdminSession } from "@/server/auth/adminSession";

import { CoreApiError } from "./coreErrors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface CoreRequestInput {
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  accessToken?: string;
  cache?: RequestCache;
}

function resolveCoreApiBaseUrl(): string {
  const baseUrl = process.env.CORE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new CoreApiError(
      "CORE_API_BASE_URL não está definida. No .env do admin, use a URL base da API (ex.: http://localhost:3001/api/v1).",
      500,
    );
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

function summarizeFetchFailure(error: unknown): string {
  if (!(error instanceof Error)) {
    return "falha de rede desconhecida";
  }
  const parts = [error.message];
  const cause = error.cause;
  if (cause instanceof Error && cause.message) {
    parts.push(cause.message);
  } else if (typeof cause === "string" && cause.trim()) {
    parts.push(cause.trim());
  }
  const code = "code" in error ? String((error as NodeJS.ErrnoException).code ?? "") : "";
  if (code) {
    parts.push(`(${code})`);
  }
  return parts.join(" ");
}

async function fetchCoreResponse(
  input: CoreRequestInput,
  accessToken: string,
): Promise<{ response: Response; payload: unknown }> {
  const headers = new Headers({
    Accept: "application/json",
  });
  headers.set("authorization", `Bearer ${accessToken}`);

  const method = input.method ?? "GET";
  const hasBody = input.body !== undefined;
  if (hasBody) {
    headers.set("content-type", "application/json");
  }

  const url = buildUrl(input.path, input.query);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(input.body) : undefined,
      cache: input.cache ?? "no-store",
    });
  } catch (error) {
    if (error instanceof CoreApiError) {
      throw error;
    }
    throw new CoreApiError(
      `Não foi possível contatar a API Core (${summarizeFetchFailure(error)}). Confira CORE_API_BASE_URL e se o tahnamao-core está em execução na porta esperada.`,
      503,
      error,
    );
  }

  if (response.status === 204) {
    return { response, payload: undefined };
  }

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown;
  try {
    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }
  } catch (error) {
    throw new CoreApiError(
      "A API Core retornou um corpo de resposta inválido (não foi possível interpretar JSON ou texto).",
      response.status >= 400 ? response.status : 502,
      error,
    );
  }

  return { response, payload };
}

async function refreshAdminSessionWithCore(session: AdminSession): Promise<boolean> {
  if (!session.refreshToken) {
    return false;
  }

  let response: Response;
  try {
    response = await fetch(`${resolveCoreApiBaseUrl()}/admin/auth/refresh`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof CoreApiError) {
      throw error;
    }
    throw new CoreApiError(
      `Sessão expirada e não foi possível renovar com a API Core (${summarizeFetchFailure(error)}).`,
      503,
      error,
    );
  }

  const body = (await response.json().catch(() => ({}))) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!response.ok || !body.accessToken || !body.refreshToken) {
    await clearAdminSession();
    return false;
  }

  await setAdminSession({
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    email: session.email,
    createdAt: session.createdAt,
  });

  return true;
}

export async function requestCore<T>(input: CoreRequestInput): Promise<T> {
  const usesSessionToken = !input.accessToken;
  let session = usesSessionToken ? await getAdminSession() : null;

  let accessToken = input.accessToken ?? session?.accessToken;

  if (!accessToken) {
    throw new CoreApiError("Admin session is missing access token", 401);
  }

  let { response, payload } = await fetchCoreResponse(input, accessToken);

  if (
    !response.ok &&
    response.status === 401 &&
    usesSessionToken &&
    session?.refreshToken
  ) {
    const refreshed = await refreshAdminSessionWithCore(session);
    if (refreshed) {
      session = await getAdminSession();
      accessToken = session?.accessToken;
      if (accessToken) {
        ({ response, payload } = await fetchCoreResponse(input, accessToken));
      }
    }
  }

  if (response.status === 204) {
    return undefined as T;
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
