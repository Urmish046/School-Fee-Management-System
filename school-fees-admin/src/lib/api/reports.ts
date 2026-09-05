import { apiUrl, getAuthHeaders } from "@/lib/api/config";

export interface ReportSummaryStats {
  totalRevenueMonth: number;
  pendingDues: number;
  defaulterFamiliesCount: number;
  activeStudents: number;
  activeClasses: number;
}

export async function getReportSummaryStats(): Promise<ReportSummaryStats> {
  const res = await fetch(apiUrl("/api/reports/summary"), {
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Failed to load summary stats");
  return data.data;
}

export async function downloadReportFile(endpoint: string, filename: string) {
  const res = await fetch(apiUrl(endpoint), {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.error || `Export failed with status ${res.status}`,
    );
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
