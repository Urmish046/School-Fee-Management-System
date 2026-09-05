"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  FileText,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChallanTemplate } from "@/components/challan-template";
import {
  listInvoices,
  getInvoiceDetails,
  generateMonthlyInvoicesApi,
  type ApiInvoice,
} from "@/lib/api/invoices";
import {
  getAcademicSessions,
  type AcademicSession,
} from "@/lib/api/academic-sessions";

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("2026-09");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Invoices & Reference States
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Print States
  const [printLayout, setPrintLayout] = useState(4);
  const [fullInvoiceData, setFullInvoiceData] = useState<ApiInvoice | null>(
    null,
  );
  const [printSingle, setPrintSingle] = useState(false);

  // 1. Fetch Sessions
  useEffect(() => {
    getAcademicSessions()
      .then((data) => {
        setSessions(data || []);
        const active = data?.find((s) => s.is_active);
        if (active) setSelectedSessionId(String(active.id));
        else if (data?.length) setSelectedSessionId(String(data[0].id));
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Invoices from DB
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await listInvoices({
        page,
        limit: 10,
        billing_month: monthFilter || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search || undefined,
      });

      setInvoices(res.data || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load invoices", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, monthFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadInvoices();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // 3. Generate Fees Handler
  const handleGenerateFees = async () => {
    if (!selectedSessionId) {
      toast.error("Please configure/select an active academic session first.");
      return;
    }

    try {
      setGenerating(true);
      const res = await generateMonthlyInvoicesApi({
        billing_month: monthFilter,
        due_date: `${monthFilter}-10`,
        session_id: Number(selectedSessionId),
      });

      toast.success("Billing generation completed", {
        description: res.message,
      });
      loadInvoices();
    } catch (error) {
      toast.error("Fee generation failed", {
        description:
          error instanceof Error ? error.message : "Error creating invoices",
      });
    } finally {
      setGenerating(false);
    }
  };

  // 4. Print Handlers
  const handlePrintIndividual = async (invoiceId: number) => {
    try {
      const res = await getInvoiceDetails(invoiceId);
      setFullInvoiceData(res.data);
      setPrintSingle(true);
      setPrintLayout(1);
      setTimeout(() => window.print(), 150);
    } catch (error) {
      toast.error("Failed to prepare printable challan.");
    }
  };

  const handlePrintBatch = (layout: number) => {
    setPrintSingle(false);
    setPrintLayout(layout);
    setTimeout(() => window.print(), 150);
  };

  // 5. Export CSV
  const handleExportExcel = () => {
    const headers = [
      "Challan No",
      "Family",
      "Month",
      "Subtotal",
      "Concession",
      "Arrears",
      "Total Payable",
      "Paid",
      "Due Date",
      "Status",
    ];

    const rows = invoices.map((inv) => [
      inv.challan_no,
      `"${inv.father_parent_name}"`,
      inv.billing_month,
      inv.subtotal_amount,
      inv.concession_amount,
      inv.previous_arrears,
      inv.total_payable,
      inv.paid_amount,
      inv.due_date ? inv.due_date.slice(0, 10) : "",
      inv.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `challans_${monthFilter}.csv`;
    link.click();
  };

  const gridClass =
    printLayout === 4
      ? "print-grid-4"
      : printLayout === 2
        ? "print-grid-2"
        : "print-grid-1";

  return (
    <>
      {/* SCREEN VIEW */}
      <div className="p-6 space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Fees & Challans</h1>
            <p className="text-sm text-muted-foreground">
              Generate monthly student fee schedules and print challans.
            </p>
          </div>

          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
              <FileText className="mr-2 h-4 w-4" /> Generate {monthFilter} Fees
            </DialogTrigger>
            <DialogContent className="sm:max-w-105">
              <DialogHeader>
                <DialogTitle>Confirm Monthly Fee Generation</DialogTitle>
                <DialogDescription>
                  Generate challans for active students using concessions and
                  unpaid arrears.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Billing Month</span>
                  <span className="font-semibold">{monthFilter}</span>
                </div>

                {/* Academic Session Selector */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Academic Session
                  </label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name} {s.is_active ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2">
                  Cancel
                </DialogClose>
                <DialogClose
                  onClick={handleGenerateFees}
                  disabled={generating}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                >
                  {generating ? "Generating..." : "Confirm & Run"}
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Action Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Print & Export Challans</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => handlePrintBatch(1)}>
              <Printer className="mr-2 h-4 w-4" /> 1 Per Page
            </Button>
            <Button variant="outline" onClick={() => handlePrintBatch(2)}>
              <Printer className="mr-2 h-4 w-4" /> 2 Per Page
            </Button>
            <Button variant="outline" onClick={() => handlePrintBatch(4)}>
              <Printer className="mr-2 h-4 w-4" /> 4 Per Page
            </Button>
            <Button variant="secondary" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Challans Directory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Challans ({totalCount})</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />

              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Waived">Waived</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <Input
                placeholder="Search challan no, father name or FAM code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challan No.</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Total Payable</TableHead>
                  <TableHead>Paid / Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading challans...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No invoices found for month {monthFilter}.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => {
                    const total = Number(inv.total_payable) || 0;
                    const paid = Number(inv.paid_amount) || 0;
                    const balance = total - paid;

                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {inv.challan_no}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {inv.father_parent_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {inv.family_id_code ||
                                `FAM-${String(inv.family_id).padStart(4, "0")}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          Rs. {total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          Rs. {paid.toLocaleString()} / Rs.{" "}
                          {balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {inv.due_date
                            ? new Date(inv.due_date).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inv.status === "Paid"
                                ? "default"
                                : inv.status === "Partially Paid"
                                  ? "outline"
                                  : inv.status === "Overdue"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintIndividual(inv.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View / Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t mt-4 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRINT VIEW */}
      <div className="hidden print:block w-full bg-white text-black">
        <div className={`print-sheet ${gridClass}`}>
          {printSingle && fullInvoiceData ? (
            <div className="challan-slot">
              <ChallanTemplate
                challanNo={fullInvoiceData.challan_no}
                family={fullInvoiceData.father_parent_name}
                amount={Number(fullInvoiceData.total_payable)}
                dueDate={
                  fullInvoiceData.due_date
                    ? new Date(fullInvoiceData.due_date).toLocaleDateString()
                    : ""
                }
                children={
                  fullInvoiceData.items?.map((item) => ({
                    name: item.student_name,
                    className: `${item.class_name} (${item.section_name ?? "A"})`,
                    amount: Number(item.amount),
                  })) || []
                }
                concessionAmount={Number(fullInvoiceData.concession_amount)}
                arrears={Number(fullInvoiceData.previous_arrears)}
                compact={false}
              />
            </div>
          ) : (
            invoices.slice(0, printLayout).map((inv) => (
              <div key={inv.id} className="challan-slot">
                <ChallanTemplate
                  challanNo={inv.challan_no}
                  family={inv.father_parent_name}
                  amount={Number(inv.total_payable)}
                  dueDate={
                    inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString()
                      : ""
                  }
                  children={[]}
                  concessionAmount={Number(inv.concession_amount)}
                  arrears={Number(inv.previous_arrears)}
                  compact={printLayout === 2 || printLayout === 4}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
