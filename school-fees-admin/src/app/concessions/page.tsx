"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ChevronLeft, ChevronRight, Power } from "lucide-react";
import {
  listConcessions,
  createConcession,
  toggleConcessionStatus,
  deleteConcession,
  type ApiConcession,
  type AuditLog,
  type CreateConcessionPayload,
} from "@/lib/api/concessions";
import { listFamilies } from "@/lib/api/families";
import { listStudents } from "@/lib/api/students";

export default function ConcessionsPage() {
  const [concessions, setConcessions] = useState<ApiConcession[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLog[]>([]);
  const [families, setFamilies] = useState<
    { id: number; father_parent_name: string }[]
  >([]);
  const [students, setStudents] = useState<
    {
      id: number;
      student_name: string;
      admission_number: string;
      family_id: number;
    }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [entryType, setEntryType] = useState<"Concession" | "Scholarship">(
    "Concession",
  );
  const [appliesTo, setAppliesTo] = useState<"Family" | "Student">("Family");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [scholarshipName, setScholarshipName] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "Fixed">(
    "Percentage",
  );
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [approval, setApproval] = useState<"Approved" | "Pending" | "Rejected">(
    "Approved",
  );
  const [remarks, setRemarks] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await listConcessions({
        page,
        limit: 10,
        search: search || undefined,
        record_type: typeFilter !== "all" ? typeFilter : undefined,
      });

      setConcessions(res.data || []);
      setAuditTrail(res.auditLogs || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.totalCount || 0);
    } catch (error) {
      toast.error("Failed to load concessions", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [fRes, sRes] = await Promise.all([
        listFamilies(100),
        listStudents({ limit: 100 }),
      ]);
      setFamilies(fRes.data || []);
      setStudents(sRes.data || []);
    } catch {
      // Lookups fail non-fatally
    }
  };

  useEffect(() => {
    loadData();
  }, [page, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadLookups();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = Number(value);

    if (
      !selectedTargetId ||
      !reason.trim() ||
      !value ||
      numValue < 0 ||
      (discountType === "Percentage" && numValue > 100)
    ) {
      toast.error("Complete the required fields", {
        description:
          "Select a target, enter a reason, and provide a valid discount value.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateConcessionPayload = {
        record_type: entryType,
        applies_to: appliesTo,
        family_id:
          appliesTo === "Family" ? Number(selectedTargetId) : undefined,
        student_id:
          appliesTo === "Student" ? Number(selectedTargetId) : undefined,
        scholarship_name:
          entryType === "Scholarship" ? scholarshipName.trim() : undefined,
        discount_type: discountType,
        value: numValue,
        reason: reason.trim(),
        approval: entryType === "Scholarship" ? approval : "Approved",
        start_date:
          entryType === "Scholarship" ? startDate || undefined : undefined,
        end_date:
          entryType === "Scholarship" ? endDate || undefined : undefined,
        remarks: remarks.trim() || undefined,
      };

      await createConcession(payload);
      toast.success(
        entryType === "Scholarship"
          ? "Scholarship Created!"
          : "Concession Recorded!",
        {
          description:
            "Discount synced with family profile and will apply to future invoice batches.",
        },
      );

      setIsAddOpen(false);
      setSelectedTargetId("");
      setScholarshipName("");
      setValue("");
      setReason("");
      setRemarks("");
      loadData();
    } catch (error) {
      toast.error("Failed to save concession", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: ApiConcession) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleConcessionStatus(item.id, nextStatus);
      toast.success(`Discount is now ${nextStatus}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update status", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  const handleDelete = async (item: ApiConcession) => {
    if (!confirm(`Delete ${item.concession_no}? This cannot be undone.`))
      return;
    try {
      await deleteConcession(item.id);
      toast.success("Concession removed successfully.");
      loadData();
    } catch (error) {
      toast.error("Failed to delete concession", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  const activeCount = concessions.filter((c) => c.status === "Active").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Concessions & Scholarships</h1>
          <p className="text-sm text-muted-foreground">
            Manage fixed or percentage-based discounts for families and
            students.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2 gap-2">
            <Plus className="h-4 w-4" /> Add Concession
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>
                  {entryType === "Scholarship"
                    ? "Add New Scholarship"
                    : "Add New Concession"}
                </DialogTitle>
                <DialogDescription>
                  {entryType === "Scholarship"
                    ? "Record a scholarship with approval and validity dates."
                    : "Apply a discount to a family or an individual student."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select
                      value={entryType}
                      onValueChange={(v) =>
                        setEntryType((v as any) ?? "Concession")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type">
                          {entryType}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Concession">Concession</SelectItem>
                        <SelectItem value="Scholarship">Scholarship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Applies To</Label>
                    <Select
                      value={appliesTo}
                      onValueChange={(v) => {
                        setAppliesTo((v as any) ?? "Family");
                        setSelectedTargetId("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope">
                          {appliesTo}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Family">Whole Family</SelectItem>
                        <SelectItem value="Student">
                          Individual Student
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>
                    {appliesTo === "Family"
                      ? "Target Family *"
                      : "Target Student *"}
                  </Label>
                  <Select
                    value={selectedTargetId}
                    onValueChange={(v) => setSelectedTargetId(v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          appliesTo === "Family"
                            ? "Select Family"
                            : "Select Student"
                        }
                      >
                        {appliesTo === "Family"
                          ? families.find(
                              (f) => String(f.id) === selectedTargetId,
                            )?.father_parent_name
                          : students.find(
                              (s) => String(s.id) === selectedTargetId,
                            )?.student_name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {appliesTo === "Family"
                        ? families.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>
                              {f.father_parent_name} (FAM-
                              {String(f.id).padStart(4, "0")})
                            </SelectItem>
                          ))
                        : students.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.student_name} ({s.admission_number})
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {entryType === "Scholarship" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="scholarshipName">Scholarship Name</Label>
                    <Input
                      id="scholarshipName"
                      placeholder="e.g. Merit Scholarship 2026"
                      value={scholarshipName}
                      onChange={(e) => setScholarshipName(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Discount Calculation</Label>
                    <Select
                      value={discountType}
                      onValueChange={(v) =>
                        setDiscountType((v as any) ?? "Percentage")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type">
                          {discountType}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="Fixed">
                          Fixed Amount (Rs.)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="discountValue">Value *</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      placeholder={
                        discountType === "Percentage" ? "e.g. 25" : "e.g. 1500"
                      }
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      min="0"
                      max={discountType === "Percentage" ? "100" : undefined}
                      required
                    />
                  </div>
                </div>

                {entryType === "Scholarship" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="reason">Reason / Justification *</Label>
                  <Input
                    id="reason"
                    placeholder="e.g. Sibling Concession (2nd Child)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                {entryType === "Scholarship" && (
                  <div className="space-y-1.5">
                    <Label>Approval Status</Label>
                    <Select
                      value={approval}
                      onValueChange={(v) =>
                        setApproval((v as any) ?? "Approved")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Approval">
                          {approval}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Optional administrative notes"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : entryType === "Scholarship"
                      ? "Save Scholarship"
                      : "Save Concession"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Concessions & Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Family vs Student Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {concessions.filter((c) => c.applies_to === "Family").length} /{" "}
              {concessions.filter((c) => c.applies_to === "Student").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Records ({totalCount})</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Input
              placeholder="Search by ID, name, admission no, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v ?? "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter type">
                  {typeFilter === "all" ? "All Types" : typeFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Concession">Concession</SelectItem>
                <SelectItem value="Scholarship">Scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type & Scope</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Reason / Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading concessions...
                  </TableCell>
                </TableRow>
              ) : concessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No concessions or scholarships registered.
                  </TableCell>
                </TableRow>
              ) : (
                concessions.map((c) => {
                  const targetLabel =
                    c.applies_to === "Family"
                      ? `${c.father_parent_name || "Family"} (FAM-${String(c.family_id).padStart(4, "0")})`
                      : `${c.student_name || "Student"} (${c.admission_number || "STD"})`;

                  return (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs font-semibold">
                        {c.concession_no}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit">
                            {c.applies_to}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {c.record_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {targetLabel}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-700">
                        {c.discount_type === "Percentage"
                          ? `${c.value}%`
                          : `Rs. ${Number(c.value).toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span>{c.reason}</span>
                          {c.scholarship_name && (
                            <span className="text-muted-foreground italic">
                              {c.scholarship_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              c.status === "Active" ? "Deactivate" : "Activate"
                            }
                            onClick={() => handleToggleStatus(c)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                            onClick={() => handleDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t mt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
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

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({auditTrail.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {auditTrail.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              New concession and scholarship changes will appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditTrail.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-xs">
                      {entry.action}
                    </TableCell>
                    <TableCell className="text-xs">{entry.details}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.performed_by_name || "System"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
