"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getReportSummaryStats,
  downloadReportFile,
  type ReportSummaryStats,
} from "@/lib/api/reports";

// Generate trailing 12 months dynamically
function getDynamicMonths() {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label });
  }
  return months;
}

export default function ReportsPage() {
  const monthsList = getDynamicMonths();

  const [stats, setStats] = useState<ReportSummaryStats>({
    totalRevenueMonth: 0,
    pendingDues: 0,
    defaulterFamiliesCount: 0,
    activeStudents: 0,
    activeClasses: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Filter selections for export
  const [collectionMonth, setCollectionMonth] = useState(monthsList[0].value);
  const [defaulterStatus, setDefaulterStatus] = useState("all");
  const [pnlStartDate, setPnlStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [pnlEndDate, setPnlEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    getReportSummaryStats()
      .then(setStats)
      .catch((err) => {
        toast.error("Failed to load live report stats", {
          description: err instanceof Error ? err.message : "Network error",
        });
      })
      .finally(() => setLoadingStats(false));
  }, []);

  const handleExport = async (reportType: string) => {
    try {
      setDownloading(reportType);
      if (reportType === "Fee Collection Report") {
        await downloadReportFile(
          `/api/reports/export/fee-collections?month=${collectionMonth}`,
          `fee_collections_${collectionMonth}.csv`,
        );
      } else if (reportType === "Defaulters Report") {
        await downloadReportFile(
          `/api/reports/export/defaulters?status=${defaulterStatus}`,
          `defaulters_${defaulterStatus}.csv`,
        );
      } else if (reportType === "Concessions Report") {
        await downloadReportFile(
          `/api/reports/export/concessions`,
          `concessions_and_scholarships.csv`,
        );
      } else if (reportType === "P&L Report") {
        await downloadReportFile(
          `/api/reports/export/pnl?start_date=${pnlStartDate}&end_date=${pnlEndDate}`,
          `pnl_${pnlStartDate}_to_${pnlEndDate}.csv`,
        );
      }

      toast.success("Export Complete", {
        description: `${reportType} has been downloaded directly from PostgreSQL.`,
      });
    } catch (error) {
      toast.error("Export Failed", {
        description:
          error instanceof Error ? error.message : "Error generating CSV",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports & Export Centre</h1>
        <p className="text-sm text-muted-foreground">
          Generate, analyze, and export live financial statements and student
          logs.
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Month Revenue ({monthsList[0].label.split(" ")[0]})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs. {Number(stats.totalRevenueMonth).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Collected through tuition fees & receipts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              Rs. {Number(stats.pendingDues).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.defaulterFamiliesCount} pending/overdue family
              challans.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Enrolled Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Allocated across {stats.activeClasses} academic classes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Fee Collection Report */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Report</CardTitle>
            <CardDescription>
              Detailed logs of all payments received from families with payment
              methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">Billing Month</Label>
                <Select
                  value={collectionMonth}
                  onValueChange={(val) => setCollectionMonth(val ?? "")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsList.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Label className="text-xs">Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">Excel (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => handleExport("Fee Collection Report")}
              disabled={downloading === "Fee Collection Report"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {downloading === "Fee Collection Report"
                ? "Exporting..."
                : "Download Collection Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Defaulters / Pending Dues Report */}
        <Card>
          <CardHeader>
            <CardTitle>Defaulters & Pending Dues</CardTitle>
            <CardDescription>
              List of families with overdue payments, contact numbers, and
              pending balances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">Challan Status</Label>
                <Select
                  value={defaulterStatus}
                  onValueChange={(val) => setDefaulterStatus(val ?? "all")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pending Dues</SelectItem>
                    <SelectItem value="unpaid">Unpaid Only</SelectItem>
                    <SelectItem value="overdue">Overdue Challans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Label className="text-xs">Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">Excel (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => handleExport("Defaulters Report")}
              disabled={downloading === "Defaulters Report"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading === "Defaulters Report"
                ? "Exporting..."
                : "Download Defaulters List"}
            </Button>
          </CardContent>
        </Card>

        {/* Concessions & Scholarships Report */}
        <Card>
          <CardHeader>
            <CardTitle>Concessions & Scholarships</CardTitle>
            <CardDescription>
              Export all active and historical fee waivers, merit discounts, and
              approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full">
              <Label className="text-xs">Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Excel (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleExport("Concessions Report")}
              disabled={downloading === "Concessions Report"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading === "Concessions Report"
                ? "Exporting..."
                : "Download Concession List"}
            </Button>
          </CardContent>
        </Card>

        {/* Profit & Loss (P&L) Report */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss (P&L) Statement</CardTitle>
            <CardDescription>
              Category-wise aggregation of all income vs operational expenses
              from account transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={pnlStartDate}
                  onChange={(e) => setPnlStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-1/2">
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={pnlEndDate}
                  onChange={(e) => setPnlEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => handleExport("P&L Report")}
              disabled={downloading === "P&L Report"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading === "P&L Report"
                ? "Exporting..."
                : "Download P&L Statement"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
