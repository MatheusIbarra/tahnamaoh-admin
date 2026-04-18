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
