"use server";

import { coreClient } from "@/server/core/coreClient";

import { CoreApiError } from "@/server/core/coreErrors";

export interface CustomerItem {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

interface ListCustomersResponse {
  items: CustomerItem[];
  total: number;
  page: number;
  pageSize: number;
}

function resolveCustomersPaths() {
  return {
    list: process.env.CORE_ADMIN_CUSTOMERS_LIST_PATH?.trim(),
    block: process.env.CORE_ADMIN_CUSTOMERS_BLOCK_PATH_TEMPLATE?.trim(),
    unblock: process.env.CORE_ADMIN_CUSTOMERS_UNBLOCK_PATH_TEMPLATE?.trim(),
  };
}

function assertPath(path: string | undefined, capability: string): string {
  if (!path) {
    throw new CoreApiError(
      `Core contract for ${capability} is not configured in this workspace. Set the corresponding CORE_ADMIN_CUSTOMERS_* env path and update docs/contracts/consumer-core-mapping.md.`,
      501,
    );
  }
  return path;
}

function interpolate(template: string, customerId: string): string {
  return template.replace(":customerId", customerId).replace("{customerId}", customerId);
}

export async function listCustomers(page = 1, pageSize = 20): Promise<ListCustomersResponse> {
  const listPath = assertPath(resolveCustomersPaths().list, "customers list");
  return coreClient.get<ListCustomersResponse>(listPath, { page, pageSize });
}

export async function blockCustomer(customerId: string, reason?: string): Promise<{ status: "ok" }> {
  const blockPath = assertPath(resolveCustomersPaths().block, "customers block");
  return coreClient.post<{ status: "ok" }>(interpolate(blockPath, customerId), {
    reason,
  });
}

export async function unblockCustomer(customerId: string, reason?: string): Promise<{ status: "ok" }> {
  const unblockPath = assertPath(resolveCustomersPaths().unblock, "customers unblock");
  return coreClient.post<{ status: "ok" }>(interpolate(unblockPath, customerId), {
    reason,
  });
}
