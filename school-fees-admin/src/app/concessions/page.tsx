"use client";

import { useState, type MouseEvent } from "react";
import { mockConcessions, type Concession } from "@/lib/mock-concessions";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [concessions, setConcessions] = useState<Concession[]>(mockConcessions);
  const [auditTrail, setAuditTrail] = useState<{ id: string; action: string; details: string; date: string }[]>([]);
  const [appliesTo, setAppliesTo] = useState("Family");
  const [targetId, setTargetId] = useState("");
  const [scholarshipName, setScholarshipName] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [approval, setApproval] = useState("Approved");
  const [remarks, setRemarks] = useState("");

  const handleEntryTypeChange = (value: string | null) => {
    setEntryType(value ?? "Concession");
  };

  const filtered = concessions.filter(
    (c) =>
      c.targetName.toLowerCase().includes(search.toLowerCase()) ||
      c.targetId.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = concessions.filter((c) => c.status === "Active").length;

  const resetForm = () => {
    setTargetId("");
    setScholarshipName("");
    setValue("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setRemarks("");
  };

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    const numericValue = Number(value);
    if (!targetId || !reason || !value || numericValue < 0 || (discountType === "Percentage" && numericValue > 100)) {
      event.preventDefault();
      toast.error("Complete the required fields", { description: "Select a target, enter a reason and provide a valid discount value." });
      return;
    }
    if (entryType === "Scholarship" && (!scholarshipName || !startDate || !endDate)) {
      event.preventDefault();
      toast.error("Complete the scholarship details", { description: "Name, start date and end date are required." });
      return;
    }

    const targetName = targetId.startsWith("FAM")
      ? targetId === "FAM-0001" ? "Muhammad Arshad" : targetId === "FAM-0002" ? "Imran Khan" : "Tariq Mahmood"
      : targetId === "STD-001" ? "Ali Arshad" : "Sara Khan";
    const idPrefix = entryType === "Scholarship" ? "SCH" : "CON";
    const newId = `${idPrefix}-${String(concessions.length + 1).padStart(3, "0")}`;
    const newRecord: Concession = {
      id: newId,
      recordType: entryType as Concession["recordType"],
      appliesTo: appliesTo as Concession["appliesTo"],
      targetName,
      targetId,
      type: discountType as Concession["type"],
      value: numericValue,
      reason,
      status: "Active",
      ...(entryType === "Scholarship" ? { scholarshipName, startDate, endDate, approval: approval as Concession["approval"], remarks } : {}),
    };
    setConcessions((current) => [...current, newRecord]);
    setAuditTrail((current) => [{
      id: `AUD-${String(current.length + 1).padStart(3, "0")}`,
      action: `Created ${entryType}`,
      details: `${newId} for ${targetName} (${discountType === "Percentage" ? `${numericValue}%` : `Rs. ${numericValue.toLocaleString()}`})`,
      date: new Date().toLocaleString(),
    }, ...current]);
    resetForm();
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
                  <Select value={appliesTo} onValueChange={(value) => setAppliesTo(value ?? "Family")}>
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
                  <Select value={targetId} onValueChange={(value) => setTargetId(value ?? "")}>
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
                    value={scholarshipName}
                    onChange={(event) => setScholarshipName(event.target.value)}
                  />
                </div>
              )}

              {/* Discount Type */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <Label className="sm:text-right">Discount Type</Label>
                <div className="w-full">
                  <Select value={discountType} onValueChange={(value) => setDiscountType(value ?? "Percentage")}>
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
                  min="0"
                  max={discountType === "Percentage" ? "100" : undefined}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>

              {/* Start Date */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">Start Date</Label>
                  <Input type="date" className="w-full" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </div>
              )}

              {/* End Date */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">End Date</Label>
                  <Input type="date" className="w-full" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </div>
              )}

              {/* Reason */}
              <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
                <Label className="sm:text-right pt-2">Reason</Label>
                <Input
                  placeholder={entryType === "Scholarship" ? "e.g. Merit Scholarship" : "e.g. Sibling Discount"}
                  className="w-full"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>

              {/* Approval */}
              {entryType === "Scholarship" && (
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <Label className="sm:text-right">Approval</Label>
                  <div className="w-full">
                    <Select value={approval} onValueChange={(value) => setApproval(value ?? "Approved")}>
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
                  <Textarea
                    placeholder="Optional notes"
                    className="w-full"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
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
            <p className="text-2xl font-bold">{concessions.length}</p>
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
              {concessions.filter((c) => c.appliesTo === "Family").length} /{" "}
              {concessions.filter((c) => c.appliesTo === "Student").length}
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
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">{c.appliesTo}</Badge>
                      <span className="text-xs text-muted-foreground">{c.recordType}</span>
                    </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({auditTrail.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {auditTrail.length === 0 ? (
            <p className="text-sm text-muted-foreground">New concession and scholarship changes will appear here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Action</TableHead><TableHead>Details</TableHead><TableHead>Date</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {auditTrail.map((entry) => (
                  <TableRow key={entry.id}><TableCell className="font-medium">{entry.action}</TableCell><TableCell>{entry.details}</TableCell><TableCell className="text-muted-foreground">{entry.date}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}