"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, BarChart3, TrendingUp, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Poore saal ke mahino ki list
const monthsList = [
  { value: "january-2026", label: "January 2026" },
  { value: "february-2026", label: "February 2026" },
  { value: "march-2026", label: "March 2026" },
  { value: "april-2026", label: "April 2026" },
  { value: "may-2026", label: "May 2026" },
  { value: "june-2026", label: "June 2026" },
  { value: "july-2026", label: "July 2026" },
  { value: "august-2026", label: "August 2026" },
  { value: "september-2026", label: "September 2026" },
  { value: "october-2026", label: "October 2026" },
  { value: "november-2026", label: "November 2026" },
  { value: "december-2026", label: "December 2026" },
];

export default function ReportsPage() {
  
  // Real CSV Download Function
  const handleExport = (reportType: string) => {
    let filename = "report.csv";
    let csvContent = "";

    if (reportType === "Fee Collection Report") {
      filename = "fee_collection_report.csv";
      csvContent = "Challan ID,Family Name,Class,Amount Paid,Date,Method\n" +
                   "FC-2026-000002,Tariq Mahmood,Class 2,Rs. 4,500,20 Aug 2026,Bank Transfer\n" +
                   "FC-2026-000005,Ali Arshad,Class 5,Rs. 4,000,22 Aug 2026,Cash";
    } else if (reportType === "Concessions Report") {
      filename = "concessions_list.csv";
      csvContent = "Student ID,Name,Class,Concession Type,Amount Waived\n" +
                   "STD-005,Zainab Ali,Class 3,Staff Discount,Rs. 1,000";
    } else if (reportType === "P&L Report") {
      filename = "profit_and_loss_statement.csv";
      csvContent = "Category,Type,Amount\n" +
                   "Tuition Fees,Income,Rs. 245,000\n" +
                   "Admission Fees,Income,Rs. 15,000\n" +
                   "Staff Salaries,Expense,-Rs. 180,000\n" +
                   "Utilities,Expense,-Rs. 25,500\n" +
                   "Net Profit/Loss,Total,Rs. 54,500";
    } else {
      filename = "defaulters_list.csv";
      csvContent = "Family ID,Family Name,Phone,Pending Balance,Status\n" +
                   "FAM-001,Muhammad Arshad,0300-1234567,Rs. 7,000,Unpaid\n" +
                   "FAM-003,Tariq Mehmood,0333-4567890,Rs. 4,500,Overdue";
    }

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report Downloaded Successfully!", {
      description: `${reportType} has been saved to your downloads folder.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports & Export Centre</h1>
        <p className="text-sm text-muted-foreground">
          Generate, analyze, and export financial summaries and fee collection logs.
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Aug)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. 245,000</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">Rs. 42,000</div>
            <p className="text-xs text-muted-foreground mt-1">Across 8 families</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled in 10 classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Fee Collection Report */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Report</CardTitle>
            <CardDescription>Detailed log of all payments received from families.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">Month</Label>
                <Select defaultValue="august-2026">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsList.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Label className="text-xs">Format</Label>
                <Select defaultValue="excel">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => handleExport("Fee Collection Report")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Collection Report
            </Button>
          </CardContent>
        </Card>

        {/* Defaulters / Pending Dues Report */}
        <Card>
          <CardHeader>
            <CardTitle>Defaulters & Pending Dues</CardTitle>
            <CardDescription>List of families with overdue payments and pending balances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">Status</Label>
                <Select defaultValue="unpaid">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid Only</SelectItem>
                    <SelectItem value="overdue">Overdue (&gt; 30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Label className="text-xs">Format</Label>
                <Select defaultValue="excel">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => handleExport("Defaulters Report")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" /> Download Defaulters List
            </Button>
          </CardContent>
        </Card>

        {/* Concessions & Scholarships Report */}
        <Card>
          <CardHeader>
            <CardTitle>Concessions & Scholarships</CardTitle>
            <CardDescription>Export a list of students receiving fee waivers or discounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">Month</Label>
                <Select defaultValue="august-2026">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsList.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Label className="text-xs">Format</Label>
                <Select defaultValue="excel">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => handleExport("Concessions Report")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" /> Download Concession List
            </Button>
          </CardContent>
        </Card>

        {/* Profit & Loss (P&L) Report */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss (P&L) Statement</CardTitle>
            <CardDescription>Category-wise breakdown of all income and expenses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label className="text-xs">From Date</Label>
                <Input type="date" defaultValue="2026-08-01" className="mt-1" />
              </div>
              <div className="w-1/2">
                <Label className="text-xs">To Date</Label>
                <Input type="date" defaultValue="2026-08-31" className="mt-1" />
              </div>
            </div>
            <div className="w-full">
              <Label className="text-xs">Format</Label>
              <Select defaultValue="excel">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleExport("P&L Report")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" /> Download P&L Statement
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}