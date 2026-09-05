import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface ApiPaymentListItem {
  id: number;
  receipt_no: string;
  invoice_id: number;
  family_id: number;
  student_id?: number | null;
  amount_paid: number | string;
  payment_method: string;
  payment_date: string;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
  father_parent_name: string;
  father_contact?: string | null;
  challan_no: string;
  billing_month: string;
  received_by_user?: string | null;
}

export interface CollectPaymentPayload {
  invoice_id: number;
  amount_paid: number;
  payment_method?: string;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
}

export interface StudentPaymentHistoryItem {
  id: number;
  receipt_no: string;
  amount_paid: number | string;
  payment_method: string;
  payment_date: string;
  challan_no: string;
  billing_month: string;
  received_by_user?: string | null;
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

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.payment_method && params.payment_method !== "all") {
    query.set("payment_method", params.payment_method);
  }
  if (params?.search) query.set("search", params.search);

  const res = await fetch(apiUrl(`/api/payments?${query.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{
    success: boolean;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    data: ApiPaymentListItem[];
  }>(res);
}

export async function collectInvoicePayment(payload: CollectPaymentPayload) {
  const res = await fetch(apiUrl("/api/payments/collect"), {
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
    data: {
      payment: ApiPaymentListItem;
      invoice: {
        id: number;
        total_payable: number;
        paid_amount: number;
        remaining_balance: number;
        status: string;
      };
    };
  }>(res);
}

export async function getStudentPaymentHistory(studentId: number | string) {
  const res = await fetch(apiUrl(`/api/payments/student/${studentId}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });

  return handleResponse<{
    success: boolean;
    data: StudentPaymentHistoryItem[];
  }>(res);
}
