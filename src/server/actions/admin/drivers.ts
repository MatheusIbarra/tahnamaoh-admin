"use server";

import { coreClient } from "@/server/core/coreClient";

export interface PendingDriver {
  _id: string;
  fullName: string;
  cpf?: string;
  status: string;
  onboardingStep?: string;
  createdAt?: string;
}

export interface PendingDriversResponse {
  items: PendingDriver[];
  total: number;
  page: number;
  pageSize: number;
}

export type DriverListStatus =
  | "PENDENTE_APROVACAO"
  | "DISPONIVEL"
  | "EM_CORRIDA"
  | "BLOQUEADO";

export interface DriverListItem {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  cpf?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

export interface DriversListResponse {
  items: DriverListItem[];
  total: number;
  page: number;
  limit: number;
}

interface GetDriversActionInput {
  status?: DriverListStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DriverReviewSnapshot {
  driver: Record<string, unknown>;
  latestDocuments: Array<Record<string, unknown>>;
}

interface AdminDecisionInput {
  reason?: string;
  notes?: string;
  checkedCpfMatch?: boolean;
  checkedFaceMatch?: boolean;
  checkedDocumentReadability?: boolean;
  checkedFraudSignals?: boolean;
}

interface AdminDocumentDecisionInput {
  reason?: string;
}

interface OkResponse {
  status: "ok";
}

export async function listPendingDrivers(page = 1, pageSize = 20): Promise<PendingDriversResponse> {
  return coreClient.get<PendingDriversResponse>("/admin/drivers/pending", {
    page,
    pageSize,
  });
}

export async function getDriversAction({
  status,
  search,
  page = 1,
  limit = 20,
}: GetDriversActionInput = {}): Promise<DriversListResponse> {
  return coreClient.get<DriversListResponse>("/admin/drivers", {
    status,
    search,
    page,
    limit,
  });
}

export async function getDriverReviewSnapshot(driverId: string): Promise<DriverReviewSnapshot> {
  return coreClient.get<DriverReviewSnapshot>(`/admin/drivers/${driverId}`);
}

export async function approveDriver(driverId: string, payload: AdminDecisionInput): Promise<OkResponse> {
  return coreClient.post<OkResponse>(`/admin/drivers/${driverId}/approve`, payload);
}

export async function rejectDriver(driverId: string, payload: AdminDecisionInput): Promise<OkResponse> {
  return coreClient.post<OkResponse>(`/admin/drivers/${driverId}/reject`, payload);
}

export async function blockDriver(driverId: string, payload: AdminDecisionInput): Promise<OkResponse> {
  return coreClient.post<OkResponse>(`/admin/drivers/${driverId}/block`, payload);
}

export async function unblockDriver(driverId: string, payload: AdminDecisionInput): Promise<OkResponse> {
  return coreClient.post<OkResponse>(`/admin/drivers/${driverId}/unblock`, payload);
}

export async function approveDriverDocument(
  driverId: string,
  documentId: string,
  payload: AdminDocumentDecisionInput,
): Promise<OkResponse> {
  return coreClient.post<OkResponse>(
    `/admin/drivers/${driverId}/documents/${documentId}/approve`,
    payload,
  );
}

export async function rejectDriverDocument(
  driverId: string,
  documentId: string,
  payload: AdminDocumentDecisionInput,
): Promise<OkResponse> {
  return coreClient.post<OkResponse>(
    `/admin/drivers/${driverId}/documents/${documentId}/reject`,
    payload,
  );
}
