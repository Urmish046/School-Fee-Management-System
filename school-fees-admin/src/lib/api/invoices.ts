import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export type InvoiceStatus =
  | "Unpaid"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled"
  | "Waived";

export interface InvoiceItem {
  item_id: number;
  amount: number | string;
  student_id: number;
  student_name: string;
  admission_number: string;
  roll_number?: string | null;
  class_name: string;
  section_name?: string | null;
  component_id: number;
  component_name: string;
}

export interface ApiInvoice {
  id: number;
  challan_no: string;
  family_id: number;
  billing_month: string;
  due_date: string;
  subtotal_amount: number | string;
  concession_amount: number | string;
  previous_arrears: number | string;
  total_payable: number | string;
  paid_amount: number | string;
  status: InvoiceStatus;
  generated_by?: number | null;
  created_at: string;
  updated_at: string;
  family_id_code?: string;
  father_parent_name: string;
  mother_name?: string | null;
  father_contact?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  generated_by_user?: string | null;
  items?: InvoiceItem[];
}

export interface InvoiceListFilters {
  page?: number;
  limit?: number;
  billing_month?: string;
  status?: string;
  search?: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `Request failed: ${response.status}`);
  }
  return body as T;
}

export async function listInvoices(filters: InvoiceListFilters = {}) {
  const query = new URLSearchParams();
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.billing_month) query.set("billing_month", filters.billing_month);
  if (filters.status && filters.status !== "all")
    query.set("status", filters.status);
  if (filters.search) query.set("search", filters.search);

  const response = await fetch(
    apiUrl(`/api/billing/invoices?${query.toString()}`),
    {
      headers: { Accept: "application/json", ...getAuthHeaders() },
    },
  );

  return readResponse<{
    success: boolean;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    data: ApiInvoice[];
  }>(response);
}

export async function getInvoiceDetails(id: number | string) {
  const response = await fetch(apiUrl(`/api/billing/invoices/${id}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return readResponse<{ success: boolean; data: ApiInvoice }>(response);
}

export async function generateMonthlyInvoicesApi(payload: {
  billing_month: string;
  due_date: string;
  session_id: number;
}) {
  const response = await fetch(apiUrl("/api/billing/generate"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readResponse<{
    message: string;
    data: {
      createdCount: number;
      skippedCount: number;
      billing_month: string;
    };
  }>(response);
}
