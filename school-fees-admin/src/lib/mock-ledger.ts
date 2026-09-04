export type LedgerEntry = {
  id: string;
  date: string;
  description: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
};

export const openingBalance = 150000;

export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: "LDG-001",
    date: "01 Aug 2026",
    description: "Fee Collection - Muhammad Arshad Family",
    type: "Income",
    category: "Tuition Fee",
    amount: 7000,
  },
  {
    id: "LDG-002",
    date: "05 Aug 2026",
    description: "Fee Collection - Tariq Mahmood Family",
    type: "Income",
    category: "Tuition Fee",
    amount: 4500,
  },
  {
    id: "LDG-003",
    date: "10 Aug 2026",
    description: "Admission Fee - New Student (STD-007)",
    type: "Income",
    category: "Admission Fee",
    amount: 15000,
  },
  {
    id: "LDG-004",
    date: "15 Aug 2026",
    description: "Repair of AC in Computer Lab",
    type: "Expense",
    category: "Maintenance",
    amount: 3000,
  },
  {
    id: "LDG-005",
    date: "20 Aug 2026",
    description: "Classroom Whiteboards & Markers",
    type: "Expense",
    category: "Supplies",
    amount: 9500,
  },
  {
    id: "LDG-006",
    date: "25 Aug 2026",
    description: "Electricity Bill - August",
    type: "Expense",
    category: "Utilities",
    amount: 25500,
  },
  {
    id: "LDG-007",
    date: "27 Aug 2026",
    description: "Staff Salaries - August",
    type: "Expense",
    category: "Salaries",
    amount: 180000,
  },
  {
    id: "LDG-008",
    date: "28 Aug 2026",
    description: "Fee Collection - Kamran Ali Family",
    type: "Income",
    category: "Tuition Fee",
    amount: 3500,
  },
];