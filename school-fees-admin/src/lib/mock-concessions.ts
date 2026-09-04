export type Concession = {
  id: string;
  recordType: "Concession" | "Scholarship";
  appliesTo: "Family" | "Student";
  targetName: string;
  targetId: string;
  type: "Fixed" | "Percentage";
  value: number; // amount in Rs if Fixed, percent (0-100) if Percentage
  reason: string;
  status: "Active" | "Inactive";
  scholarshipName?: string;
  startDate?: string;
  endDate?: string;
  approval?: "Approved" | "Pending" | "Rejected";
  remarks?: string;
};

export const mockConcessions: Concession[] = [
  {
    id: "CON-001",
    recordType: "Concession",
    appliesTo: "Family",
    targetName: "Muhammad Arshad",
    targetId: "FAM-0001",
    type: "Percentage",
    value: 10,
    reason: "Sibling Discount (2+ children)",
    status: "Active",
  },
  {
    id: "CON-002",
    recordType: "Concession",
    appliesTo: "Student",
    targetName: "Sara Khan",
    targetId: "STD-003",
    type: "Fixed",
    value: 1000,
    reason: "Merit Scholarship",
    status: "Active",
  },
  {
    id: "CON-003",
    recordType: "Concession",
    appliesTo: "Family",
    targetName: "Tariq Mahmood",
    targetId: "FAM-0003",
    type: "Percentage",
    value: 15,
    reason: "Staff Child Discount",
    status: "Active",
  },
  {
    id: "CON-004",
    recordType: "Concession",
    appliesTo: "Student",
    targetName: "Bilal Mehmood",
    targetId: "STD-004",
    type: "Fixed",
    value: 500,
    reason: "Financial Hardship",
    status: "Inactive",
  },
];

// Helper: calculates the discounted fee given a base fee and a concession
export function applyConcession(baseFee: number, concession: Concession): number {
  if (concession.type === "Percentage") {
    return baseFee - (baseFee * concession.value) / 100;
  }
  return Math.max(0, baseFee - concession.value);
}