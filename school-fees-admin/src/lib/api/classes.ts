import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export type ApiClassSection = {
  id: number;
  name: string;
};

export type ApiClassFee = {
  fee_component_id: number;
  name: string;
  amount: number | string;
};

export type ApiClass = {
  class_id: number;
  class_name: string;
  sections: ApiClassSection[];
  fees: ApiClassFee[];
  total_base_fee: number | string;
};

export type ApiClassListResponse = {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  data: ApiClass[];
};

export type ApiFeeComponent = {
  id: number;
  name: string;
};

export type ClassFeeInput = {
  fee_component_id: number;
  amount: number;
};

export type ClassPayload = {
  name: string;
  sections: string[];
  academic_session_id?: number;
  fees: ClassFeeInput[];
};

export type ApiSection = {
  id: number;
  class_id: number;
  name: string;
};

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.error ||
        body?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

/* =========================================================
   CLASSES
========================================================= */

export async function listClasses(page: number, limit: number, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(apiUrl(`/api/class-fees?${params.toString()}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  return readResponse(response) as Promise<ApiClassListResponse>;
}

/* =========================================================
   FEE COMPONENTS
========================================================= */

export async function listFeeComponents() {
  const response = await fetch(apiUrl("/api/fees/components"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiFeeComponent[];
  }>;
}

/* =========================================================
   CREATE CLASS
========================================================= */

export async function createClass(payload: ClassPayload) {
  const response = await fetch(apiUrl("/api/class-fees"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readResponse(response);
}

/* =========================================================
   UPDATE CLASS
========================================================= */

export async function updateClass(id: number, payload: ClassPayload) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readResponse(response);
}

/* =========================================================
   DELETE CLASS
========================================================= */

export async function deleteClass(id: number) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  return readResponse(response);
}

/* =========================================================
   GET SINGLE CLASS
========================================================= */

export async function getClass(id: number | string) {
  const response = await fetch(apiUrl(`/api/class-fees/${id}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiClass;
  }>;
}

/* =========================================================
   GET SECTIONS BY CLASS
========================================================= */

export async function getSectionsByClass(classId: number) {
  const response = await fetch(
    apiUrl(`/api/class-fees/classes/${classId}/sections`),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    },
  );

  return readResponse(response) as Promise<{
    success: boolean;
    data: ApiSection[];
  }>;
}