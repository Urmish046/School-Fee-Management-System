"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, PlusCircle, Download } from "lucide-react";

// Dummy Expenses Data
const mockExpenses = [
  { id: "EXP-001", title: "Electricity Bill - August", category: "Utilities", amount: "Rs. 25,500", date: "25 Aug 2026", paidBy: "Admin" },
  { id: "EXP-002", title: "Classroom Whiteboards & Markers", category: "Supplies", amount: "Rs. 8,000", date: "20 Aug 2026", paidBy: "Principal" },
  { id: "EXP-003", title: "Repair of AC in Computer Lab", category: "Maintenance", amount: "Rs. 4,500", date: "15 Aug 2026", paidBy: "Admin" },
];

const paymentMethods = [
  "Cash",
  "Bank",
  "Online Transfer",
  "JazzCash",
  "Easypaisa",
  "Cheque",
  "Credit Card",
  "Debit Card",
  "Other",
];

export default function ExpensesPage() {
  const [search, setSearch] = useState("");

  const handleSaveExpense = () => {
    toast.success("Expense Recorded!", {
      description: "The new school expense has been added to the system.",
    });
  };

  const filteredExpenses = mockExpenses.filter((exp) =>
    exp.title.toLowerCase().includes(search.toLowerCase()) ||
    exp.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">School Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track and record operational costs, utility bills, and maintenance.
          </p>
        </div>

        {/* Add Expense Dialog */}
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </DialogTrigger>
          <DialogContent className="sm:max-w-[470px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of the school expenditure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Expense ID */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="expenseId" className="sm:text-right">Expense ID</Label>
                <Input id="expenseId" placeholder="EXP-010" className="w-full" />
              </div>

              {/* Title / Description */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="title" className="sm:text-right">Title</Label>
                <Input id="title" placeholder="e.g. Internet Bill" className="w-full" />
              </div>

              {/* Category */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="category" className="sm:text-right">Category</Label>
                <div className="w-full">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utilities">Utilities (Electricity/Water)</SelectItem>
                      <SelectItem value="Supplies">Stationery & Supplies</SelectItem>
                      <SelectItem value="Maintenance">Maintenance & Repair</SelectItem>
                      <SelectItem value="Salaries">Staff Salaries</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="amount" className="sm:text-right">Amount</Label>
                <Input id="amount" type="number" placeholder="0" className="w-full" />
              </div>

              {/* Payment Method */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="paymentMethod" className="sm:text-right">Payment Method</Label>
                <div className="w-full">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Paid To */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="paidTo" className="sm:text-right">Paid To</Label>
                <Input id="paidTo" placeholder="Vendor / Staff / Person" className="w-full" />
              </div>

              {/* Receipt / Reference */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="referenceNo" className="sm:text-right">Reference No.</Label>
                <Input id="referenceNo" placeholder="INV-1001 / Bill #" className="w-full" />
              </div>

              {/* Date */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="date" className="sm:text-right">Date</Label>
                <Input id="date" type="date" className="w-full" />
              </div>

              {/* Remarks */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
                <Label htmlFor="remarks" className="sm:text-right pt-2">Remarks</Label>
                <Input id="remarks" placeholder="Optional audit notes" className="w-full" />
              </div>

              {/* Attachment */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label htmlFor="attachment" className="sm:text-right">Attachment</Label>
                <Input id="attachment" type="file" className="w-full" />
              </div>

            </div>
            <div className="flex justify-end">
              <DialogClose 
                onClick={handleSaveExpense}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Save Expense
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (August)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs. 38,000</div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <Input
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{exp.id}</TableCell>
                  <TableCell>{exp.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{exp.category}</Badge>
                  </TableCell>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell className="text-muted-foreground">{exp.paidBy}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    {exp.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}