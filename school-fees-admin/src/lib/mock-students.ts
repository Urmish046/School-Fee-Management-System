export type Student = {
  id: string;
  studentId: string;
  name: string;
  familyId: string;
  fatherName: string;
  className: string;
  section: string;
  monthlyFee: number;
  status: "Active" | "Inactive";
};

export const mockStudents: Student[] = [
  {
    id: "1",
    studentId: "STD-001",
    name: "Ali Arshad",
    familyId: "FAM-0001",
    fatherName: "Muhammad Arshad",
    className: "Class 5",
    section: "A",
    monthlyFee: 4000,
    status: "Active",
  },
  {
    id: "2",
    studentId: "STD-002",
    name: "Ahmed Arshad",
    familyId: "FAM-0001",
    fatherName: "Muhammad Arshad",
    className: "Class 3",
    section: "B",
    monthlyFee: 3000,
    status: "Active",
  },
  {
    id: "3",
    studentId: "STD-003",
    name: "Hina Imran",
    familyId: "FAM-0002",
    fatherName: "Imran Khan",
    className: "Class 8",
    section: "A",
    monthlyFee: 5000,
    status: "Active",
  },
  {
    id: "4",
    studentId: "STD-004",
    name: "Bilal Imran",
    familyId: "FAM-0002",
    fatherName: "Imran Khan",
    className: "Class 6",
    section: "C",
    monthlyFee: 4500,
    status: "Active",
  },
  {
    id: "5",
    studentId: "STD-005",
    name: "Zara Tariq",
    familyId: "FAM-0003",
    fatherName: "Tariq Mehmood",
    className: "Class 2",
    section: "A",
    monthlyFee: 3500,
    status: "Active",
  },
  {
    id: "6",
    studentId: "STD-006",
    name: "Usman Kamran",
    familyId: "FAM-0004",
    fatherName: "Kamran Ali",
    className: "Class 1",
    section: "B",
    monthlyFee: 3000,
    status: "Inactive",
  },
];