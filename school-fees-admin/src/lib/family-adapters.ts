export { API_URL, getAuthHeaders } from "@/lib/api/config";

// Shape returned by your Express/Postgres backend (snake_case columns).
// Note: Postgres `numeric` columns (family_concession) come back as strings
// via node-postgres, not numbers — e.g. "500.00".
export type ApiFamily = {
  id: number;
  father_parent_name: string;
  mother_name: string | null;
  cnic: string | null;
  father_contact: string;
  mother_contact: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
  admission_date: string | null; // ISO timestamp, e.g. "2026-09-03T19:00:00.000Z"
  family_concession: string | number | null;
  scholarship_info: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiFamilyListResponse = {
  success: boolean;
  count: number;
  pagination: ApiPagination;
  data: ApiFamily[];
};

export type ApiFamilyResponse = {
  success: boolean;
  message?: string;
  data: ApiFamily;
};

// The row shape used by the table — built directly from what the API
// actually returns, no invented/placeholder fields.
export type Family = {
  id: string;
  familyId: string; // display-only, e.g. "FAM-0003" — DB has no separate familyId column
  fatherName: string;
  motherName: string;
  cnic: string;
  contact: string;
  motherContact: string;
  whatsapp: string;
  email: string;
  address: string;
  emergencyContact: string;
  notes: string;
  admissionDate: string; // ISO string, format for display with formatDateForDisplay
  scholarshipInfo: string;
  concession: number;
  status: "Active" | "Inactive";
};

// The editable form shape used by both the "Add Family" dialog and the
// family detail/edit page.
export type FamilyFormValues = {
  fatherName: string;
  motherName: string;
  cnic: string;
  admissionDate: string;
  contact: string;
  motherContact: string;
  whatsapp: string;
  email: string;
  emergencyContact: string;
  address: string;
  notes: string;
  status: "Active" | "Inactive";
  scholarshipInfo: string;
  concessionValue: string;
};

export const emptyFamilyForm: FamilyFormValues = {
  fatherName: "",
  motherName: "",
  cnic: "",
  admissionDate: "",
  contact: "",
  motherContact: "",
  whatsapp: "",
  email: "",
  emergencyContact: "",
  address: "",
  notes: "",
  status: "Active",
  scholarshipInfo: "",
  concessionValue: "",
};

export function apiFamilyToFamily(f: ApiFamily): Family {
  return {
    id: String(f.id),
    familyId: `FAM-${String(f.id).padStart(4, "0")}`,
    fatherName: f.father_parent_name,
    motherName: f.mother_name ?? "",
    cnic: f.cnic ?? "",
    contact: f.father_contact,
    motherContact: f.mother_contact ?? "",
    whatsapp: f.whatsapp_number ?? "",
    email: f.email ?? "",
    address: f.address ?? "",
    emergencyContact: f.emergency_contact ?? "",
    notes: f.notes ?? "",
    admissionDate: f.admission_date ?? "",
    scholarshipInfo: f.scholarship_info ?? "",
    concession: f.family_concession != null ? Number(f.family_concession) : 0,
    status: f.is_active ? "Active" : "Inactive",
  };
}

// Turns an ApiFamily straight into form values, for prefilling the edit form.
export function apiFamilyToForm(f: ApiFamily): FamilyFormValues {
  return {
    fatherName: f.father_parent_name,
    motherName: f.mother_name ?? "",
    cnic: f.cnic ?? "",
    admissionDate: formatDateForInput(f.admission_date),
    contact: f.father_contact,
    motherContact: f.mother_contact ?? "",
    whatsapp: f.whatsapp_number ?? "",
    email: f.email ?? "",
    emergencyContact: f.emergency_contact ?? "",
    address: f.address ?? "",
    notes: f.notes ?? "",
    status: f.is_active ? "Active" : "Inactive",
    scholarshipInfo: f.scholarship_info ?? "",
    concessionValue: f.family_concession != null ? String(Number(f.family_concession)) : "",
  };
}

export function formToApiPayload(form: FamilyFormValues) {
  return {
    father_parent_name: form.fatherName,
    mother_name: form.motherName || null,
    cnic: form.cnic || null,
    father_contact: form.contact,
    mother_contact: form.motherContact || null,
    whatsapp_number: form.whatsapp || null,
    email: form.email || null,
    address: form.address || null,
    emergency_contact: form.emergencyContact || null,
    notes: form.notes || null,
    admission_date: form.admissionDate || null,
    family_concession: form.concessionValue ? Number(form.concessionValue) : 0,
    scholarship_info: form.scholarshipInfo || null,
    is_active: form.status === "Active",
  };
}

// "2026-09-03T19:00:00.000Z" -> "2026-09-03" for <input type="date">
export function formatDateForInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// "2026-09-03T19:00:00.000Z" -> "Sep 3, 2026" for table/detail display
export function formatDateForDisplay(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

