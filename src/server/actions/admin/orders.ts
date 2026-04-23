"use server";

import { coreClient } from "@/server/core/coreClient";

export interface AdminOrderItem {
  id?: string;
  _id?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  driverName?: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  createdAt?: string;
}

export interface OrdersListResponse {
  items: AdminOrderItem[];
  total: number;
  page: number;
  limit: number;
}

interface GetOrdersActionInput {
  status?: string;
  startDate?: string;
  endDate?: string;
  customer?: string;
  driver?: string;
  page?: number;
  limit?: number;
}

export async function getOrdersAction({
  status,
  startDate,
  endDate,
  customer,
  driver,
  page = 1,
  limit = 20,
}: GetOrdersActionInput = {}): Promise<OrdersListResponse> {
  return coreClient.get<OrdersListResponse>("/admin/orders", {
    status: status?.trim() || undefined,
    startDate: startDate?.trim() || undefined,
    endDate: endDate?.trim() || undefined,
    customer: customer?.trim() || undefined,
    driver: driver?.trim() || undefined,
    page,
    limit,
  });
}

export async function getOrderDetails(orderId: string): Promise<Record<string, unknown>> {
  return coreClient.get<Record<string, unknown>>(`/admin/orders/${orderId}`);
}
