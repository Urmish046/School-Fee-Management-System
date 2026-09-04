import { apiUrl, getAuthHeaders } from "@/lib/api/config";
import {
  formToApiPayload,
  type ApiFamily,
  type ApiFamilyListResponse,
  type ApiFamilyResponse,
  type FamilyFormValues,
} from "@/lib/family-adapters";

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.error || `Families request failed: ${response.status}`,
    );
  }
  return body;
}

// NOTE: page/limit/search query param names are assumed to match the
// convention your /api/students and /api/class-fees list endpoints use.
// Confirmed shape of the response body itself from your GET /api/families
// sample; the query params on this call are the one unverified assumption.
export async function listFamilies(page = 1, limit = 100, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());

  const response = await fetch(apiUrl(`/api/families?${params.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<ApiFamilyListResponse>;
}

export async function getFamily(id: string | number) {
  const response = await fetch(apiUrl(`/api/families/${id}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const body = (await readResponse(response)) as ApiFamilyResponse;
  return body.data;
}

export async function updateFamily(id: string, form: FamilyFormValues) {
  const response = await fetch(apiUrl(`/api/families/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(formToApiPayload(form)),
  });
  const body = (await readResponse(response)) as { data: ApiFamily };
  return body.data;
}

export async function deleteFamily(id: string) {
  const response = await fetch(apiUrl(`/api/families/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response);
}
