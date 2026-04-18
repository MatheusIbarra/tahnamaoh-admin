"use server";

import { coreClient } from "@/server/core/coreClient";

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
