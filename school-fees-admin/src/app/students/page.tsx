"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { ImportModal } from "@/components/import-modal";
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
  type ApiStudentListItem,
  type StudentGender,
  type StudentPayload,
  type StudentStatus,
  type StudentUpdatePayload,
} from "@/lib/api/students";
import { listClasses, type ApiClass } from "@/lib/api/classes";
import { listFamilies } from "@/lib/api/families";
import {
  getAcademicSessions,
  type AcademicSession,
} from "@/lib/api/academic-sessions";
import type { ApiFamily } from "@/lib/family-adapters";

const STATUS_OPTIONS: StudentStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
  "Withdrawn",
  "Graduated",
];

const GENDER_OPTIONS: StudentGender[] = ["Male", "Female", "Other"];

type StudentFormState = {
  admissionNumber: string;
  studentName: string;
  familyId: string;
  motherName: string;
  dateOfBirth: string;
  gender: StudentGender | "";
  classId: string;
  sectionId: string;
  rollNumber: string;
  admissionDate: string;
  contact: string;
  address: string;
  academicSessionId: string;
  status: StudentStatus;
};

const emptyForm: StudentFormState = {
  admissionNumber: "",
  studentName: "",
  familyId: "",
  motherName: "",
  dateOfBirth: "",
  gender: "",
  classId: "",
  sectionId: "",
  rollNumber: "",
  admissionDate: "",
  contact: "",
  address: "",
  academicSessionId: "",
  status: "Active",
};

const familyLabel = (f: ApiFamily) =>
  `${f.father_parent_name} (FAM-${String(f.id).padStart(4, "0")})`;

export default function StudentsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<ApiStudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  const [families, setFamilies] = useState<ApiFamily[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<StudentFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StudentFormState>(emptyForm);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    listFamilies(1, 100)
      .then((result) => setFamilies(result.data ?? []))
      .catch((error) =>
        toast.error("Unable to load families", {
          description:
            error instanceof Error ? error.message : "Check the families API.",
        }),
      );

    listClasses(1, 100)
      .then((result) => setClasses(result.data ?? []))
      .catch((error) =>
        toast.error("Unable to load classes", {
          description:
            error instanceof Error ? error.message : "Check the classes API.",
        }),
      );

    getAcademicSessions()
      .then((sessionsData) => {
        setSessions(sessionsData || []);
        const active = sessionsData?.find((s) => s.is_active);
        if (active) {
          setAddForm((prev) => ({
            ...prev,
            academicSessionId: String(active.id),
          }));
        }
      })
      .catch(() => {
        // Non-fatal if session lookup fails
      });
  }, []);

  const loadStudents = async (targetPage = page, searchTerm = search) => {
    setLoading(true);
    try {
      const result = await listStudents({
        page: targetPage,
        limit: 10,
        search: searchTerm,
      });
      setStudents(result.data ?? []);
      setTotalPages(result.pagination?.totalPages ?? 1);
      setCount(result.count ?? 0);
    } catch (error) {
      setStudents([]);
      toast.error("Unable to load students", {
        description:
          error instanceof Error ? error.message : "Check the students API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(page, search);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadStudents(1, search);
    }, 350);
    return () => clearTimeout(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [search]);

  const sectionsForClass = (classId: string, allClasses: ApiClass[]) => {
    const match = allClasses.find((c) => String(c.class_id) === classId);
    return match?.sections ?? [];
  };

  const addSections = useMemo(
    () => sectionsForClass(addForm.classId, classes),
    [addForm.classId, classes],
  );
  const editSections = useMemo(
    () => sectionsForClass(editForm.classId, classes),
    [editForm.classId, classes],
  );

  const getFamilyDisplay = (id: string) => {
    const found = families.find((f) => String(f.id) === id);
    return found ? familyLabel(found) : undefined;
  };

  const getClassDisplay = (id: string) => {
    const found = classes.find((c) => String(c.class_id) === id);
    return found ? found.class_name : undefined;
  };

  const getSectionDisplay = (
    sectionId: string,
    sectionList: Array<{ id: number; name: string }>,
  ) => {
    const found = sectionList.find((s) => String(s.id) === sectionId);
    return found ? `Section ${found.name}` : undefined;
  };

  const getSessionDisplay = (id: string) => {
    const found = sessions.find((s) => String(s.id) === id);
    return found
      ? `${found.name} ${found.is_active ? "(Active)" : ""}`
      : undefined;
  };

  const buildPayload = (form: StudentFormState): StudentUpdatePayload => ({
    student_name: form.studentName.trim(),
    family_id: Number(form.familyId),
    mother_name: form.motherName.trim() || undefined,
    date_of_birth: form.dateOfBirth || undefined,
    gender: form.gender || undefined,
    class_id: form.classId ? Number(form.classId) : undefined,
    section_id: form.sectionId ? Number(form.sectionId) : undefined,
    roll_number: form.rollNumber.trim() || undefined,
    admission_date: form.admissionDate || undefined,
    contact: form.contact.trim() || undefined,
    address: form.address.trim() || undefined,
    academic_session_id: form.academicSessionId
      ? Number(form.academicSessionId)
      : undefined,
    status: form.status,
  });

  const handleAddSubmit = async () => {
    if (
      !addForm.admissionNumber.trim() ||
      !addForm.studentName.trim() ||
      !addForm.familyId
    ) {
      toast.error("Admission number, student name, and family are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: StudentPayload = {
        admission_number: addForm.admissionNumber.trim(),
        ...buildPayload(addForm),
      };
      await createStudent(payload);
      toast.success("Student added.");

      const active = sessions.find((s) => s.is_active);
      setAddForm({
        ...emptyForm,
        academicSessionId: active ? String(active.id) : "",
      });
      setAddOpen(false);
      await loadStudents(1, search);
      setPage(1);
    } catch (error) {
      toast.error("Failed to add student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (student: ApiStudentListItem) => {
    setEditingId(student.id);
    setEditForm({
      admissionNumber: student.admission_number,
      studentName: student.student_name,
      familyId: String(student.family_id),
      motherName: student.mother_name ?? "",
      dateOfBirth: student.date_of_birth
        ? student.date_of_birth.slice(0, 10)
        : "",
      gender: (student.gender as StudentGender) ?? "",
      classId: student.class_id ? String(student.class_id) : "",
      sectionId: student.section_id ? String(student.section_id) : "",
      rollNumber: student.roll_number ?? "",
      admissionDate: student.admission_date
        ? student.admission_date.slice(0, 10)
        : "",
      contact: student.student_contact ?? "",
      address: student.address ?? "",
      academicSessionId: student.session_id ? String(student.session_id) : "",
      status: student.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;
    if (!editForm.studentName.trim() || !editForm.familyId) {
      toast.error("Student name and family are required.");
      return;
    }
    setUpdating(true);
    try {
      await updateStudent(editingId, buildPayload(editForm));
      toast.success("Student updated.");
      setEditOpen(false);
      await loadStudents(page, search);
    } catch (error) {
      toast.error("Failed to update student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (student: ApiStudentListItem) => {
    if (
      !window.confirm(
        `Delete ${student.student_name} (${student.admission_number})?`,
      )
    )
      return;
    try {
      await deleteStudent(student.id);
      toast.success("Student deleted.");
      await loadStudents(page, search);
    } catch (error) {
      toast.error("Failed to delete student", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage all enrolled students across classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ImportModal />

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
              + Add Student
            </DialogTrigger>
            <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details and link them to a family profile.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="admissionNumber">Admission Number</Label>
                  <Input
                    id="admissionNumber"
                    placeholder="e.g. STD-005"
                    value={addForm.admissionNumber}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        admissionNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    placeholder="Student Name"
                    value={addForm.studentName}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, studentName: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="family">Parent / Family</Label>
                  <Select
                    value={addForm.familyId}
                    onValueChange={(value) =>
                      setAddForm((f) => ({ ...f, familyId: value ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family...">
                        {getFamilyDisplay(addForm.familyId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((fam) => (
                        <SelectItem key={fam.id} value={String(fam.id)}>
                          {familyLabel(fam)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mother">Mother</Label>
                  <Input
                    id="mother"
                    placeholder="Mother name"
                    value={addForm.motherName}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, motherName: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={addForm.dateOfBirth}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={addForm.gender}
                    onValueChange={(value) =>
                      setAddForm((f) => ({
                        ...f,
                        gender: value as StudentGender,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender...">
                        {addForm.gender || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={addForm.classId}
                    onValueChange={(value) =>
                      setAddForm((f) => ({
                        ...f,
                        classId: value ?? "",
                        sectionId: "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class...">
                        {getClassDisplay(addForm.classId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.class_id} value={String(c.class_id)}>
                          {c.class_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={addForm.sectionId}
                    onValueChange={(value) =>
                      setAddForm((f) => ({ ...f, sectionId: value ?? "" }))
                    }
                    disabled={!addForm.classId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          addForm.classId
                            ? "Select section..."
                            : "Pick a class first"
                        }
                      >
                        {getSectionDisplay(addForm.sectionId, addSections)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {addSections.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          Section {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    placeholder="e.g. 07"
                    value={addForm.rollNumber}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, rollNumber: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admissionDate">Admission Date</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={addForm.admissionDate}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        admissionDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    placeholder="03XX-XXXXXXX"
                    value={addForm.contact}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, contact: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={addForm.status}
                    onValueChange={(value) =>
                      setAddForm((f) => ({
                        ...f,
                        status: value as StudentStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status...">
                        {addForm.status}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Street / Area / City"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="session">Academic Session</Label>
                  <Select
                    value={addForm.academicSessionId}
                    onValueChange={(value) =>
                      setAddForm((f) => ({
                        ...f,
                        academicSessionId: value ?? "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select session...">
                        {getSessionDisplay(addForm.academicSessionId)}
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
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Save Student"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Student</DialogTitle>
            <DialogDescription>
              Edit student details. Admission number can't be changed here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label>Admission Number</Label>
              <Input value={editForm.admissionNumber} disabled />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="editName">Student Name</Label>
              <Input
                id="editName"
                value={editForm.studentName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, studentName: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="editFamily">Parent / Family</Label>
              <Select
                value={editForm.familyId}
                onValueChange={(value) =>
                  setEditForm((f) => ({ ...f, familyId: value ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select family...">
                    {getFamilyDisplay(editForm.familyId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {families.map((fam) => (
                    <SelectItem key={fam.id} value={String(fam.id)}>
                      {familyLabel(fam)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editMother">Mother</Label>
              <Input
                id="editMother"
                value={editForm.motherName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, motherName: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editDob">Date of Birth</Label>
              <Input
                id="editDob"
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editGender">Gender</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    gender: value as StudentGender,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender...">
                    {editForm.gender || undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editClass">Class</Label>
              <Select
                value={editForm.classId}
                onValueChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    classId: value ?? "",
                    sectionId: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class...">
                    {getClassDisplay(editForm.classId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.class_id} value={String(c.class_id)}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editSection">Section</Label>
              <Select
                value={editForm.sectionId}
                onValueChange={(value) =>
                  setEditForm((f) => ({ ...f, sectionId: value ?? "" }))
                }
                disabled={!editForm.classId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      editForm.classId
                        ? "Select section..."
                        : "Pick a class first"
                    }
                  >
                    {getSectionDisplay(editForm.sectionId, editSections)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {editSections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Section {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editRoll">Roll Number</Label>
              <Input
                id="editRoll"
                value={editForm.rollNumber}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, rollNumber: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editAdmissionDate">Admission Date</Label>
              <Input
                id="editAdmissionDate"
                type="date"
                value={editForm.admissionDate}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    admissionDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editContact">Contact</Label>
              <Input
                id="editContact"
                value={editForm.contact}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, contact: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    status: value as StudentStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status...">
                    {editForm.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="editSession">Academic Session</Label>
              <Select
                value={editForm.academicSessionId}
                onValueChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    academicSessionId: value ?? "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session...">
                    {getSessionDisplay(editForm.academicSessionId)}
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
          </div>

          <div className="flex justify-end">
            <Button onClick={handleEditSubmit} disabled={updating}>
              {updating ? "Saving..." : "Update Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({count})</CardTitle>
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
                <TableHead>Admission #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Family / Parent</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow
                    key={student.id}
                    onClick={() => router.push(`/students/${student.id}`)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {student.admission_number}
                    </TableCell>
                    <TableCell>{student.student_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.father_parent_name} ({student.family_id_code})
                    </TableCell>
                    <TableCell>{student.class_name ?? "—"}</TableCell>
                    <TableCell>{student.section_name ?? "—"}</TableCell>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(student)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
