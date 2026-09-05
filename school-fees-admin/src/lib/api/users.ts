import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ApiRole {
  id: number;
  name: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function listUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);

  const res = await fetch(apiUrl(`/api/users?${query.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{
    success: boolean;
    count: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    data: ApiUser[];
  }>(res);
}

export async function getRoles(): Promise<ApiRole[]> {
  const res = await fetch(apiUrl("/api/users/roles"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const json = await handleResponse<{ success: boolean; data: ApiRole[] }>(res);
  return json.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  role_id: number;
  password?: string;
}) {
  const res = await fetch(apiUrl("/api/users"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ success: boolean; user: ApiUser; message: string }>(
    res,
  );
}

export async function updateUser(
  id: number | string,
  payload: Partial<{
    name: string;
    email: string;
    role_id: number;
    is_active: boolean;
    password?: string;
  }>,
) {
  const res = await fetch(apiUrl(`/api/users/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ success: boolean; user: ApiUser; message: string }>(
    res,
  );
}

export async function deleteUser(id: number | string) {
  const res = await fetch(apiUrl(`/api/users/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{ success: boolean; message: string }>(res);
}
