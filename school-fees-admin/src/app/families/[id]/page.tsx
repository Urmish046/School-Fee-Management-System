"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  API_URL,
  apiFamilyToForm,
  formToApiPayload,
  getAuthHeaders,
  type ApiFamily,
  type FamilyFormValues,
} from "@/lib/family-adapters";

export default function FamilyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<FamilyFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadFamily = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${API_URL}/api/families/${id}`, {
        headers: { Accept: "application/json", ...getAuthHeaders() },
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || `Failed to load family: ${response.status}`);
      }

      setForm(apiFamilyToForm(body.data as ApiFamily));
    } catch (error) {
      console.error("Failed to load family:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load family.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateField = (field: keyof FamilyFormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;

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
      const response = await fetch(`${API_URL}/api/families/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formToApiPayload(form)),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || `Update failed: ${response.status}`);
      }

      setForm(apiFamilyToForm(body.data as ApiFamily));
      toast.success("Family updated.");
    } catch (error) {
      console.error("Failed to update family:", error);
      toast.error("Failed to update family", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/families/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", ...getAuthHeaders() },
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || `Delete failed: ${response.status}`);
      }

      // Your backend soft-deletes (is_active = false) rather than removing the row.
      toast.success("Family deactivated.");
      setDeleteDialogOpen(false);
      router.push("/families");
    } catch (error) {
      console.error("Failed to deactivate family:", error);
      toast.error("Failed to deactivate family", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading family...</p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600 font-medium">{loadError ?? "Family not found."}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadFamily}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => router.push("/families")}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Back to Families
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/families")}
            className="text-sm text-muted-foreground hover:underline mb-1"
          >
            &larr; Back to Families
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{form.fatherName || "Family"}</h1>
            <Badge variant={form.status === "Active" ? "default" : "secondary"}>
              {form.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Family ID: FAM-{String(id).padStart(4, "0")}</p>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 h-10 px-4 py-2">
            Deactivate Family
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate this family?</DialogTitle>
              <DialogDescription>
                This marks the family as inactive rather than deleting the record outright. You can
                reactivate it later by editing the status below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Family Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fatherName">Father / Parent Name</Label>
              <Input
                id="fatherName"
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motherName">Mother Name</Label>
              <Input
                id="motherName"
                value={form.motherName}
                onChange={(e) => updateField("motherName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnic">CNIC</Label>
              <Input
                id="cnic"
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
                value={form.contact}
                onChange={(e) => updateField("contact", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motherContact">Mother Contact</Label>
              <Input
                id="motherContact"
                value={form.motherContact}
                onChange={(e) => updateField("motherContact", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={(e) => updateField("emergencyContact", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Active/Inactive Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", (v ?? "Active") as "Active" | "Inactive")}
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
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="scholarshipInfo">Scholarship Information</Label>
              <Input
                id="scholarshipInfo"
                value={form.scholarshipInfo}
                onChange={(e) => updateField("scholarshipInfo", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="concessionValue">Family Concession (amount)</Label>
              <Input
                id="concessionValue"
                type="number"
                value={form.concessionValue}
                onChange={(e) => updateField("concessionValue", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}