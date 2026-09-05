import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface ApiExpense {
  id: number;
  expense_no: string;
  title: string;
  category: string;
  amount: number | string;
  payment_method: string;
  paid_to?: string | null;
  reference_no?: string | null;
  expense_date: string;
  remarks?: string | null;
  account_id?: number | null;
  account_name?: string | null;
  recorded_by_name?: string | null;
  created_at: string;
}

export interface CreateExpensePayload {
  title: string;
  category: string;
  amount: number;
  payment_method?: string;
  paid_to?: string;
  reference_no?: string;
  expense_date?: string;
  remarks?: string;
  account_id?: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function listExpenses(params?: {
  page?: number;
  limit?: number;
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.category && params.category !== "all")
    query.set("category", params.category);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(apiUrl(`/api/expenses?${query.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{
    success: boolean;
    totalCount: number;
    totalExpensesSum: number;
    totalPages: number;
    currentPage: number;
    data: ApiExpense[];
  }>(res);
}

export async function createExpense(payload: CreateExpensePayload) {
  const res = await fetch(apiUrl("/api/expenses"), {
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
    data: ApiExpense;
  }>(res);
}

export async function updateExpense(
  id: number | string,
  payload: Partial<CreateExpensePayload>,
) {
  const res = await fetch(apiUrl(`/api/expenses/${id}`), {
    method: "PATCH",
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
    data: ApiExpense;
  }>(res);
}

export async function deleteExpense(id: number | string) {
  const res = await fetch(apiUrl(`/api/expenses/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{ success: boolean; message: string }>(res);
}
