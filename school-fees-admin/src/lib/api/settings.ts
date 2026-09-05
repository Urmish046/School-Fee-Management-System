import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface SystemSettings {
  id: number;
  school_name: string;
  phone: string;
  email: string;
  address: string;
  bank_name: string;
  account_no: string;
  late_fee_per_day: number | string;
  challan_instructions: string;
  updated_at?: string;
}

export async function getSettings(): Promise<SystemSettings> {
  const res = await fetch(apiUrl("/api/settings"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Failed to load settings");
  return data.data;
}

export async function updateSettings(
  payload: Partial<SystemSettings>,
): Promise<SystemSettings> {
  const res = await fetch(apiUrl("/api/settings"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Failed to save settings");
  return data.data;
}
