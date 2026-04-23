"use server";

import { redirect } from "next/navigation";

import { coreClient } from "@/server/core/coreClient";
import { CoreApiError } from "@/server/core/coreErrors";

export type ClientStatus = "ATIVO" | "BLOQUEADO" | "ACTIVE" | "BLOCKED";

export interface ClientListItem {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: ClientStatus | string;
  createdAt?: string;
}

export interface ClientsListResponse {
  items: ClientListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientAddressItem {
  id?: string;
  label?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ClientOrderHistoryItem {
  id?: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
}

export interface ClientByIdResponse {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status?: string;
  createdAt?: string;
  addresses?: ClientAddressItem[];
  savedAddresses?: ClientAddressItem[];
  orderHistory?: ClientOrderHistoryItem[];
  orders?: ClientOrderHistoryItem[];
  [key: string]: unknown;
}

interface GetClientsActionInput {
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
}

export async function getClientsAction({
  name,
  email,
  page = 1,
  limit = 20,
}: GetClientsActionInput = {}): Promise<ClientsListResponse> {
  return coreClient.get<ClientsListResponse>("/admin/clients", {
    name: name?.trim() || undefined,
    email: email?.trim() || undefined,
    page,
    limit,
  });
}

function resolveClientId(formData: FormData): string {
  const clientId = String(formData.get("clientId") ?? "").trim();
  if (!clientId) {
    throw new Error("clientId is required");
  }
  return clientId;
}

function resolveOptionalReason(formData: FormData): string | undefined {
  const reason = String(formData.get("reason") ?? "").trim();
  return reason.length > 0 ? reason : undefined;
}

function redirectWithResult(clientId: string, action: string, result: "success" | "error", message: string): never {
  const search = new URLSearchParams({
    action,
    result,
    message,
  });
  redirect(`/clients/${clientId}?${search.toString()}`);
}

async function executeClientStatusAction(path: string, payload: { reason?: string }): Promise<void> {
  try {
    await coreClient.patch(path, payload);
    return;
  } catch (error) {
    if (error instanceof CoreApiError && (error.status === 404 || error.status === 405)) {
      await coreClient.post(path, payload);
      return;
    }
    throw error;
  }
}

export async function getClientByIdAction(clientId: string): Promise<ClientByIdResponse> {
  return coreClient.get<ClientByIdResponse>(`/admin/clients/${clientId}`);
}

export async function blockClientAction(formData: FormData): Promise<void> {
  const clientId = resolveClientId(formData);
  const payload = {
    reason: resolveOptionalReason(formData),
  };
  let result: "success" | "error" = "success";
  let message = "Cliente bloqueado com sucesso.";
  try {
    await executeClientStatusAction(`/admin/clients/${clientId}/block`, payload);
  } catch (error) {
    result = "error";
    message = error instanceof CoreApiError ? error.message : "Falha ao bloquear cliente.";
  }
  redirectWithResult(clientId, "block", result, message);
}

export async function unblockClientAction(formData: FormData): Promise<void> {
  const clientId = resolveClientId(formData);
  const payload = {
    reason: resolveOptionalReason(formData),
  };
  let result: "success" | "error" = "success";
  let message = "Cliente desbloqueado com sucesso.";
  try {
    await executeClientStatusAction(`/admin/clients/${clientId}/unblock`, payload);
  } catch (error) {
    result = "error";
    message = error instanceof CoreApiError ? error.message : "Falha ao desbloquear cliente.";
  }
  redirectWithResult(clientId, "unblock", result, message);
}
