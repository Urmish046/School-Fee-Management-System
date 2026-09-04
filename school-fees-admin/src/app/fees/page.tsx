"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Download, Eye } from "lucide-react";
import { ChallanTemplate } from "@/components/challan-template";
import { mockFamilies } from "@/lib/mock-data";
import { mockStudentsFull } from "@/lib/mock-students-full";
import { mockConcessions, applyConcession } from "@/lib/mock-concessions";
import { generateMonthlyInvoices, getInvoiceStatus, readInvoices, subscribeToInvoices, updateInvoiceStatus, type FeeInvoice } from "@/lib/fee-store";

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [printLayout, setPrintLayout] = useState(4);
  const [printChallanId, setPrintChallanId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [familyFilter, setFamilyFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("2026-09");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setInvoices(readInvoices());
    return subscribeToInvoices(() => setInvoices(readInvoices()));
  }, []);

  const challans = useMemo(() => {
    if (invoices.length > 0) {
      return invoices.map((invoice) => ({
        ...invoice,
        id: invoice.challanNo,
        family: invoice.familyName,
        amount: invoice.total,
        amountDisplay: `Rs. ${invoice.total.toLocaleString()}`,
        status: getInvoiceStatus(invoice),
        children: invoice.students.map((student) => ({ name: student.name, className: `${student.className} (${student.section})`, amount: student.amount })),
        concessionLabel: invoice.concessionLabel,
        concessionAmount: invoice.concessionAmount,
        arrears: invoice.previousArrears,
      }));
    }
    return mockFamilies.map((family, index) => {
      const children = mockStudentsFull.filter((student) => student.familyId === family.familyId);
      const grossFee = children.reduce((sum, child) => sum + child.monthlyFee, 0);
      const applicableConcessions = mockConcessions.filter(
        (concession) =>
          concession.status === "Active" &&
          ((concession.appliesTo === "Family" && concession.targetId === family.familyId) ||
            (concession.appliesTo === "Student" && children.some((child) => child.id === concession.targetId)))
      );
      const totalDiscount = applicableConcessions.reduce((sum, concession) => {
        const baseFee =
          concession.appliesTo === "Family"
            ? grossFee
            : children.find((child) => child.id === concession.targetId)?.monthlyFee || 0;
        return sum + (baseFee - applyConcession(baseFee, concession));
      }, 0);
      const amount = grossFee - totalDiscount;
      const concessionLabel =
        applicableConcessions.length > 0
          ? `${applicableConcessions[0].reason}${applicableConcessions.length > 1 ? ` + ${applicableConcessions.length - 1} more` : ""}`
          : undefined;

      const previousArrears = family.balance;

      return {
        id: `FC-2026-${String(index + 1).padStart(6, "0")}`,
        family: family.fatherName,
        billingMonth: "2026-09",
        amount: amount + previousArrears,
        amountPaid: 0,
        balance: amount + previousArrears,
        amountDisplay: `Rs. ${amount.toLocaleString()}`,
        dueDate: "10 Sep 2026",
        status: family.paymentStatus === "Paid" ? "Paid" : family.paymentStatus === "Partial" ? "Partially Paid" : "Unpaid",
        children: children.map((child) => ({
          name: child.name,
          className: child.className,
          amount: child.monthlyFee,
        })),
        concessionLabel,
        concessionAmount: totalDiscount,
        arrears: previousArrears,
        familyId: family.id,
      };
    });
  }, [invoices]);

  // 1. Print function
  const handlePrint = (layout: number) => {
    setPrintChallanId(null);
    setPrintLayout(layout);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintIndividual = (challanId: string) => {
    setPrintChallanId(challanId);
    setPrintLayout(1);
    setTimeout(() => window.print(), 100);
  };

  // 2. Generate Fees Function
  const handleGenerateFees = () => {
    const result = generateMonthlyInvoices(monthFilter, `${monthFilter}-10`);
    setInvoices(result.invoices);
    toast.success(result.created ? "Fees generated successfully!" : "Fees already generated", {
      description: result.created ? `${result.created} family invoices created with concessions and arrears.` : "No duplicate monthly invoices were created.",
    });
  };

  const handleGenerateAndPrint = () => {
    handleGenerateFees();
    handlePrint(4);
  };

  const handleStatusChange = (challanNo: string, status: "Cancelled" | "Waived") => {
    const invoice = invoices.find((item) => item.challanNo === challanNo);
    if (invoice && updateInvoiceStatus(invoice.id, status)) {
      setInvoices(readInvoices());
      toast.success(`Invoice ${status.toLowerCase()}`);
    }
  };

  // 3. Export Excel (CSV) Function
  const handleExportExcel = () => {
    const headers = ["Challan No", "Family", "Month", "Total", "Paid", "Balance", "Due Date", "Status"];

    const csvData = challans.map((c) => {
      const invoice = c as typeof c & Partial<FeeInvoice>;
      return `${c.id},"${c.family}",${invoice.billingMonth ?? "2026-09"},${c.amount},${invoice.amountPaid ?? 0},${invoice.balance ?? c.amount},${c.dueDate},${c.status}`;
    });

    const csvContent = [headers.join(","), ...csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "fees_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grid column/row config per layout
  const gridClass =
    printLayout === 4
      ? "print-grid-4"
      : printLayout === 2
      ? "print-grid-2"
      : "print-grid-1";

  return (
    <>
      {/* NORMAL SCREEN VIEW */}
      <div className="p-6 space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Fees & Challans</h1>
            <p className="text-sm text-muted-foreground">Generate monthly fees and print family challans.</p>
          </div>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
              <FileText className="mr-2 h-4 w-4" /> Generate {monthFilter === "2026-09" ? "September" : monthFilter} Fees
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Confirm Bulk Fee Generation</DialogTitle>
                <DialogDescription>
                  This will generate family invoices for active students using concessions and automatic arrears. Existing invoices for the month are skipped.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Families included</span>
                  <span className="font-medium">{challans.length}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">With active concessions</span>
                  <span className="font-medium">{challans.filter((c) => c.concessionLabel).length}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2">
                  Cancel
                </DialogClose>
                <DialogClose onClick={handleGenerateAndPrint} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
                  Generate & Print
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Print Challans (A4)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => handlePrint(1)}><Printer className="mr-2 h-4 w-4" /> 1 Per Page</Button>
            <Button variant="outline" onClick={() => handlePrint(2)}><Printer className="mr-2 h-4 w-4" /> 2 Per Page</Button>
            <Button variant="outline" onClick={() => handlePrint(4)}><Printer className="mr-2 h-4 w-4" /> 4 Per Page</Button>
            <Button variant="secondary" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
          </CardContent>
        </Card>

        {/* Challans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Challans</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)}>
                <option value="all">All families</option>
                {mockFamilies.map((family) => <option key={family.familyId} value={family.familyId}>{family.fatherName}</option>)}
              </select>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="all">All classes</option><option>Class 1</option><option>Class 3</option><option>Class 5</option><option>Class 8</option>
              </select>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
                <option value="all">All sections</option><option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
              </select>
              <Input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option><option value="unpaid">Unpaid only</option><option value="Overdue">Defaulters / overdue</option><option value="Paid">Paid</option><option value="Waived">Waived</option><option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <Input
              placeholder="Search parent, student, family ID, challan or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm mt-2"
            />
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
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans
                  .filter((challan) =>
                    `${challan.id} ${challan.family} ${challan.familyId}`.toLowerCase().includes(search.toLowerCase()) &&
                    (familyFilter === "all" || (challan as typeof challan & Partial<FeeInvoice>).familyId === familyFilter) &&
                    (classFilter === "all" || challan.children.some((child) => child.className.includes(classFilter))) &&
                    (sectionFilter === "all" || challan.children.some((child) => child.className.includes(`(${sectionFilter})`))) &&
                    ((challan as typeof challan & Partial<FeeInvoice>).billingMonth ?? "2026-09") === monthFilter &&
                    (statusFilter === "all" || (statusFilter === "unpaid" ? ["Unpaid", "Partially Paid", "Overdue"].includes(challan.status) : challan.status === statusFilter))
                  )
                  .map((challan) => (
                    <TableRow key={challan.id}>
                      <TableCell className="font-medium">{challan.id}</TableCell>
                      <TableCell>{challan.family}</TableCell>
                      <TableCell className="font-semibold">Rs. {challan.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        Rs. {((challan as typeof challan & Partial<FeeInvoice>).amountPaid ?? 0).toLocaleString()} / Rs. {((challan as typeof challan & Partial<FeeInvoice>).balance ?? challan.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{challan.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            challan.status === "Paid"
                              ? "default"
                              : challan.status === "Partially Paid"
                              ? "outline"
                              : challan.status === "Overdue"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {challan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handlePrintIndividual(challan.id)}>
                          <Eye className="h-4 w-4 mr-2" /> View PDF
                        </Button>
                        {(challan.status === "Unpaid" || challan.status === "Overdue" || challan.status === "Partially Paid") && (
                          <div className="mt-1 flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(challan.id, "Waived")}>Waive</Button>
                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(challan.id, "Cancelled")}>Cancel</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* PRINT ONLY VIEW */}
      <div className="hidden print:block w-full bg-white text-black">
        <div className={`print-sheet ${gridClass}`}>
          {(printChallanId ? challans.filter((challan) => challan.id === printChallanId) : challans.slice(0, printLayout)).map((challan) => (
            <div key={challan.id} className="challan-slot">
              <ChallanTemplate
                challanNo={challan.id}
                family={challan.family}
                amount={challan.amount}
                dueDate={challan.dueDate}
                children={challan.children}
                concessionLabel={challan.concessionLabel}
                concessionAmount={challan.concessionAmount}
                arrears={challan.arrears}
                compact={printLayout === 2 || printLayout === 4}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}