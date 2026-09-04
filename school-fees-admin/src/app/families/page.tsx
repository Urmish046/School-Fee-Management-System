"use client";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  API_URL,
  apiFamilyToFamily,
  emptyFamilyForm,
  formToApiPayload,
  formatDateForDisplay,
  getAuthHeaders,
  type ApiFamilyListResponse,
  type Family,
} from "@/lib/family-adapters";
import { deleteFamily } from "@/lib/api/families";

const emptyForm = emptyFamilyForm;
const pageSize = 10;

export default function FamiliesPage() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [families, setFamilies] = useState<Family[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  const loadFamilies = async (targetPage = page, searchTerm = search) => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(pageSize),
      });
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const response = await fetch(`${API_URL}/api/families?${params.toString()}`, {
        headers: { Accept: "application/json", ...getAuthHeaders() },
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || `Families request failed: ${response.status}`);
      }

      const payload = body as ApiFamilyListResponse;
      setFamilies(Array.isArray(payload?.data) ? payload.data.map(apiFamilyToFamily) : []);
      setTotalPages(payload?.pagination?.totalPages ?? 1);
      setTotalCount(payload?.pagination?.total ?? payload?.count ?? 0);
    } catch (error) {
      console.error("Failed to load families:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load families.");
      setFamilies([]);
      toast.error("Couldn't load families", {
        description: `Check that the API is running at ${API_URL} and that you're logged in.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever the page changes
  useEffect(() => {
    loadFamilies(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounce search — reset to page 1 and refetch from the server
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      loadFamilies(1, search);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteFamily = async (family: Family) => {
    if (!window.confirm(`Deactivate ${family.fatherName}'s family?`)) return;

    setDeletingId(family.id);
    try {
      await deleteFamily(family.id);
      toast.success("Family deactivated.");
      await loadFamilies(page, search);
    } catch (error) {
      toast.error("Failed to deactivate family", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveFamily = async () => {
    if (!form.fatherName.trim()) {
      toast.error("Father / Parent Name is required.");
      return;
    }
    if (!form.contact.trim()) {
      toast.error("Father Contact is required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/families`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formToApiPayload(form)),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || `Save failed: ${response.status}`);
      }

      const created = apiFamilyToFamily(body.data);

      toast.success("Family added!", {
        description: `${created.familyId} has been created and is ready for student enrollment.`,
      });
      setForm(emptyForm);
      setDialogOpen(false);
      setPage(1);
      await loadFamilies(1, search);
    } catch (error) {
      console.error("Failed to save family:", error);
      toast.error("Failed to save family", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Families</h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered families
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            + Add Family
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Family</DialogTitle>
              <DialogDescription>
                Enter the details of the parents/guardians. A Family ID will be assigned automatically once saved.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="fatherName">Father / Parent Name</Label>
                <Input
                  id="fatherName"
                  placeholder="e.g. Muhammad Arshad"
                  value={form.fatherName}
                  onChange={(e) => updateField("fatherName", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motherName">Mother Name</Label>
                <Input
                  id="motherName"
                  placeholder="e.g. Sadia Arshad"
                  value={form.motherName}
                  onChange={(e) => updateField("motherName", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  placeholder="11111-1111111-1"
                  value={form.cnic}
                  onChange={(e) => updateField("cnic", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admissionDate">Admission Date</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => updateField("admissionDate", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fatherContact">Father Contact</Label>
                <Input
                  id="fatherContact"
                  placeholder="0300-1234567"
                  value={form.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motherContact">Mother Contact</Label>
                <Input
                  id="motherContact"
                  placeholder="0300-7654321"
                  value={form.motherContact}
                  onChange={(e) => updateField("motherContact", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="0300-1234567"
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="family@email.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="0300-1112223"
                  value={form.emergencyContact}
                  onChange={(e) => updateField("emergencyContact", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Active/Inactive Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v ?? "")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="House #, Street, City"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="scholarshipInfo">Scholarship Information</Label>
                <Input
                  id="scholarshipInfo"
                  placeholder="e.g. Merit scholarship, 20% tuition waiver"
                  value={form.scholarshipInfo}
                  onChange={(e) => updateField("scholarshipInfo", e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 border rounded-md p-3">
                <Label className="mb-1 block">Family Concession (optional)</Label>
                <Input
                  type="number"
                  placeholder="Amount, e.g. 1000"
                  value={form.concessionValue}
                  onChange={(e) => updateField("concessionValue", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Stored as a single numeric amount (family_concession).
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes about this family..."
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveFamily}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Family"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Families ({totalCount})</CardTitle>
          <Input
            placeholder="Search by name, CNIC, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family ID</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Mother Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Concession</TableHead>
                <TableHead>Scholarship</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Loading families...
                  </TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <p className="text-red-600 font-medium">{loadError}</p>
                    <button
                      type="button"
                      onClick={() => loadFamilies(page, search)}
                      className="mt-2 rounded-md border px-3 py-1.5 text-sm"
                    >
                      Retry
                    </button>
                  </TableCell>
                </TableRow>
              ) : families.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No families found.
                  </TableCell>
                </TableRow>
              ) : (
                families.map((family) => (
                  <TableRow
                    key={family.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/families/${family.id}`)}
                  >
                    <TableCell className="font-medium">{family.familyId}</TableCell>
                    <TableCell>{family.fatherName}</TableCell>
                    <TableCell>{family.motherName || "—"}</TableCell>
                    <TableCell>{family.contact}</TableCell>
                    <TableCell>{family.email || "—"}</TableCell>
                    <TableCell>
                      {family.concession > 0 ? `Rs. ${family.concession.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>{family.scholarshipInfo || "—"}</TableCell>
                    <TableCell>{formatDateForDisplay(family.admissionDate)}</TableCell>
                    <TableCell>
                      <Badge variant={family.status === "Active" ? "default" : "secondary"}>
                        {family.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          title="Edit family"
                          onClick={() => router.push(`/families/${family.id}`)}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          title="Delete family"
                          disabled={deletingId === family.id}
                          onClick={() => handleDeleteFamily(family)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {deletingId === family.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} &middot; {totalCount} total
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === totalPages || loading}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}