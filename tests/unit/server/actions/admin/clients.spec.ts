import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("@/server/core/coreClient", () => ({
  coreClient: {
    get: getMock,
  },
}));

import { getClientsAction } from "@/server/actions/admin/clients";

describe("getClientsAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls core admin clients endpoint with filters and pagination", async () => {
    getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 2,
      limit: 25,
    });

    const result = await getClientsAction({
      name: "Maria",
      email: "maria@email.com",
      page: 2,
      limit: 25,
    });

    expect(getMock).toHaveBeenCalledWith("/admin/clients", {
      name: "Maria",
      email: "maria@email.com",
      page: 2,
      limit: 25,
    });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 2,
      limit: 25,
    });
  });

  it("uses default pagination and omits blank filters", async () => {
    getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await getClientsAction({
      name: " ",
      email: "",
    });

    expect(getMock).toHaveBeenCalledWith("/admin/clients", {
      name: undefined,
      email: undefined,
      page: 1,
      limit: 20,
    });
  });
});
