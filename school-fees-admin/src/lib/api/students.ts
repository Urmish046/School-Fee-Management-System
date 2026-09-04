import { apiUrl, getAuthHeaders } from "@/lib/api/config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StudentStatus =
  | "Active"
  | "Inactive"
  | "Graduated"
  | "Withdrawn"
  | "Suspended";

export type StudentGender = "Male" | "Female" | "Other";

// Row shape returned by GET /api/students (list) — matches the joined
// columns selected in getAllStudents().
export type ApiStudentListItem = {
  id: number;
  admission_number: string;
  student_name: string;
  mother_name: string | null;
  date_of_birth: string | null;
  gender: StudentGender | null;
  roll_number: string | null;
  admission_date: string | null;
  student_contact: string | null;
  address: string | null;
  status: StudentStatus;

  family_id: number;
  family_id_code: string;
  father_parent_name: string;
  father_contact: string | null;

  class_id: number | null;
  class_name: string | null;

  section_id: number | null;
  section_name: string | null;

  session_id: number | null;
  session_name: string | null;
};

// Row shape returned by GET /api/students/:id — matches `s.*` plus the
// joined family/class/section/session columns in getStudentById().
export type ApiStudent = {
  id: number;
  admission_number: string;
  student_name: string;
  family_id: number;
  mother_name: string | null;
  date_of_birth: string | null;
  gender: StudentGender | null;
  class_id: number | null;
  section_id: number | null;
  roll_number: string | null;
  admission_date: string | null;
  contact: string | null;
  address: string | null;
  academic_session_id: number | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;

  family_id_code: string;
  father_parent_name: string;
  father_contact: string | null;
  whatsapp_number: string | null;

  class_name: string | null;
  section_name: string | null;
  session_name: string | null;
};

export type ApiStudentListResponse = {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  data: ApiStudentListItem[];
};

export type ApiStudentResponse = {
  success: boolean;
  data: ApiStudent;
};

// Payload for POST /api/students — mirrors createStudent()'s accepted
// fields. admission_number, student_name, and family_id are required by
// the controller; everything else is optional.
export type StudentPayload = {
  admission_number: string;
  student_name: string;
  family_id: number;
  mother_name?: string;
  date_of_birth?: string; // ISO date, e.g. "2015-04-12"
  gender?: StudentGender;
  class_id?: number;
  section_id?: number;
  roll_number?: string;
  admission_date?: string; // ISO date
  contact?: string;
  address?: string;
  academic_session_id?: number;
  status?: StudentStatus;
};

export type StudentListFilters = {
  search?: string;
  class_id?: number;
  section_id?: number;
  status?: StudentStatus;
  page?: number;
  limit?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error || `Request failed: ${response.status}`);
  return body;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function listStudents(filters: StudentListFilters = {}) {
  const {
    search = "",
    class_id,
    section_id,
    status,
    page = 1,
    limit = 10,
  } = filters;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());
  if (class_id !== undefined) params.set("class_id", String(class_id));
  if (section_id !== undefined) params.set("section_id", String(section_id));
  if (status) params.set("status", status);

  const response = await fetch(apiUrl(`/api/students?${params.toString()}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<ApiStudentListResponse>;
}

export async function getStudent(id: number | string) {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<ApiStudentResponse>;
}

export async function createStudent(payload: StudentPayload) {
  const response = await fetch(apiUrl("/api/students"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return readResponse(response) as Promise<{
    message: string;
    student: ApiStudent;
  }>;
}

// admission_number is not accepted here — the backend's PATCH handler
// doesn't update it (see studentModel.updateStudent).
export type StudentUpdatePayload = Omit<StudentPayload, "admission_number">;

export async function updateStudent(
  id: number | string,
  payload: StudentUpdatePayload,
) {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return readResponse(response) as Promise<{
    success: boolean;
    message: string;
    student: ApiStudent;
  }>;
}

export async function deleteStudent(id: number | string) {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  return readResponse(response) as Promise<{
    success: boolean;
    message: string;
    student: ApiStudent;
  }>;
}
