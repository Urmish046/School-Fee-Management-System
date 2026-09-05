"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getLedger } from "@/lib/api/ledger";
import { listExpenses } from "@/lib/api/expenses";
import { listStudents } from "@/lib/api/students";
import { listFamilies } from "@/lib/api/families";
import { listPayments } from "@/lib/api/payments";
import { listInvoices } from "@/lib/api/invoices";

// Robust date normalizer: converts any date string, ISO format, or Date object to YYYY-MM-DD
function normalizeDate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") {
    const match = val.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(val as string | number | Date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todaysCollection: 0,
    monthCollection: 0,
    currentExpenses: 0,
    netIncome: 0,
    totalOutstanding: 0,
    totalArrears: 0,
    monthTarget: 0,
    collectedPct: 0,
    totalFamilies: 0,
    totalStudents: 0,
    paidFamilies: 0,
    partiallyPaidFamilies: 0,
    unpaidFamilies: 0,
  });

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    const loginSession = window.sessionStorage.getItem("loginSession");
    if (!token || loginSession !== "active") {
      window.sessionStorage.removeItem("loginSession");
      router.replace("/login");
      setAuthChecked(true);
      return;
    }
    setAuthenticated(true);
    setAuthChecked(true);

    async function fetchDashboardData() {
      try {
        setLoading(true);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;
        const currentMonthStr = `${year}-${month}`;

        const [
          ledgerRes,
          expensesRes,
          studentsRes,
          familiesRes,
          paymentsRes,
          invoicesRes,
        ] = await Promise.all([
          getLedger().catch(() => null),
          listExpenses({ limit: 500 }).catch(() => null),
          listStudents({ limit: 500 }).catch(() => null),
          listFamilies(500).catch(() => null),
          listPayments({ limit: 500 }).catch(() => null),
          listInvoices({ limit: 500 }).catch(() => null),
        ]);

        // 1. Collections
        const payments = paymentsRes?.data || [];
        const todaysCollection = payments
          .filter((p: any) => normalizeDate(p.payment_date) === todayStr)
          .reduce(
            (sum: number, p: any) => sum + (Number(p.amount_paid) || 0),
            0,
          );

        const monthCollection =
          payments
            .filter((p: any) =>
              normalizeDate(p.payment_date).startsWith(currentMonthStr),
            )
            .reduce(
              (sum: number, p: any) => sum + (Number(p.amount_paid) || 0),
              0,
            ) || Number(ledgerRes?.summary?.total_income || 0);

        // 2. Expenses
        const expenses = expensesRes?.data || [];
        const currentExpenses =
          expenses
            .filter((e: any) =>
              normalizeDate(e.expense_date).startsWith(currentMonthStr),
            )
            .reduce(
              (sum: number, e: any) => sum + (Number(e.amount) || 0),
              0,
            ) || Number(expensesRes?.totalExpensesSum || 0);

        const netIncome = monthCollection - currentExpenses;

        // 3. Invoices & Dues
        const invoices = invoicesRes?.data || [];
        const totalOutstanding = invoices
          .filter(
            (inv: any) =>
              inv.status !== "Paid" &&
              inv.status !== "Cancelled" &&
              inv.status !== "Waived",
          )
          .reduce(
            (sum: number, inv: any) =>
              sum +
              (Number(inv.total_payable || 0) - Number(inv.paid_amount || 0)),
            0,
          );

        const totalArrears = invoices
          .filter(
            (inv: any) =>
              inv.billing_month < currentMonthStr &&
              inv.status !== "Paid" &&
              inv.status !== "Cancelled" &&
              inv.status !== "Waived",
          )
          .reduce(
            (sum: number, inv: any) =>
              sum +
              (Number(inv.total_payable || 0) - Number(inv.paid_amount || 0)),
            0,
          );

        const currentMonthInvoices = invoices.filter(
          (inv: any) => inv.billing_month === currentMonthStr,
        );
        const currentMonthBilled = currentMonthInvoices.reduce(
          (sum: number, inv: any) => sum + Number(inv.total_payable || 0),
          0,
        );

        const monthTarget =
          currentMonthBilled > 0
            ? currentMonthBilled
            : monthCollection + totalOutstanding;
        const collectedPct =
          monthTarget > 0
            ? Math.min(Math.round((monthCollection / monthTarget) * 100), 100)
            : 0;

        // 4. Enrollment
        const totalStudents =
          studentsRes?.pagination?.total ?? studentsRes?.data?.length ?? 0;

        const totalFamilies =
          (familiesRes as any)?.pagination?.total ??
          familiesRes?.data?.length ??
          (Array.isArray(familiesRes) ? familiesRes.length : 0);

        const paidFamilies = currentMonthInvoices.filter(
          (inv: any) => inv.status === "Paid",
        ).length;
        const partiallyPaidFamilies = currentMonthInvoices.filter(
          (inv: any) => inv.status === "Partially Paid",
        ).length;
        const unpaidFamilies = currentMonthInvoices.filter(
          (inv: any) => inv.status === "Unpaid" || inv.status === "Overdue",
        ).length;

        setStats({
          todaysCollection,
          monthCollection,
          currentExpenses,
          netIncome,
          totalOutstanding,
          totalArrears,
          monthTarget,
          collectedPct,
          totalFamilies,
          totalStudents,
          paidFamilies,
          partiallyPaidFamilies,
          unpaidFamilies,
        });
      } catch (error) {
        toast.error("Failed to load dashboard metrics", {
          description: error instanceof Error ? error.message : "Network error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  if (!authChecked || !authenticated) {
    return <div className="fixed inset-0 z-[9999] min-h-screen bg-[#f4f2ee]" />;
  }

  const cashFlow = [
    {
      label: "Current Month Collection",
      value: stats.monthCollection,
      tone: "positive" as const,
    },
    {
      label: "Current Expenses",
      value: stats.currentExpenses,
      tone: "negative" as const,
    },
    {
      label: "Net Income",
      value: stats.netIncome,
      tone:
        stats.netIncome >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Total Outstanding",
      value: stats.totalOutstanding,
      tone: "negative" as const,
    },
    {
      label: "Total Arrears (Previous Months)",
      value: stats.totalArrears,
      tone:
        stats.totalArrears > 0 ? ("negative" as const) : ("neutral" as const),
    },
  ];

  const enrollment = [
    { label: "Total Families", value: stats.totalFamilies },
    { label: "Total Students", value: stats.totalStudents },
    { label: "Families Paid in Full", value: stats.paidFamilies },
    { label: "Families Partially Paid", value: stats.partiallyPaidFamilies },
    { label: "Families Unpaid / Overdue", value: stats.unpaidFamilies },
  ];

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of school fees, active revenue, and financial health
        </p>
      </div>

      {/* Top Banner */}
      <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardContent className="py-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Today&apos;s Collection
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {loading
                  ? "—"
                  : `Rs. ${stats.todaysCollection.toLocaleString()}`}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {stats.todaysCollection === 0
                  ? "No payments recorded for today's date."
                  : "Received across all payment methods today."}
              </p>
            </div>

            <div className="w-full max-w-xs md:w-72">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Collected this month</span>
                <span className="tabular-nums text-slate-700">
                  {loading ? "—" : `${stats.collectedPct}%`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{ width: loading ? "0%" : `${stats.collectedPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500 tabular-nums">
                <span>
                  Rs. {stats.monthCollection.toLocaleString()} collected
                </span>
                <span>Rs. {stats.monthTarget.toLocaleString()} billed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow and Enrollment Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="py-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Cash Flow
            </h2>
            <div className="space-y-0">
              {cashFlow.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-t border-slate-200 py-3 first:border-t-0"
                >
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      row.tone === "positive"
                        ? "text-emerald-600"
                        : row.tone === "negative"
                          ? "text-rose-600"
                          : "text-slate-700"
                    }`}
                  >
                    {loading ? "—" : `Rs. ${row.value.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="py-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Enrollment
            </h2>
            <div className="space-y-0">
              {enrollment.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-t border-slate-200 py-3 first:border-t-0"
                >
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800">
                    {loading ? "—" : row.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
