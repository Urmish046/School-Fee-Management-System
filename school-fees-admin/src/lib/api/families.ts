import { apiUrl, getAuthHeaders } from "@/lib/api/config";
import { formToApiPayload, type ApiFamily, type FamilyFormValues } from "@/lib/family-adapters";

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `Families request failed: ${response.status}`);
  }
  return body;
}

export async function updateFamily(id: string, form: FamilyFormValues) {
  const response = await fetch(apiUrl(`/api/families/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(formToApiPayload(form)),
  });
  const body = await readResponse(response) as { data: ApiFamily };
  return body.data;
}

export async function deleteFamily(id: string) {
  const response = await fetch(apiUrl(`/api/families/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response);
}
