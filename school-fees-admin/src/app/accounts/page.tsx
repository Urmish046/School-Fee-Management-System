"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  mockAccounts,
  mockAccountTransactions,
  getAccountBalance,
  type AccountType,
} from "@/lib/mock-accounts";
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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Landmark, Smartphone } from "lucide-react";

const typeIcon = {
  Cash: Wallet,
  Bank: Landmark,
  JazzCash: Smartphone,
  Easypaisa: Smartphone,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [selectedAccount, setSelectedAccount] = useState(mockAccounts[0].id);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Cash" as AccountType,
    accountNumber: "",
    openingBalance: "",
  });

  const totalClosing = accounts.reduce(
    (sum, acc) => sum + getAccountBalance(acc.id).closing,
    0
  );

  const selectedTxns = mockAccountTransactions.filter(
    (t) => t.accountId === selectedAccount
  );
  const selectedAccountInfo = accounts.find((a) => a.id === selectedAccount);
  const selectedBalance = getAccountBalance(selectedAccount);

  const handleAddAccount = () => {
    if (!newAccount.name.trim()) {
      toast.error("Account name is required.");
      return;
    }

    const numericOpeningBalance = Number(newAccount.openingBalance || 0);
    const accountType = newAccount.type;

    if (Number.isNaN(numericOpeningBalance)) {
      toast.error("Opening balance must be a valid number.");
      return;
    }

    const highestIdNumber = accounts.reduce((max, account) => {
      const match = account.id.match(/(\d+)$/);
      const value = match ? Number(match[1]) : 0;
      return Math.max(max, value);
    }, 0);

    const newEntry = {
      id: `ACC-${String(highestIdNumber + 1).padStart(3, "0")}`,
      name: newAccount.name.trim(),
      type: accountType,
      accountNumber:
        accountType === "Cash" ? undefined : newAccount.accountNumber.trim() || undefined,
      openingBalance: numericOpeningBalance,
    };

    setAccounts((prev) => [...prev, newEntry]);
    setSelectedAccount(newEntry.id);
    setNewAccount({
      name: "",
      type: "Cash",
      accountNumber: "",
      openingBalance: "",
    });

    toast.success("Account added successfully.");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Accounts (Cash & Bank)</h1>
          <p className="text-sm text-muted-foreground">
            Track balances across Cash, Bank, JazzCash and Easypaisa accounts.
          </p>
        </div>

        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            + Add Account
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Create a new cash, bank, or mobile wallet account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountName" className="text-right">Name</Label>
                <Input
                  id="accountName"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Meezan Bank"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountType" className="text-right">Type</Label>
                <div className="col-span-3">
                  <Select
                    value={newAccount.type}
                    onValueChange={(value) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        type: value as AccountType,
                        accountNumber: value === "Cash" ? "" : prev.accountNumber,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="JazzCash">JazzCash</SelectItem>
                      <SelectItem value="Easypaisa">Easypaisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newAccount.type !== "Cash" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountNumber" className="text-right">Number</Label>
                  <Input
                    id="accountNumber"
                    value={newAccount.accountNumber}
                    onChange={(e) =>
                      setNewAccount((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                    placeholder="e.g. 03XX-1234567"
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="openingBalance" className="text-right">Opening</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  value={newAccount.openingBalance}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, openingBalance: e.target.value }))
                  }
                  placeholder="0"
                  className="col-span-3"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <DialogClose
                onClick={handleAddAccount}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Save Account
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total across all accounts */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center mb-1">
            Total Balance Across All Accounts
          </p>
          <p className="text-3xl font-bold text-center">
            Rs. {totalClosing.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const balance = getAccountBalance(acc.id);
          const Icon = typeIcon[acc.type];
          return (
            <Card
              key={acc.id}
              onClick={() => setSelectedAccount(acc.id)}
              className={`cursor-pointer transition-colors ${
                selectedAccount === acc.id
                  ? "border-2 border-slate-900"
                  : "hover:bg-muted/50"
              }`}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {acc.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p
                  className={`text-xl font-bold ${
                    balance.closing >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  Rs. {balance.closing.toLocaleString()}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {acc.type}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Account Detail */}
      {selectedAccountInfo && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAccountInfo.name}{" "}
              {selectedAccountInfo.accountNumber && (
                <span className="text-muted-foreground font-normal text-sm">
                  ({selectedAccountInfo.accountNumber})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="border-r pr-4">
                <p className="text-muted-foreground">Opening Balance</p>
                <p className="font-bold">
                  Rs. {selectedAccountInfo.openingBalance.toLocaleString()}
                </p>
              </div>
              <div className="border-r pr-4">
                <p className="text-muted-foreground">Total Inflow</p>
                <p className="font-bold text-green-600">
                  + Rs. {selectedBalance.inflow.toLocaleString()}
                </p>
              </div>
              <div className="border-r pr-4">
                <p className="text-muted-foreground">Total Outflow</p>
                <p className="font-bold text-red-600">
                  - Rs. {selectedBalance.outflow.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Closing Balance</p>
                <p className="font-bold">
                  Rs. {selectedBalance.closing.toLocaleString()}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTxns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No transactions yet for this account.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedTxns.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>
                        <Badge variant={t.direction === "In" ? "default" : "destructive"}>
                          {t.direction === "In" ? "Inflow" : "Outflow"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          t.direction === "In" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.direction === "In" ? "+" : "-"} Rs. {t.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}