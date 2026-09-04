export type IncomeEntry = {
  id: string;
  title: string;
  category: "Admission Fee" | "Transport" | "Exam Fee" | "Fine" | "Uniform" | "Books" | "Other";
  date: string;
  receivedBy: string;
  amount: number;
};

export const mockIncomeEntries: IncomeEntry[] = [
  {
    id: "INC-001",
    title: "Admission Fee - New Student (STD-007)",
    category: "Admission Fee",
    date: "10 Aug 2026",
    receivedBy: "Admin",
    amount: 15000,
  },
  {
    id: "INC-002",
    title: "Transport Fee - August (Route 3)",
    category: "Transport",
    date: "12 Aug 2026",
    receivedBy: "Accountant",
    amount: 8000,
  },
  {
    id: "INC-003",
    title: "Mid-Term Exam Fee - Class 8",
    category: "Exam Fee",
    date: "18 Aug 2026",
    receivedBy: "Admin",
    amount: 6000,
  },
  {
    id: "INC-004",
    title: "Late Fee Fine - Multiple Families",
    category: "Fine",
    date: "22 Aug 2026",
    receivedBy: "Accountant",
    amount: 1500,
  },
  {
    id: "INC-005",
    title: "Uniform Sales - Summer Batch",
    category: "Uniform",
    date: "24 Aug 2026",
    receivedBy: "Admin",
    amount: 12000,
  },
  {
    id: "INC-006",
    title: "Book Sales - New Session",
    category: "Books",
    date: "26 Aug 2026",
    receivedBy: "Accountant",
    amount: 9500,
  },
];