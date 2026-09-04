"use client";

import { useMemo, useState } from "react";
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

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [printLayout, setPrintLayout] = useState(4);

  const challans = useMemo(() => {
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

      const previousArrears = 0;

      return {
        id: `FC-2026-${String(index + 1).padStart(6, "0")}`,
        family: family.fatherName,
        amount: amount,
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
  }, []);

  // 1. Print function
  const handlePrint = (layout: number) => {
    setPrintLayout(layout);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // 2. Generate Fees Function
  const handleGenerateFees = () => {
    toast.success("Fees generated successfully!", {
      description: "September fees have been generated for all active families with adjusted concessions.",
    });
  };

  // 3. Export Excel (CSV) Function
  const handleExportExcel = () => {
    const headers = ["Challan No", "Family", "Total Payable", "Due Date", "Status"];

    const csvData = challans.map((c) =>
      `${c.id},"${c.family}","${c.amount}",${c.dueDate},${c.status}`
    );

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
              <FileText className="mr-2 h-4 w-4" /> Generate September Fees
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Confirm Bulk Fee Generation</DialogTitle>
                <DialogDescription>
                  This will generate September challans for all active families using the latest concession and fee totals.
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
                <DialogClose onClick={handleGenerateFees} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
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
            <Input
              placeholder="Search by challan no or family..."
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
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans
                  .filter((challan) =>
                    challan.id.toLowerCase().includes(search.toLowerCase()) ||
                    challan.family.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((challan) => (
                    <TableRow key={challan.id}>
                      <TableCell className="font-medium">{challan.id}</TableCell>
                      <TableCell>{challan.family}</TableCell>
                      <TableCell className="font-semibold">Rs. {challan.amount.toLocaleString()}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> View PDF
                        </Button>
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
          {challans.slice(0, printLayout).map((challan) => (
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