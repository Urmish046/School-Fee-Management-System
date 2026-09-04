"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Receipt, Percent } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceiptModal } from "@/components/ui/receipt-modal";
import { mockFamilies } from "@/lib/mock-data";
import { mockStudentsFull } from "@/lib/mock-students-full";
import { mockConcessions, applyConcession } from "@/lib/mock-concessions";

export default function FamilyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const familyRouteId = params.id as string;

  const family = mockFamilies.find((f) => f.id === familyRouteId);

  if (!family) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Family not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/families")}>
          Back to Families
        </Button>
      </div>
    );
  }

  // Real children linked to this family via familyId (e.g. "FAM-0001")
  const children = mockStudentsFull.filter((s) => s.familyId === family.familyId);

  // Concessions that apply to this whole family, or to any of its individual children
  const applicableConcessions = mockConcessions.filter(
    (c) =>
      c.status === "Active" &&
      ((c.appliesTo === "Family" && c.targetId === family.familyId) ||
        (c.appliesTo === "Student" && children.some((ch) => ch.id === c.targetId)))
  );

  const grossFee = children.reduce((sum, c) => sum + c.monthlyFee, 0);
  const totalDiscount = applicableConcessions.reduce((sum, c) => {
    const relevantFee =
      c.appliesTo === "Family"
        ? grossFee
        : children.find((ch) => ch.id === c.targetId)?.monthlyFee || 0;
    return sum + (relevantFee - applyConcession(relevantFee, c));
  }, 0);
  const netPayable = grossFee - totalDiscount;

  const paymentHistory = [
    { date: "10 Aug 2026", amount: `Rs. ${netPayable.toLocaleString()}`, method: "Cash", receipt: "REC-001" },
    { date: "12 Jul 2026", amount: `Rs. ${netPayable.toLocaleString()}`, method: "Bank Transfer", receipt: "REC-002" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Family Details: {family.familyId}
            </h1>
            <p className="text-muted-foreground">
              {family.fatherName} | {family.contact}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Generate Challan Dialog */}
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-slate-100 h-10 px-4 py-2">
              <Receipt className="mr-2 h-4 w-4" /> Generate Challan
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate Family Challan</DialogTitle>
                <DialogDescription>
                  Are you sure you want to generate a new challan for this family? This will consolidate all children&apos;s fees, active concessions, and previous arrears.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium">Billing Month</span>
                  <span className="text-sm text-muted-foreground">September 2026</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium">Gross Fee</span>
                  <span className="text-sm text-muted-foreground">
                    Rs. {grossFee.toLocaleString()}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium">Concession Applied</span>
                    <span className="text-sm text-green-600">
                      - Rs. {totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium">Total Payable</span>
                  <span className="text-sm font-bold">Rs. {netPayable.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/fees")}
                >
                  Generate & Print PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Receive Payment Dialog Popup */}
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2">
              <CreditCard className="mr-2 h-4 w-4" /> Receive Payment
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Receive Payment</DialogTitle>
                <DialogDescription>
                  Record a fee payment for this family. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`e.g. ${netPayable}`}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method" className="text-right">Method</Label>
                  <div className="col-span-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank">Bank</SelectItem>
                        <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                        <SelectItem value="JazzCash">JazzCash</SelectItem>
                        <SelectItem value="Easypaisa">Easypaisa</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input id="date" type="date" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remarks" className="text-right">Remarks</Label>
                  <Input id="remarks" placeholder="Optional notes..." className="col-span-3" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Save Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Financial Overview Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Current Status</span>
              <Badge variant={family.status === "Active" ? "default" : "secondary"}>
                {family.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Gross Fee</span>
              <span className={totalDiscount > 0 ? "text-muted-foreground line-through" : "font-bold text-lg"}>
                Rs. {grossFee.toLocaleString()}
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Payable (after discount)</span>
                <span className="font-bold text-lg text-green-700">
                  Rs. {netPayable.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Previous Arrears</span>
              <span className="text-red-500 font-medium">Rs. 0</span>
            </div>
          </CardContent>
        </Card>

        {/* Children List Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Enrolled Children</CardTitle>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No children linked to this family yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {children.map((child) => (
                    <TableRow
                      key={child.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/students/${child.id}`)}
                    >
                      <TableCell className="font-medium">{child.id}</TableCell>
                      <TableCell>{child.name}</TableCell>
                      <TableCell>{child.className}</TableCell>
                      <TableCell>Rs. {child.monthlyFee.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Concessions & Scholarships Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-4 w-4" /> Concessions & Scholarships
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicableConcessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No active concessions or scholarships for this family.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount Reduced</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicableConcessions.map((c) => {
                  const relevantFee =
                    c.appliesTo === "Family"
                      ? grossFee
                      : children.find((ch) => ch.id === c.targetId)?.monthlyFee || 0;
                  const reduced = relevantFee - applyConcession(relevantFee, c);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge variant="secondary">{c.appliesTo}</Badge>{" "}
                        {c.appliesTo === "Student" ? c.targetName : "Whole Family"}
                      </TableCell>
                      <TableCell className="font-medium text-blue-700">
                        {c.type === "Percentage" ? `${c.value}%` : `Rs. ${c.value.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.reason}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        - Rs. {reduced.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <ReceiptModal
                      receiptNo={payment.receipt}
                      date={payment.date}
                      month="August 2026"
                      method={payment.method}
                      amount={payment.amount}
                      receivedFrom={`${family.fatherName} (${family.familyId})`}
                    />
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="text-green-600 font-medium">{payment.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}