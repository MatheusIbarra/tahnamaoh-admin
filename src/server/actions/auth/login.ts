"use server";

import { decodeJwt } from "jose";
import { redirect } from "next/navigation";

import { setAdminSession } from "@/server/auth/adminSession";
import { CoreApiError } from "@/server/core/coreErrors";

function resolveCoreApiBaseUrl(): string {
  const baseUrl = process.env.CORE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("Missing required env CORE_API_BASE_URL");
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function loginInCore(email: string, password: string): Promise<{ accessToken: string }> {
  const response = await fetch(`${resolveCoreApiBaseUrl()}/admin/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    accessToken?: string;
  };

  if (!response.ok || !payload.accessToken) {
    throw new CoreApiError(
      payload.message ?? "Unable to login on core admin auth endpoint",
      response.status || 500,
      payload,
    );
  }

  return { accessToken: payload.accessToken };
}

function isMissingEnvError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Missing required env");
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const code = "code" in error ? String((error as NodeJS.ErrnoException).code ?? "") : "";
  const msg = error.message.toLowerCase();
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    msg.includes("fetch failed")
  );
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect("/login?error=invalid_credentials");
  }

  try {
    const { accessToken } = await loginInCore(email, password);
    const jwtPayload = decodeJwt(accessToken) as { sub?: string };

    await setAdminSession({
      accessToken,
      email,
      createdAt: new Date().toISOString(),
    });

    if (!jwtPayload.sub) {
      redirect("/login?error=session_invalid");
    }
  } catch (error) {
    if (error instanceof CoreApiError) {
      if (error.status === 401 || error.status === 403) {
        redirect("/login?error=invalid_credentials");
      }
      redirect("/login?error=core_unavailable");
    }
    if (isMissingEnvError(error)) {
      redirect("/login?error=misconfigured");
    }
    if (isNetworkError(error)) {
      redirect("/login?error=core_unavailable");
    }
    redirect("/login?error=unexpected");
  }

  redirect("/dashboard");
}
