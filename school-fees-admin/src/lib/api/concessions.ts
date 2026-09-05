import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface ApiConcession {
  id: number;
  concession_no: string;
  record_type: "Concession" | "Scholarship";
  applies_to: "Family" | "Student";
  family_id: number;
  student_id?: number | null;
  father_parent_name?: string | null;
  student_name?: string | null;
  admission_number?: string | null;
  scholarship_name?: string | null;
  discount_type: "Percentage" | "Fixed";
  value: number | string;
  reason: string;
  status: "Active" | "Inactive" | "Expired";
  approval: "Approved" | "Pending" | "Rejected";
  start_date?: string | null;
  end_date?: string | null;
  remarks?: string | null;
  created_by_name?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  date: string;
  performed_by_name?: string | null;
}

export interface CreateConcessionPayload {
  record_type: "Concession" | "Scholarship";
  applies_to: "Family" | "Student";
  family_id?: number;
  student_id?: number;
  scholarship_name?: string;
  discount_type: "Percentage" | "Fixed";
  value: number;
  reason: string;
  status?: "Active" | "Inactive";
  approval?: "Approved" | "Pending" | "Rejected";
  start_date?: string;
  end_date?: string;
  remarks?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  return data as T;
}

export async function listConcessions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  record_type?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.status && params.status !== "all")
    query.set("status", params.status);
  if (params?.record_type && params.record_type !== "all")
    query.set("record_type", params.record_type);

  const res = await fetch(apiUrl(`/api/concessions?${query.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{
    success: boolean;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    data: ApiConcession[];
    auditLogs: AuditLog[];
  }>(res);
}

export async function createConcession(payload: CreateConcessionPayload) {
  const res = await fetch(apiUrl("/api/concessions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{
    success: boolean;
    message: string;
    data: ApiConcession;
  }>(res);
}

export async function toggleConcessionStatus(
  id: number | string,
  status: string,
) {
  const res = await fetch(apiUrl(`/api/concessions/${id}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse<{
    success: boolean;
    message: string;
    data: ApiConcession;
  }>(res);
}

export async function deleteConcession(id: number | string) {
  const res = await fetch(apiUrl(`/api/concessions/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{ success: boolean; message: string }>(res);
}
