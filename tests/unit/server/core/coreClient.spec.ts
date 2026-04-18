import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminSessionMock } = vi.hoisted(() => ({
  getAdminSessionMock: vi.fn(),
}));

vi.mock("@/server/auth/adminSession", () => ({
  getAdminSession: getAdminSessionMock,
  setAdminSession: vi.fn(),
  clearAdminSession: vi.fn(),
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
    getAdminSessionMock.mockResolvedValue(null);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("builds URL with query and sends bearer token from session", async () => {
    getAdminSessionMock.mockResolvedValue({
      accessToken: "admin-access-token",
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
    expect(headers.get("authorization")).toBe("Bearer admin-access-token");
    expect(headers.get("accept")).toBe("application/json");
    expect(result).toEqual({ status: "ok" });
  });

  it("throws when session access token is missing", async () => {
    await expect(
      requestCore<{ ok: boolean }>({
        path: "/health/live",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<CoreApiError>>({
        status: 401,
        message: "Admin session is missing access token",
      }),
    );
  });

  it("throws CoreApiError with API message when response is not ok", async () => {
    getAdminSessionMock.mockResolvedValue({
      accessToken: "admin-access-token",
      email: "admin@tahnamao.local",
      createdAt: new Date().toISOString(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(403, {
        message: "admin role is required to access admin routes",
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
        message: "admin role is required to access admin routes",
      }),
    );
  });

  it("refreshes admin session once on 401 then retries the original request", async () => {
    getAdminSessionMock
      .mockResolvedValueOnce({
        accessToken: "expired-access",
        refreshToken: "refresh-1",
        email: "admin@tahnamao.local",
        createdAt: "2026-01-01T00:00:00.000Z",
      })
      .mockResolvedValueOnce({
        accessToken: "new-access",
        refreshToken: "refresh-2",
        email: "admin@tahnamao.local",
        createdAt: "2026-01-01T00:00:00.000Z",
      });

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(401, {
          message: "invalid access token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: "new-access",
          refreshToken: "refresh-2",
          tokenType: "Bearer",
          expiresInSeconds: 900,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          status: "ok",
        }),
      );

    const result = await requestCore<{ status: string }>({
      path: "/admin/drivers/pending",
    });

    expect(result).toEqual({ status: "ok" });
    expect(vi.mocked(fetch).mock.calls.length).toBe(3);

    const refreshCall = vi.mocked(fetch).mock.calls[1] as [string, RequestInit];
    expect(refreshCall[0]).toBe("http://localhost:3001/api/v1/admin/auth/refresh");
    const refreshBody = JSON.parse(String(refreshCall[1].body));
    expect(refreshBody).toEqual({ refreshToken: "refresh-1" });
  });

  it("returns undefined for 204 responses", async () => {
    getAdminSessionMock.mockResolvedValue({
      accessToken: "admin-access-token",
      email: "admin@tahnamao.local",
      createdAt: new Date().toISOString(),
    });

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
