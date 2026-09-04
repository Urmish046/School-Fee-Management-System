import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface AcademicSession {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface AcademicClass {
  class_id: number;
  class_name: string;
  created_at: string;
  sections: Array<{ id: number; name: string }>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}`,
    );
  }
  return data;
}

export async function getAcademicSessions(): Promise<AcademicSession[]> {
  const res = await fetch(apiUrl("/api/academic/sessions"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const json = await handleResponse<{
    success: boolean;
    count: number;
    data: AcademicSession[];
  }>(res);
  return json.data;
}

export async function createAcademicSession(
  name: string,
): Promise<AcademicSession> {
  const res = await fetch(apiUrl("/api/academic/sessions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name }),
  });
  const json = await handleResponse<{
    message: string;
    session: AcademicSession;
  }>(res);
  return json.session;
}

export async function updateAcademicSession(
  id: number,
  payload: { name?: string; is_active?: boolean },
): Promise<AcademicSession> {
  const res = await fetch(apiUrl(`/api/academic/sessions/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{
    success: boolean;
    message: string;
    session: AcademicSession;
  }>(res);
  return json.session;
}

export async function getAcademicClasses(): Promise<AcademicClass[]> {
  const res = await fetch(apiUrl("/api/academic/classes"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const json = await handleResponse<{
    success: boolean;
    count: number;
    data: AcademicClass[];
  }>(res);
  return json.data;
}

export async function executePromotion(payload: {
  from_class_id: number;
  to_class_id: number;
  from_session_id: number;
  to_session_id: number;
}) {
  const response = await fetch(apiUrl("/api/academic/promote"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean; message: string; count: number }>(
    response,
  );
}
