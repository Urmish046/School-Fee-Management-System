"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, School, FileText, Banknote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const handleSave = (section: string) => {
    toast.success("Settings Saved!", {
      description: `${section} settings have been updated successfully.`,
    });
  };

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
            <CardDescription>Official details that appear on receipts and reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input id="schoolName" defaultValue="SKYLARKS Educational System" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="051-1234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue="admin@skylarks.edu" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Official Address</Label>
              <Textarea id="address" defaultValue="Sector F-8, Main Boulevard, Islamabad" className="resize-none" />
            </div>
            <Button onClick={() => handleSave("School Profile")} className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2">
              <Save className="mr-2 h-4 w-4" /> Save Profile Settings
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
            <CardDescription>Configure bank details and printed instructions for fee challans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Default Bank Name</Label>
              <Input id="bankName" defaultValue="HBL (Habib Bank Limited)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account Number / IBAN</Label>
              <Input id="accountNo" defaultValue="PK32 HABB 0000 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fine">Late Fee Fine (Per Day)</Label>
              <Input id="fine" type="number" defaultValue="50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Terms & Instructions (Printed on Challan)</Label>
              <Textarea 
                id="instructions" 
                defaultValue="1. Fee must be paid by the 10th of every month.&#10;2. Late fee of Rs. 50/day applies after due date.&#10;3. Fees are non-refundable." 
                className="resize-none h-24" 
              />
            </div>
            <Button onClick={() => handleSave("Challan Template")} className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2">
              <Save className="mr-2 h-4 w-4" /> Save Template Settings
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}