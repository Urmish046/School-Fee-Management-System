"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockStudentsFull } from "@/lib/mock-students-full";
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
import { toast } from "sonner";
import { ImportModal } from "@/components/import-modal";

export default function StudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSaveStudent = () => {
    toast.success("Student successfully added!", {
      description: "The student has been linked to the family profile.",
    });
  };

  const filteredStudents = mockStudentsFull.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase()) ||
      student.familyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage all enrolled students across classes.
          </p>
        </div>

        {/* Yahan dono buttons ko ek flex container mein daal diya hai */}
        <div className="flex items-center gap-2">
          <ImportModal />
          
          {/* Add Student Dialog Popup */}
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
              + Add Student
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details and link them to a family profile.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" placeholder="e.g. STD-005" />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input id="name" placeholder="Student Name" />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="family">Parent / Family</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAM-0001">Muhammad Arshad (FAM-0001)</SelectItem>
                      <SelectItem value="FAM-0002">Imran Khan (FAM-0002)</SelectItem>
                      <SelectItem value="FAM-0003">Tariq Mehmood (FAM-0003)</SelectItem>
                      <SelectItem value="FAM-0004">Kamran Ali (FAM-0004)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mother">Mother</Label>
                  <Input id="mother" placeholder="Mother name" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 1">Class 1</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 8">Class 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" placeholder="e.g. 07" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admissionDate">Admission Date</Label>
                  <Input id="admissionDate" type="date" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input id="contact" placeholder="03XX-XXXXXXX" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="Active">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                                            <SelectItem value="Suspended">Withdrawn</SelectItem>
                      <SelectItem value="Graduated">Graduated</SelectItem>

                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street / Area / City" />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="session">Academic Session</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="fee">Monthly Fee</Label>
                  <Input id="fee" type="number" placeholder="e.g. 4000" />
                </div>
              </div>

              <div className="flex justify-end">
                <DialogClose
                  onClick={handleSaveStudent}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
                >
                  Save Student
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
          <Input
            placeholder="Search by student name, ID or family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Family / Parent</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  onClick={() => router.push(`/students/${student.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.familyName} ({student.familyId})
                  </TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>Rs. {student.monthlyFee.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "Active"
                          ? "default"
                          : student.status === "Suspended"
                            ? "destructive"
                            : student.status === "Inactive"
                              ? "destructive"
                              : student.status === "Withdrawn"
                              ? "destructive"
                              : student.status === "Graduated"
                                ? "secondary"
                                : "secondary"
                      }
                    >
                      {student.status}
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