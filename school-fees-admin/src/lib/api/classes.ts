import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export type ApiClassSection = { id: number; name: string };
export type ApiClassFee = {
  fee_component_id: number;
  name: string;
  amount: number | string;
};
export type ApiClass = {
  class_id: number;
  class_name: string;
  sections: ApiClassSection[];
  fees: ApiClassFee[];
  total_base_fee: number | string;
};
export type ApiClassListResponse = {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ApiClass[];
};

// NEW: the master list of fee components — no more guessing IDs on the frontend
export type ApiFeeComponent = { id: number; name: string };

export type ClassFeeInput =
  | { fee_component_id: number; amount: number } // existing component
  | { fee_component_name: string; amount: number }; // new component — backend upserts

export type ClassPayload = {
  name: string;
  sections: string[];
  academic_session_id?: number;
  fees: ClassFeeInput[];
};

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error || `Request failed: ${response.status}`);
  return body;
}

export async function listClasses(page: number, limit: number, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());
  const response = await fetch(apiUrl(`/api/class-fees?${params.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<ApiClassListResponse>;
}

// NEW
export async function listFeeComponents() {
  const response = await fetch(apiUrl("/api/fees/components"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiFeeComponent[];
  }>;
}

export async function createClass(payload: ClassPayload) {
  const response = await fetch(apiUrl("/api/class-fees"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return readResponse(response);
}

export async function updateClass(id: number, payload: ClassPayload) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return readResponse(response);
}

export async function deleteClass(id: number) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response);
}
