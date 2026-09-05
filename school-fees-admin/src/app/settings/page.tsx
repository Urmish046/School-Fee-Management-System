"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, School, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  getSettings,
  updateSettings,
  type SystemSettings,
} from "@/lib/api/settings";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [formData, setFormData] = useState<SystemSettings>({
    id: 1,
    school_name: "",
    phone: "",
    email: "",
    address: "",
    bank_name: "",
    account_no: "",
    late_fee_per_day: 50,
    challan_instructions: "",
  });

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) setFormData(data);
      })
      .catch((err) => {
        toast.error("Failed to fetch settings", {
          description: err instanceof Error ? err.message : "Network error",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (section: "profile" | "challan") => {
    try {
      setSavingSection(section);

      const payload =
        section === "profile"
          ? {
              school_name: formData.school_name.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              address: formData.address.trim(),
            }
          : {
              bank_name: formData.bank_name.trim(),
              account_no: formData.account_no.trim(),
              late_fee_per_day: Number(formData.late_fee_per_day),
              challan_instructions: formData.challan_instructions.trim(),
            };

      const updated = await updateSettings(payload);
      setFormData((prev) => ({ ...prev, ...updated }));

      toast.success("Settings Saved!", {
        description: `${
          section === "profile" ? "School Profile" : "Challan Template"
        } settings updated successfully.`,
      });
    } catch (err) {
      toast.error("Save Failed", {
        description:
          err instanceof Error ? err.message : "Could not update settings.",
      });
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading system configurations...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage school branding, challan templates, and general configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Branding Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-slate-500" />
              <CardTitle>School Profile & Branding</CardTitle>
            </div>
            <CardDescription>
              Official details that appear on printed challans, receipts, and
              export reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={formData.school_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, school_name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Official Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, address: e.target.value }))
                }
                className="resize-none"
              />
            </div>
            <Button
              onClick={() => handleSave("profile")}
              disabled={savingSection === "profile"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingSection === "profile"
                ? "Saving..."
                : "Save Profile Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Challan Template Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <CardTitle>Challan & Fee Template</CardTitle>
            </div>
            <CardDescription>
              Configure bank details, late fines, and printed instructions for
              fee challans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Default Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bank_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account Number / IBAN</Label>
              <Input
                id="accountNo"
                value={formData.account_no}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, account_no: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fine">Late Fee Fine (Per Day in PKR)</Label>
              <Input
                id="fine"
                type="number"
                value={formData.late_fee_per_day}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    late_fee_per_day: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">
                Terms & Instructions (Printed on Challan)
              </Label>
              <Textarea
                id="instructions"
                value={formData.challan_instructions}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    challan_instructions: e.target.value,
                  }))
                }
                className="resize-none h-24"
              />
            </div>
            <Button
              onClick={() => handleSave("challan")}
              disabled={savingSection === "challan"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingSection === "challan"
                ? "Saving..."
                : "Save Template Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
