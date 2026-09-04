export type AccountType = "Cash" | "Bank" | "JazzCash" | "Easypaisa";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string; // for Bank/JazzCash/Easypaisa
  openingBalance: number;
};

export type AccountTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  direction: "In" | "Out";
  amount: number;
};

export const mockAccounts: Account[] = [
  {
    id: "ACC-001",
    name: "Cash in Hand",
    type: "Cash",
    openingBalance: 25000,
  },
  {
    id: "ACC-002",
    name: "HBL Main Account",
    type: "Bank",
    accountNumber: "0123-4567890-01",
    openingBalance: 100000,
  },
  {
    id: "ACC-003",
    name: "JazzCash Business",
    type: "JazzCash",
    accountNumber: "0300-1234567",
    openingBalance: 15000,
  },
  {
    id: "ACC-004",
    name: "Easypaisa Business",
    type: "Easypaisa",
    accountNumber: "0333-7654321",
    openingBalance: 10000,
  },
];

export const mockAccountTransactions: AccountTransaction[] = [
  { id: "TXN-001", accountId: "ACC-001", date: "10 Aug 2026", description: "Fee Collection - Muhammad Arshad", direction: "In", amount: 7000 },
  { id: "TXN-002", accountId: "ACC-001", date: "15 Aug 2026", description: "Repair of AC in Computer Lab", direction: "Out", amount: 3000 },
  { id: "TXN-003", accountId: "ACC-002", date: "05 Aug 2026", description: "Fee Collection - Tariq Mehmood (Bank Transfer)", direction: "In", amount: 4500 },
  { id: "TXN-004", accountId: "ACC-002", date: "27 Aug 2026", description: "Staff Salaries - August", direction: "Out", amount: 180000 },
  { id: "TXN-005", accountId: "ACC-003", date: "05 Aug 2026", description: "Fee Collection - Sara Khan (JazzCash)", direction: "In", amount: 5000 },
  { id: "TXN-006", accountId: "ACC-004", date: "20 Aug 2026", description: "Classroom Supplies Payment", direction: "Out", amount: 2000 },
];

export function getAccountBalance(accountId: string): {
  inflow: number;
  outflow: number;
  closing: number;
} {
  const account = mockAccounts.find((a) => a.id === accountId);
  const txns = mockAccountTransactions.filter((t) => t.accountId === accountId);
  const inflow = txns.filter((t) => t.direction === "In").reduce((s, t) => s + t.amount, 0);
  const outflow = txns.filter((t) => t.direction === "Out").reduce((s, t) => s + t.amount, 0);
  const closing = (account?.openingBalance || 0) + inflow - outflow;
  return { inflow, outflow, closing };
}