import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export type AccountType = "Cash" | "Bank" | "JazzCash" | "Easypaisa";

export interface ApiAccount {
  id: number;
  name: string;
  type: AccountType;
  account_number?: string | null;
  opening_balance: number | string;
  total_inflow: number | string;
  total_outflow: number | string;
  closing_balance: number | string;
  is_active: boolean;
}

export interface ApiAccountTransaction {
  id: number;
  account_id: number;
  amount: number | string;
  type: "INFLOW" | "OUTFLOW";
  category: string;
  reference_id?: string | null;
  description?: string | null;
  transaction_date: string;
  created_by_name?: string | null;
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

export async function getAccounts(): Promise<ApiAccount[]> {
  const res = await fetch(apiUrl("/api/accounts"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const json = await handleResponse<{ success: boolean; data: ApiAccount[] }>(
    res,
  );
  return json.data;
}

export async function createAccount(payload: {
  name: string;
  type: AccountType;
  account_number?: string;
  opening_balance?: number;
}): Promise<ApiAccount> {
  const res = await fetch(apiUrl("/api/accounts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{ success: boolean; data: ApiAccount }>(
    res,
  );
  return json.data;
}

export async function getAccountTransactions(
  accountId: number | string,
): Promise<ApiAccountTransaction[]> {
  const res = await fetch(apiUrl(`/api/accounts/${accountId}/transactions`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const json = await handleResponse<{
    success: boolean;
    data: ApiAccountTransaction[];
  }>(res);
  return json.data;
}
