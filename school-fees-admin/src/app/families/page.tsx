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
import { useState } from "react";
import { mockFamilies, Family } from "@/lib/mock-data";
import { mockConcessions, Concession } from "@/lib/mock-concessions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const emptyForm = {
  fatherName: "",
  motherName: "",
  cnic: "",
  admissionDate: "",
  contact: "",
  motherContact: "",
  whatsapp: "",
  email: "",
  emergencyContact: "",
  address: "",
  notes: "",
  status: "Active" as "Active" | "Inactive",
  scholarshipInfo: "",
  concessionType: "" as "" | "Fixed" | "Percentage",
  concessionValue: "",
  concessionReason: "",
};

export default function FamiliesPage() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const router = useRouter();

  const filteredFamilies = mockFamilies.filter((family) =>
    family.fatherName.toLowerCase().includes(search.toLowerCase()) ||
    family.familyId.toLowerCase().includes(search.toLowerCase()) ||
    family.contact.includes(search)
  );

  const nextFamilyId = `FAM-${String(mockFamilies.length + 1).padStart(4, "0")}`;
  const nextInternalId = String(mockFamilies.length + 1);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveFamily = () => {
    if (!form.fatherName.trim()) {
      toast.error("Father / Parent Name is required.");
      return;
    }

    const newFamily: Family = {
      id: nextInternalId,
      familyId: nextFamilyId,
      fatherName: form.fatherName,
      motherName: form.motherName,
      cnic: form.cnic,
      contact: form.contact,
      motherContact: form.motherContact,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
      emergencyContact: form.emergencyContact,
      notes: form.notes,
      admissionDate: form.admissionDate,
      scholarshipInfo: form.scholarshipInfo,
      totalChildren: 0,
      balance: 0,
      status: form.status,
      paymentStatus: "Unpaid",
    };

    mockFamilies.push(newFamily);

    if (form.concessionType && form.concessionValue) {
      const newConcession: Concession = {
        id: `CON-${String(mockConcessions.length + 1).padStart(3, "0")}`,
        appliesTo: "Family",
        targetName: form.fatherName,
        targetId: nextFamilyId,
        type: form.concessionType,
        value: Number(form.concessionValue) || 0,
        reason: form.concessionReason || "Family Concession",
        status: "Active",
        recordType: "Concession"
      };
      mockConcessions.push(newConcession);
    }

    toast.success("Family added!", {
      description: `${nextFamilyId} has been created and is ready for student enrollment.`,
    });

    setForm(emptyForm);
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

        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            + Add Family
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Family</DialogTitle>
              <DialogDescription>
                Enter the details of the parents/guardians. Family ID{" "}
                <span className="font-medium">{nextFamilyId}</span> will be assigned automatically.
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    value={form.concessionType}
                    onValueChange={(v) => updateField("concessionType", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={form.concessionType === "Percentage" ? "e.g. 10" : "e.g. 1000"}
                    value={form.concessionValue}
                    onChange={(e) => updateField("concessionValue", e.target.value)}
                  />
                  <Input
                    placeholder="Reason (e.g. Sibling discount)"
                    value={form.concessionReason}
                    onChange={(e) => updateField("concessionReason", e.target.value)}
                  />
                </div>
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
              <DialogClose
                onClick={handleSaveFamily}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Save Family
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Families ({filteredFamilies.length})</CardTitle>
          <Input
            placeholder="Search by name, family ID or phone..."
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
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFamilies.map((family) => (
                <TableRow
                  key={family.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/families/${family.id}`)}
                >
                  <TableCell className="font-medium">{family.familyId}</TableCell>
                  <TableCell>{family.fatherName}</TableCell>
                  <TableCell>{family.contact}</TableCell>
                  <TableCell>{family.address}</TableCell>
                  <TableCell>{family.totalChildren}</TableCell>
                  <TableCell>
                    {family.balance > 0 ? (
                      <span className="text-red-600 font-medium">
                        Rs. {family.balance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">Paid</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={family.status === "Active" ? "default" : "secondary"}>
                      {family.status}
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