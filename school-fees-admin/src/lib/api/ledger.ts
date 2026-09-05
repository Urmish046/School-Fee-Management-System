import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface LedgerSummary {
  opening_balance: number;
  total_income: number;
  total_expense: number;
  closing_balance: number;
}

export interface LedgerTransaction {
  id: number;
  date: string;
  description: string;
  category: string;
  type: "INFLOW" | "OUTFLOW";
  amount: number | string;
  reference_id?: string | null;
  account_name: string;
  created_by_name?: string | null;
}

export interface LedgerResponse {
  success: boolean;
  summary: LedgerSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  transactions: LedgerTransaction[];
}

export async function getLedger(params?: {
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<LedgerResponse> {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const res = await fetch(apiUrl(`/api/ledger?${query.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}
