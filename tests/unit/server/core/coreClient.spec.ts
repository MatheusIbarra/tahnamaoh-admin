import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminSessionMock } = vi.hoisted(() => ({
  getAdminSessionMock: vi.fn(),
}));

vi.mock("@/server/auth/adminSession", () => ({
  getAdminSession: getAdminSessionMock,
}));

import { CoreApiError } from "@/server/core/coreErrors";
import { requestCore } from "@/server/core/coreClient";

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("requestCore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CORE_API_BASE_URL = "http://localhost:3001/api/v1";
    process.env.ADMIN_DEFAULT_ID = "admin-env";
    getAdminSessionMock.mockResolvedValue(null);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("builds URL with query and sends x-admin-id from session", async () => {
    getAdminSessionMock.mockResolvedValue({
      adminId: "admin-session",
      email: "admin@tahnamao.local",
      createdAt: new Date().toISOString(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(200, {
        status: "ok",
      }),
    );

    const result = await requestCore<{ status: string }>({
      path: "/admin/drivers/pending",
      method: "GET",
      query: { page: 2, pageSize: 15 },
    });

    const [url, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:3001/api/v1/admin/drivers/pending?page=2&pageSize=15");

    const headers = new Headers(options.headers);
    expect(headers.get("x-admin-id")).toBe("admin-session");
    expect(headers.get("accept")).toBe("application/json");
    expect(result).toEqual({ status: "ok" });
  });

  it("falls back to ADMIN_DEFAULT_ID when session is absent", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await requestCore<{ ok: boolean }>({
      path: "/health/live",
    });

    const [, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = new Headers(options.headers);
    expect(headers.get("x-admin-id")).toBe("admin-env");
  });

  it("throws CoreApiError with API message when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(403, {
        message: "x-admin-id header is required",
      }),
    );

    await expect(
      requestCore({
        path: "/admin/drivers/pending",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<CoreApiError>>({
        name: "CoreApiError",
        status: 403,
        message: "x-admin-id header is required",
      }),
    );
  });

  it("returns undefined for 204 responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, {
        status: 204,
      }),
    );

    const result = await requestCore<void>({
      path: "/auth/logout",
      method: "POST",
    });

    expect(result).toBeUndefined();
  });
});
