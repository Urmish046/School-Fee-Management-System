export type Student = {
  id: string; // e.g. "STD-001"
  name: string;
  familyId: string; // e.g. "FAM-0001" — matches Families list
  familyName: string;
  className: string;
  section: string;
  monthlyFee: number;
  status: "Active" | "Inactive" | "Suspended";
};

export const mockStudentsFull: Student[] = [
  {
    id: "STD-001",
    name: "Ali Arshad",
    familyId: "FAM-0001",
    familyName: "Muhammad Arshad",
    className: "Class 5",
    section: "A",
    monthlyFee: 4000,
    status: "Active",
  },
  {
    id: "STD-002",
    name: "Ahmed Arshad",
    familyId: "FAM-0001",
    familyName: "Muhammad Arshad",
    className: "Class 3",
    section: "B",
    monthlyFee: 3000,
    status: "Active",
  },
  {
    id: "STD-003",
    name: "Sara Khan",
    familyId: "FAM-0002",
    familyName: "Imran Khan",
    className: "Class 8",
    section: "A",
    monthlyFee: 5000,
    status: "Active",
  },
  {
    id: "STD-004",
    name: "Bilal Mehmood",
    familyId: "FAM-0003",
    familyName: "Tariq Mehmood",
    className: "Class 1",
    section: "C",
    monthlyFee: 2000,
    status: "Suspended",
  },
];
