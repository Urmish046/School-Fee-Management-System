export type Role = "Owner" | "Principal" | "Accountant" | "Admin" | "Viewer";

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Inactive";
  lastActive: string;
};

export const mockUsers: SystemUser[] = [
  {
    id: "USR-001",
    name: "Sir Bilal",
    email: "bilal@school.com",
    role: "Owner",
    status: "Active",
    lastActive: "Today, 10:30 AM",
  },
  {
    id: "USR-002",
    name: "Dr. Nabeela Aftab",
    email: "principal@school.com",
    role: "Principal",
    status: "Active",
    lastActive: "Yesterday, 4:15 PM",
  },
  {
    id: "USR-003",
    name: "Bilal Yousaf",
    email: "accountant@school.com",
    role: "Accountant",
    status: "Active",
    lastActive: "Today, 9:05 AM",
  },
  {
    id: "USR-004",
    name: "Biaa",
    email: "biaa@school.com",
    role: "Admin",
    status: "Active",
    lastActive: "Today, 12:00 PM",
  },
  {
    id: "USR-005",
    name: "Front Desk Viewer",
    email: "frontdesk@school.com",
    role: "Viewer",
    status: "Inactive",
    lastActive: "3 days ago",
  },
];

// What each role is allowed to do — used for the permissions matrix
export const rolePermissions: Record<
  Role,
  { label: string; access: boolean }[]
> = {
  Owner: [
    { label: "View Dashboard & Reports", access: true },
    { label: "Manage Families & Students", access: true },
    { label: "Generate Fees & Challans", access: true },
    { label: "Receive Payments", access: true },
    { label: "Manage Expenses & Income", access: true },
    { label: "View Owner Ledger", access: true },
    { label: "Manage Users & Roles", access: true },
    { label: "Give Discounts", access: true },
    { label: "Reverse Transactions", access: true },
  ],
  Principal: [
    { label: "View Dashboard & Reports", access: true },
    { label: "Manage Families & Students", access: true },
    { label: "Generate Fees & Challans", access: true },
    { label: "Receive Payments", access: false },
    { label: "Manage Expenses & Income", access: false },
    { label: "View Owner Ledger", access: true },
    { label: "Manage Users & Roles", access: false },
    { label: "Give Discounts", access: false },
    { label: "Reverse Transactions", access: false },
  ],
  Accountant: [
    { label: "View Dashboard & Reports", access: true },
    { label: "Manage Families & Students", access: false },
    { label: "Generate Fees & Challans", access: true },
    { label: "Receive Payments", access: true },
    { label: "Manage Expenses & Income", access: true },
    { label: "View Owner Ledger", access: true },
    { label: "Manage Users & Roles", access: false },
    { label: "Give Discounts", access: true },
    { label: "Reverse Transactions", access: false },
  ],
  Admin: [
    { label: "View Dashboard & Reports", access: true },
    { label: "Manage Families & Students", access: true },
    { label: "Generate Fees & Challans", access: true },
    { label: "Receive Payments", access: true },
    { label: "Manage Expenses & Income", access: false },
    { label: "View Owner Ledger", access: false },
    { label: "Manage Users & Roles", access: false },
    { label: "Give Discounts", access: false },
    { label: "Reverse Transactions", access: false },
  ],
  Viewer: [
    { label: "View Dashboard & Reports", access: true },
    { label: "Manage Families & Students", access: false },
    { label: "Generate Fees & Challans", access: false },
    { label: "Receive Payments", access: false },
    { label: "Manage Expenses & Income", access: false },
    { label: "View Owner Ledger", access: false },
    { label: "Manage Users & Roles", access: false },
    { label: "Give Discounts", access: false },
    { label: "Reverse Transactions", access: false },
  ],
};