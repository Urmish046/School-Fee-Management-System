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

// Section shape returned by GET /api/class-fees/classes/:classId/sections
// (matches getSectionsByClass() in classFeeModel.js, i.e. the raw `sections`
// table row — includes class_id, unlike the leaner ApiClassSection above).
export type ApiSection = {
  id: number;
  class_id: number;
  name: string;
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
  // FIX: this previously pointed at /api/fee-components, which doesn't
  // exist — server.js mounts the fee-structure router at /api/fees, and
  // its routes file defines the components endpoint as /components.
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

// NEW: single class lookup — used on the student detail page to show the
// class's total base fee (per-student fee isn't stored; it's derived from
// the class's fee structure).
export async function getClass(id: number | string) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiClass;
  }>;
}

// NEW: for the Student form's Class -> Section dependent selects.
// Backend route: GET /api/class-fees/classes/:classId/sections
// (unauthenticated by role — any logged-in user can read it, per classFeeRoutes.js)
export async function getSectionsByClass(classId: number) {
  const response = await fetch(
    apiUrl(`/api/class-fees/classes/${classId}/sections`),
    {
      headers: { Accept: "application/json", ...getAuthHeaders() },
    },
  );
  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiSection[];
  }>;
}
