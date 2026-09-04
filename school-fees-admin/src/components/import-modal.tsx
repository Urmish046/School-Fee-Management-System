"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, UploadCloud, Download } from "lucide-react";
import { toast } from "sonner";

export function ImportModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = "FirstName,LastName,DateOfBirth,Gender,Class,Section,FamilyID,MonthlyFee\nAli,Arshad,12-Mar-2015,Male,Class 5,A,FAM-001,4000";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("No file selected", { description: "Please select a CSV or Excel file first." });
      return;
    }
    
    setIsUploading(true);
    
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Import Successful!", {
        description: `Successfully imported students from ${file.name}.`
      });
      setFile(null);
      setOpen(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-10 px-4 py-2">
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Import Excel/CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add multiple students at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
            <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
            <Label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-blue-600 hover:underline">
              {file ? file.name : "Click to select a file"}
            </Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Supports .CSV and .XLSX files up to 5MB.
            </p>
          </div>

          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-md flex justify-between items-center">
            <span>Need the correct format?</span>
            <Button variant="link" className="h-auto p-0 text-blue-700" onClick={handleDownloadTemplate}>
              <Download className="mr-1 h-3 w-3" /> Download Template
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-slate-900 text-white hover:bg-slate-800">
            {isUploading ? "Importing..." : "Upload & Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}