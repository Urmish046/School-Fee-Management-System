"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { toast } from "sonner";
import { getStudent, type ApiStudent } from "@/lib/api/students";
import { getClass, type ApiClass } from "@/lib/api/classes";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function StudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params); // Next.js 15+/16: params is a Promise, must unwrap

  const [student, setStudent] = useState<ApiStudent | null>(null);
  const [classData, setClassData] = useState<ApiClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    getStudent(id)
      .then((response) => {
        setStudent(response.data);
        if (response.data.class_id) {
          return getClass(response.data.class_id)
            .then((classResponse) => setClassData(classResponse.data))
            .catch(() => {
              // Non-fatal — class fee just won't show.
            });
        }
      })
      .catch((error) => {
        setNotFound(true);
        toast.error("Unable to load student", {
          description:
            error instanceof Error ? error.message : "Check the students API.",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading student...</p>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Student not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/students")}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  const monthlyFee = classData ? Number(classData.total_base_fee) || 0 : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              Student Details: {student.student_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.admission_number} &middot; {student.class_name ?? "—"} -{" "}
              {student.section_name ?? "—"}
            </p>
          </div>
        </div>
        <Link href={`/families/${student.family_id}`}>
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
                    : student.status === "Graduated"
                      ? "secondary"
                      : "destructive"
                }
              >
                {student.status}
              </Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Family</span>
              <span className="font-medium">
                {student.father_parent_name} (FAM-
                {String(student.family_id).padStart(4, "0")})
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Class / Section</span>
              <span className="font-medium">
                {student.class_name ?? "—"} - {student.section_name ?? "—"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Mother</span>
              <span>{student.mother_name ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Roll Number</span>
              <span>{student.roll_number ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Admission Date</span>
              <span>{formatDate(student.admission_date)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date of Birth</span>
              <span>{formatDate(student.date_of_birth)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Gender</span>
              <span>{student.gender ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Contact</span>
              <span>{student.contact ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Address</span>
              <span>{student.address ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Academic Session</span>
              <span>{student.session_name ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">
                Monthly Fee (class base)
              </span>
              <span className="font-bold">
                {monthlyFee !== null
                  ? `Rs. ${monthlyFee.toLocaleString()}`
                  : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This is the base fee for{" "}
              {student.class_name ?? "the assigned class"}, not a per-student
              override. Payment history below isn't wired to a real endpoint yet
              — let me know which billing route to use once it's ready.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Payment history isn't connected to a backend endpoint yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
