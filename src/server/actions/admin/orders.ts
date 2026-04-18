"use server";

import { coreClient } from "@/server/core/coreClient";

import { CoreApiError } from "@/server/core/coreErrors";

export interface AdminOrderItem {
  id: string;
  customerName?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
}

interface ListOrdersResponse {
  items: AdminOrderItem[];
  total: number;
  page: number;
  pageSize: number;
}

function resolveOrdersPaths() {
  return {
    list: process.env.CORE_ADMIN_ORDERS_LIST_PATH?.trim(),
    details: process.env.CORE_ADMIN_ORDERS_DETAILS_PATH_TEMPLATE?.trim(),
  };
}

function assertPath(path: string | undefined, capability: string): string {
  if (!path) {
    throw new CoreApiError(
      `Core contract for ${capability} is not configured in this workspace. Set the corresponding CORE_ADMIN_ORDERS_* env path and update docs/contracts/consumer-core-mapping.md.`,
      501,
    );
  }
  return path;
}

function interpolate(template: string, orderId: string): string {
  return template.replace(":orderId", orderId).replace("{orderId}", orderId);
}

export async function listOrders(page = 1, pageSize = 20): Promise<ListOrdersResponse> {
  const listPath = assertPath(resolveOrdersPaths().list, "orders list");
  return coreClient.get<ListOrdersResponse>(listPath, { page, pageSize });
}

export async function getOrderDetails(orderId: string): Promise<Record<string, unknown>> {
  const detailsPath = assertPath(resolveOrdersPaths().details, "orders details");
  return coreClient.get<Record<string, unknown>>(interpolate(detailsPath, orderId));
}
