"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockStudentsFull } from "@/lib/mock-students-full";
import { mockFamilies } from "@/lib/mock-data";
import {
  mockStudentPayments,
  mockStudentProfiles,
} from "@/lib/mock-student-payments";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { ReceiptModal } from "@/components/ui/receipt-modal";

export default function StudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params); // Next.js 15+/16: params is a Promise, must unwrap

  const student = mockStudentsFull.find((s) => s.id === id);
  const payments = mockStudentPayments[id] || [];
  const profile = mockStudentProfiles[id];
  const familyRouteId =
    mockFamilies.find((f) => f.familyId === student?.familyId)?.id ?? student?.familyId ?? "1";

  if (!student) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Student not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/students")}>
          Back to Students
        </Button>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/students")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              Student Details: {student.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.id} &middot; {student.className} - {student.section}
            </p>
          </div>
        </div>
        <Link href={`/families/${familyRouteId}`}>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" /> View Family
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  student.status === "Active"
                    ? "default"
                    : student.status === "Suspended"
                    ? "destructive"
                    : "secondary"
                }
              >
                {student.status}
              </Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Family</span>
              <span className="font-medium">
                {student.familyName} ({student.familyId})
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Class / Section</span>
              <span className="font-medium">
                {student.className} - {student.section}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Monthly Fee</span>
              <span className="font-bold">Rs. {student.monthlyFee.toLocaleString()}</span>
            </div>
            {profile && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Mother</span>
                  <span>{profile.motherName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Roll Number</span>
                  <span>{profile.rollNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Admission Date</span>
                  <span>{profile.admissionDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span>{profile.dob}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Gender</span>
                  <span>{profile.gender}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Contact</span>
                  <span>{profile.contact}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Address</span>
                  <span>{profile.address}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Academic Session</span>
                  <span>{profile.academicSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">B-Form / CNIC</span>
                  <span>{profile.bForm}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Monthly Fee</span>
              <span className="font-bold">Rs. {student.monthlyFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Paid (all time)</span>
              <span className="font-bold text-green-600">
                Rs. {totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payments Recorded</span>
              <span className="font-medium">{payments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No payments recorded yet for this student.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.date}</TableCell>
                    
                    {/* YAHAN TABDEELI KI GAYI HAI */}
                    <TableCell>
                      <ReceiptModal 
                        receiptNo={p.receiptNo} 
                        date={p.date} 
                        month={p.month}
                        method={p.method} 
                        amount={`Rs. ${p.amountPaid.toLocaleString()}`} 
                        receivedFrom={`${student.name} (${student.id})`} 
                      />
                    </TableCell>

                    <TableCell>{p.month}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      Rs. {p.amountPaid.toLocaleString()}
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