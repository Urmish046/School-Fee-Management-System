"use client";

import { Card, CardContent } from "@/components/ui/card";
import { mockFamilies } from "@/lib/mock-data";

export default function DashboardPage() {
  const totalFamilies = mockFamilies.length;
  const totalStudents = mockFamilies.reduce((sum, f) => sum + f.totalChildren, 0);
  const totalOutstanding = mockFamilies.reduce((sum, f) => sum + f.balance, 0);
  const paidFamilies = mockFamilies.filter((f) => f.paymentStatus === "Paid").length;
  const partiallyPaidFamilies = mockFamilies.filter((f) => f.paymentStatus === "Partial").length;
  const unpaidFamilies = mockFamilies.filter((f) => f.paymentStatus === "Unpaid").length;

  const todaysCollection = 0;
  const monthCollection = 45000;
  const currentExpenses = 38000; // keep in sync with the Expenses page total
  const netIncome = monthCollection - currentExpenses;
  const monthTarget = monthCollection + totalOutstanding;
  const collectedPct = monthTarget > 0 ? Math.round((monthCollection / monthTarget) * 100) : 0;

  const cashFlow = [
    { label: "Current Month Collection", value: monthCollection, tone: "positive" as const },
    { label: "Current Expenses", value: currentExpenses, tone: "negative" as const },
    {
      label: "Net Income",
      value: netIncome,
      tone: netIncome >= 0 ? ("positive" as const) : ("negative" as const),
    },
    { label: "Total Outstanding", value: totalOutstanding, tone: "negative" as const },
    { label: "Total Arrears (Previous Months)", value: 0, tone: "neutral" as const },
  ];

  const enrollment = [
    { label: "Total Families", value: totalFamilies },
    { label: "Total Students", value: totalStudents },
    { label: "Families Paid in Full", value: paidFamilies },
    { label: "Families Partially Paid", value: partiallyPaidFamilies },
    { label: "Families Unpaid", value: unpaidFamilies },
  ];

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of school fees and finances
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardContent className="py-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Today&apos;s Collection
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                Rs. {todaysCollection.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {todaysCollection === 0
                  ? "No payments received yet today."
                  : "Received across all payment methods."}
              </p>
            </div>

            <div className="w-full max-w-xs md:w-72">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Collected this month</span>
                <span className="tabular-nums text-slate-700">{collectedPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${collectedPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500 tabular-nums">
                <span>Rs. {monthCollection.toLocaleString()} collected</span>
                <span>Rs. {monthTarget.toLocaleString()} billed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="py-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Cash Flow</h2>
            <div className="space-y-0">
              {cashFlow.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-t border-slate-200 py-3 first:border-t-0">
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
                    Rs. {row.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="py-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Enrollment</h2>
            <div className="space-y-0">
              {enrollment.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-t border-slate-200 py-3 first:border-t-0">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}