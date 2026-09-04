"use client";

import { useState } from "react";
import { mockConcessions } from "@/lib/mock-concessions";
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
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ConcessionsPage() {
  const [search, setSearch] = useState("");
  const [entryType, setEntryType] = useState<string>("Concession");

  const handleEntryTypeChange = (value: string | null) => {
    setEntryType(value ?? "Concession");
  };

  const filtered = mockConcessions.filter(
    (c) =>
      c.targetName.toLowerCase().includes(search.toLowerCase()) ||
      c.targetId.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = mockConcessions.filter((c) => c.status === "Active").length;

  const handleSave = () => {
    toast.success(
      entryType === "Scholarship" ? "Scholarship saved!" : "Concession added!",
      {
        description:
          entryType === "Scholarship"
            ? "The scholarship record has been added with approval and validity dates."
            : "The discount has been applied and will reflect in the next generated fee.",
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Concessions & Scholarships</h1>
          <p className="text-sm text-muted-foreground">
            Manage fixed or percentage-based discounts for families and students.
          </p>
        </div>

        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            + Add Concession
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{entryType === "Scholarship" ? "Add New Scholarship" : "Add New Concession"}</DialogTitle>
              <DialogDescription>
                {entryType === "Scholarship"
                  ? "Record a scholarship with approval and validity details."
                  : "Apply a discount to a family or an individual student."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Entry Type */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Type</Label>
                <div className="w-full">
                  <Select value={entryType} onValueChange={handleEntryTypeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Concession">Concession</SelectItem>
                      <SelectItem value="Scholarship">Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Applies To */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Applies To</Label>
                <div className="w-full">
                  <Select defaultValue="Family">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Whole Family</SelectItem>
                      <SelectItem value="Student">Individual Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Family / Student</Label>
                <div className="w-full">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAM-0001">Muhammad Arshad (FAM-0001)</SelectItem>
                      <SelectItem value="FAM-0002">Imran Khan (FAM-0002)</SelectItem>
                      <SelectItem value="FAM-0003">Tariq Mahmood (FAM-0003)</SelectItem>
                      <SelectItem value="STD-001">Ali Arshad (STD-001)</SelectItem>
                      <SelectItem value="STD-003">Sara Khan (STD-003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scholarship Name */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">Scholarship Name</Label>
                  <Input
                    placeholder="e.g. Merit Scholarship 2026"
                    className="w-full"
                  />
                </div>
              )}

              {/* Discount Type */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Discount Type</Label>
                <div className="w-full">
                  <Select defaultValue="Percentage">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage (%)</SelectItem>
                      <SelectItem value="Fixed">Fixed Amount (Rs.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Value */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Value</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10 or 1000"
                  className="w-full"
                />
              </div>

              {/* Start Date */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">Start Date</Label>
                  <Input type="date" className="w-full" />
                </div>
              )}

              {/* End Date */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">End Date</Label>
                  <Input type="date" className="w-full" />
                </div>
              )}

              {/* Reason */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
                <Label className="sm:text-right pt-2">Reason</Label>
                <Input
                  placeholder={entryType === "Scholarship" ? "e.g. Merit Scholarship" : "e.g. Sibling Discount"}
                  className="w-full"
                />
              </div>

              {/* Approval */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">Approval</Label>
                  <div className="w-full">
                    <Select defaultValue="Approved">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select approval..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
                  <Label className="sm:text-right pt-2">Remarks</Label>
                  <Input
                    placeholder="Optional notes"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <DialogClose
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                {entryType === "Scholarship" ? "Save Scholarship" : "Save Concession"}
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Concessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockConcessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Concessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Family-level vs Student-level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockConcessions.filter((c) => c.appliesTo === "Family").length} /{" "}
              {mockConcessions.filter((c) => c.appliesTo === "Student").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Concessions ({filtered.length})</CardTitle>
          <Input
            placeholder="Search by name, ID or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.appliesTo}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.targetName}{" "}
                    <span className="text-muted-foreground">({c.targetId})</span>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-700">
                    {c.type === "Percentage" ? `${c.value}%` : `Rs. ${c.value.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.reason}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Active" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
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