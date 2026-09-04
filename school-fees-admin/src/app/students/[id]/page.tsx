"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type ApiStudentListItem,
  type StudentPayload,
  type StudentStatus,
  type StudentGender,
} from "@/lib/api/students";
import {
  getAcademicClasses,
  getAcademicSessions,
  type AcademicClass,
  type AcademicSession,
} from "@/lib/api/academic-sessions";
import { listFamilies } from "@/lib/api/families";

type ApiFamily = {
  id: number;
  father_parent_name: string;
};

type StudentFormData = {
  admission_number: string;
  student_name: string;
  family_id: string;
  mother_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  section_id: string;
  roll_number: string;
  admission_date: string;
  contact: string;
  address: string;
  academic_session_id: string;
  status: StudentStatus;
};

const initialFormData: StudentFormData = {
  admission_number: "",
  student_name: "",
  family_id: "",
  mother_name: "",
  date_of_birth: "",
  gender: "",
  class_id: "",
  section_id: "",
  roll_number: "",
  admission_date: new Date().toISOString().split("T")[0],
  contact: "",
  address: "",
  academic_session_id: "",
  status: "Active",
};

export default function StudentsPage() {
  const router = useRouter();

  // Data states
  const [students, setStudents] = useState<ApiStudentListItem[]>([]);
  const [families, setFamilies] = useState<ApiFamily[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  // Loading & Pagination states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");

  // Modal / Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);

  // Fetch Lookups (Families, Classes, Sessions)
  useEffect(() => {
    async function loadLookups() {
      try {
        const [familiesRes, classesRes, sessionsRes] = await Promise.all([
          listFamilies(100),
          getAcademicClasses(),
          getAcademicSessions(),
        ]);
        setFamilies(familiesRes.data || []);
        setClasses(classesRes || []);
        setSessions(sessionsRes || []);

        const activeSession = sessionsRes?.find((s) => s.is_active);
        if (activeSession) {
          setFormData((prev) => ({
            ...prev,
            academic_session_id: String(activeSession.id),
          }));
        }
      } catch (error) {
        toast.error("Failed to load reference data", {
          description: error instanceof Error ? error.message : "Network error",
        });
      }
    }
    loadLookups();
  }, []);

  // Fetch Students with Filters and Pagination
  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const res = await listStudents({
        search: searchTerm || undefined,
        class_id:
          selectedClassFilter !== "all"
            ? Number(selectedClassFilter)
            : undefined,
        status:
          selectedStatusFilter !== "all"
            ? (selectedStatusFilter as StudentStatus)
            : undefined,
        page,
        limit: 10,
      });

      setStudents(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch students", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, [page, selectedClassFilter, selectedStatusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudentsList();
  };

  // Get available sections for the currently selected class in the form
  const availableSections = useMemo(() => {
    if (!formData.class_id) return [];
    const selected = classes.find(
      (c) => String(c.class_id) === String(formData.class_id),
    );
    return selected?.sections || [];
  }, [formData.class_id, classes]);

  // Labels for Custom Selects
  const familyLabel = useMemo(() => {
    if (!formData.family_id) return undefined;
    const found = families.find(
      (f) => String(f.id) === String(formData.family_id),
    );
    return found
      ? `${found.father_parent_name} (FAM-${String(found.id).padStart(4, "0")})`
      : undefined;
  }, [formData.family_id, families]);

  const classLabel = useMemo(() => {
    if (!formData.class_id) return undefined;
    const found = classes.find(
      (c) => String(c.class_id) === String(formData.class_id),
    );
    return found ? found.class_name : undefined;
  }, [formData.class_id, classes]);

  const sectionLabel = useMemo(() => {
    if (!formData.section_id) return undefined;
    const found = availableSections.find(
      (s) => String(s.id) === String(formData.section_id),
    );
    return found ? found.name : undefined;
  }, [formData.section_id, availableSections]);

  const sessionLabel = useMemo(() => {
    if (!formData.academic_session_id) return undefined;
    const found = sessions.find(
      (s) => String(s.id) === String(formData.academic_session_id),
    );
    return found
      ? `${found.name} ${found.is_active ? "(Active)" : ""}`
      : undefined;
  }, [formData.academic_session_id, sessions]);

  // Handlers
  const handleOpenAdd = () => {
    const activeSession = sessions.find((s) => s.is_active);
    setFormData({
      ...initialFormData,
      academic_session_id: activeSession ? String(activeSession.id) : "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: ApiStudentListItem) => {
    setEditingStudentId(student.id);
    setFormData({
      admission_number: student.admission_number,
      student_name: student.student_name,
      family_id: String(student.family_id),
      mother_name: student.mother_name || "",
      date_of_birth: student.date_of_birth
        ? student.date_of_birth.split("T")[0]
        : "",
      gender: student.gender || "",
      class_id: student.class_id ? String(student.class_id) : "",
      section_id: student.section_id ? String(student.section_id) : "",
      roll_number: student.roll_number || "",
      admission_date: student.admission_date
        ? student.admission_date.split("T")[0]
        : "",
      contact: student.student_contact || "",
      address: student.address || "",
      academic_session_id: student.session_id ? String(student.session_id) : "",
      status: student.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.admission_number ||
      !formData.student_name ||
      !formData.family_id
    ) {
      toast.error("Admission number, student name, and family are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: StudentPayload = {
        admission_number: formData.admission_number.trim(),
        student_name: formData.student_name.trim(),
        family_id: Number(formData.family_id),
        mother_name: formData.mother_name.trim() || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        gender: (formData.gender as StudentGender) || undefined,
        class_id: formData.class_id ? Number(formData.class_id) : undefined,
        section_id: formData.section_id
          ? Number(formData.section_id)
          : undefined,
        roll_number: formData.roll_number.trim() || undefined,
        admission_date: formData.admission_date || undefined,
        contact: formData.contact.trim() || undefined,
        address: formData.address.trim() || undefined,
        academic_session_id: formData.academic_session_id
          ? Number(formData.academic_session_id)
          : undefined,
        status: formData.status,
      };

      await createStudent(payload);
      toast.success("Student registered successfully.");
      setIsAddModalOpen(false);
      fetchStudentsList();
    } catch (error) {
      toast.error("Failed to add student", {
        description:
          error instanceof Error ? error.message : "Error creating record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId || !formData.student_name || !formData.family_id) {
      toast.error("Student name and family are required.");
      return;
    }

    try {
      setSubmitting(true);
      await updateStudent(editingStudentId, {
        student_name: formData.student_name.trim(),
        family_id: Number(formData.family_id),
        mother_name: formData.mother_name.trim() || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        gender: (formData.gender as StudentGender) || undefined,
        class_id: formData.class_id ? Number(formData.class_id) : undefined,
        section_id: formData.section_id
          ? Number(formData.section_id)
          : undefined,
        roll_number: formData.roll_number.trim() || undefined,
        admission_date: formData.admission_date || undefined,
        contact: formData.contact.trim() || undefined,
        address: formData.address.trim() || undefined,
        academic_session_id: formData.academic_session_id
          ? Number(formData.academic_session_id)
          : undefined,
        status: formData.status,
      });

      toast.success("Student updated successfully.");
      setIsEditModalOpen(false);
      fetchStudentsList();
    } catch (error) {
      toast.error("Failed to update student", {
        description:
          error instanceof Error ? error.message : "Error updating record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteStudent(id);
      toast.success("Student record deleted.");
      fetchStudentsList();
    } catch (error) {
      toast.error("Failed to delete student", {
        description:
          error instanceof Error ? error.message : "Error deleting record",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Students Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage student registrations, class placements, and academic
            tracking.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, admission no, parent, or phone..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedClassFilter}
                onValueChange={(val) => {
                  setSelectedClassFilter(val ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-162.5">
                  <SelectValue placeholder="Class: All">
                    {selectedClassFilter === "all"
                      ? "Class: All"
                      : classes.find(
                          (c) => String(c.class_id) === selectedClassFilter,
                        )?.class_name || "Class"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Class: All</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatusFilter}
                onValueChange={(val) => {
                  setSelectedStatusFilter(val ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-162.5">
                  <SelectValue placeholder="Status: All">
                    {selectedStatusFilter === "all"
                      ? "Status: All"
                      : selectedStatusFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Enrolled Students ({totalCount})</CardTitle>
          <CardDescription>
            Directory of all registered students and their academic allocations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Parent / Family</TableHead>
                <TableHead>Class & Section</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading students directory...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No students found matching the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {student.admission_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.student_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{student.father_parent_name}</span>
                        <span className="text-xs text-muted-foreground">
                          FAM-{String(student.family_id).padStart(4, "0")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.class_name
                        ? `${student.class_name} - ${student.section_name ?? "—"}`
                        : "—"}
                    </TableCell>
                    <TableCell>{student.roll_number ?? "—"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => router.push(`/students/${student.id}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(student)}
                        title="Edit Student"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          handleDelete(student.id, student.student_name)
                        }
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add / Register Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-162.5 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Register New Student</DialogTitle>
              <DialogDescription>
                Fill in student details and allocate them to a family, class,
                and academic session.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="admission_number">
                  Admission Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="admission_number"
                  placeholder="e.g. STD-045"
                  value={formData.admission_number}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      admission_number: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_name">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student_name"
                  placeholder="Full name"
                  value={formData.student_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, student_name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>
                  Parent / Family <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.family_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, family_id: val ?? "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent / family">
                      {familyLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={String(family.id)}>
                        {family.father_parent_name} (FAM-
                        {String(family.id).padStart(4, "0")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mother_name">Mother Name</Label>
                <Input
                  id="mother_name"
                  placeholder="Mother name"
                  value={formData.mother_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, mother_name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      date_of_birth: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, gender: val ?? "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender">
                      {formData.gender || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      class_id: val ?? "",
                      section_id: "", // Reset section when class changes
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class">
                      {classLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.class_id}
                        value={String(cls.class_id)}
                      >
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select
                  value={formData.section_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, section_id: val ?? "" }))
                  }
                  disabled={!formData.class_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section">
                      {sectionLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((sec) => (
                      <SelectItem key={sec.id} value={String(sec.id)}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roll_number">Roll Number</Label>
                <Input
                  id="roll_number"
                  placeholder="e.g. 07"
                  value={formData.roll_number}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, roll_number: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admission_date">Admission Date</Label>
                <Input
                  id="admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      admission_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="03XX-XXXXXXX"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contact: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Academic Session</Label>
                <Select
                  value={formData.academic_session_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      academic_session_id: val ?? "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session">
                      {sessionLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((sess) => (
                      <SelectItem key={sess.id} value={String(sess.id)}>
                        {sess.name} {sess.is_active ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      status: (val as StudentStatus) || "Active",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status">
                      {formData.status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Residential address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-162.5 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update information and placement for admission{" "}
                {formData.admission_number}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Admission Number</Label>
                <Input
                  value={formData.admission_number}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_student_name">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit_student_name"
                  value={formData.student_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, student_name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>
                  Parent / Family <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.family_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, family_id: val ?? "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent / family">
                      {familyLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={String(family.id)}>
                        {family.father_parent_name} (FAM-
                        {String(family.id).padStart(4, "0")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_mother_name">Mother Name</Label>
                <Input
                  id="edit_mother_name"
                  value={formData.mother_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, mother_name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      date_of_birth: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, gender: val ?? "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender">
                      {formData.gender || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      class_id: val ?? "",
                      section_id: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class">
                      {classLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.class_id}
                        value={String(cls.class_id)}
                      >
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select
                  value={formData.section_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, section_id: val ?? "" }))
                  }
                  disabled={!formData.class_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section">
                      {sectionLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((sec) => (
                      <SelectItem key={sec.id} value={String(sec.id)}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_roll_number">Roll Number</Label>
                <Input
                  id="edit_roll_number"
                  value={formData.roll_number}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, roll_number: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_admission_date">Admission Date</Label>
                <Input
                  id="edit_admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      admission_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_contact">Contact Number</Label>
                <Input
                  id="edit_contact"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contact: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Academic Session</Label>
                <Select
                  value={formData.academic_session_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      academic_session_id: val ?? "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session">
                      {sessionLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((sess) => (
                      <SelectItem key={sess.id} value={String(sess.id)}>
                        {sess.name} {sess.is_active ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData((p) => ({
                      ...p,
                      status: (val as StudentStatus) || "Active",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status">
                      {formData.status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
