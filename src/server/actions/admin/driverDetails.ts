"use server";

import { redirect } from "next/navigation";

import { coreClient } from "@/server/core/coreClient";
import { CoreApiError } from "@/server/core/coreErrors";

export interface DriverRaceHistoryItem {
  id?: string;
  date?: string;
  status?: string;
  origin?: string;
  destination?: string;
  distanceKm?: number;
  totalValue?: number;
}

export interface DriverDetail {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status?: string;
  cnh?: Record<string, unknown>;
  vehicle?: Record<string, unknown>;
  raceHistory?: DriverRaceHistoryItem[];
  [key: string]: unknown;
}

export interface DriverByIdResponse {
  driver: DriverDetail;
  latestDocuments?: Array<Record<string, unknown>>;
}

interface AdminDecisionPayload {
  reason?: string;
  notes?: string;
  checkedCpfMatch?: boolean;
  checkedFaceMatch?: boolean;
  checkedDocumentReadability?: boolean;
  checkedFraudSignals?: boolean;
}

function resolveDriverId(formData: FormData): string {
  const driverId = String(formData.get("driverId") ?? "").trim();
  if (!driverId) {
    throw new Error("driverId is required");
  }
  return driverId;
}

function resolveOptionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function resolveBoolean(formData: FormData, key: string): boolean | undefined {
  if (!formData.has(key)) {
    return undefined;
  }
  const value = String(formData.get(key) ?? "").toLowerCase();
  return value === "on" || value === "true" || value === "1";
}

function resolveDecisionPayload(formData: FormData): AdminDecisionPayload {
  return {
    reason: resolveOptionalString(formData, "reason"),
    notes: resolveOptionalString(formData, "notes"),
    checkedCpfMatch: resolveBoolean(formData, "checkedCpfMatch"),
    checkedFaceMatch: resolveBoolean(formData, "checkedFaceMatch"),
    checkedDocumentReadability: resolveBoolean(formData, "checkedDocumentReadability"),
    checkedFraudSignals: resolveBoolean(formData, "checkedFraudSignals"),
  };
}

function redirectWithResult(driverId: string, action: string, result: "success" | "error", message: string): never {
  const search = new URLSearchParams({
    action,
    result,
    message,
  });
  redirect(`/drivers/${driverId}?${search.toString()}`);
}

export async function getDriverByIdAction(driverId: string): Promise<DriverByIdResponse> {
  return coreClient.get<DriverByIdResponse>(`/admin/drivers/${driverId}`);
}

async function executeDriverStatusAction(path: string, payload: AdminDecisionPayload): Promise<void> {
  try {
    await coreClient.post(path, payload);
    return;
  } catch (error) {
    if (error instanceof CoreApiError && (error.status === 404 || error.status === 405)) {
      await coreClient.patch(path, payload);
      return;
    }
    throw error;
  }
}

export async function approveDriverAction(formData: FormData): Promise<void> {
  const driverId = resolveDriverId(formData);
  const payload = resolveDecisionPayload(formData);
  if (!payload.reason) {
    redirectWithResult(driverId, "approve", "error", "approval reason is required");
  }
  let result: "success" | "error" = "success";
  let message = "Motorista aprovado com sucesso.";
  try {
    await executeDriverStatusAction(`/admin/drivers/${driverId}/approve`, payload);
  } catch (error) {
    result = "error";
    message = error instanceof CoreApiError ? error.message : "Falha ao aprovar motorista.";
  }
  redirectWithResult(driverId, "approve", result, message);
}

export async function blockDriverAction(formData: FormData): Promise<void> {
  const driverId = resolveDriverId(formData);
  const payload = resolveDecisionPayload(formData);
  if (!payload.reason) {
    redirectWithResult(driverId, "block", "error", "block reason is required");
  }
  let result: "success" | "error" = "success";
  let message = "Motorista bloqueado com sucesso.";
  try {
    await executeDriverStatusAction(`/admin/drivers/${driverId}/block`, payload);
  } catch (error) {
    result = "error";
    message = error instanceof CoreApiError ? error.message : "Falha ao bloquear motorista.";
  }
  redirectWithResult(driverId, "block", result, message);
}

export async function unblockDriverAction(formData: FormData): Promise<void> {
  const driverId = resolveDriverId(formData);
  const payload = resolveDecisionPayload(formData);
  let result: "success" | "error" = "success";
  let message = "Motorista desbloqueado com sucesso.";
  try {
    await executeDriverStatusAction(`/admin/drivers/${driverId}/unblock`, payload);
  } catch (error) {
    result = "error";
    message = error instanceof CoreApiError ? error.message : "Falha ao desbloquear motorista.";
  }
  redirectWithResult(driverId, "unblock", result, message);
}
