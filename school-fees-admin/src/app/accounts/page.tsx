"use client";

import { useEffect, useState } from "react";
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
import { Wallet, Landmark, Smartphone, Plus } from "lucide-react";
import {
  getAccounts,
  createAccount,
  getAccountTransactions,
  type ApiAccount,
  type ApiAccountTransaction,
  type AccountType,
} from "@/lib/api/accounts";

const typeIcon = {
  Cash: Wallet,
  Bank: Landmark,
  JazzCash: Smartphone,
  Easypaisa: Smartphone,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const [transactions, setTransactions] = useState<ApiAccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnsLoading, setTxnsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Cash" as AccountType,
    accountNumber: "",
    openingBalance: "",
  });

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load accounts", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accId: number) => {
    try {
      setTxnsLoading(true);
      const data = await getAccountTransactions(accId);
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setTxnsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadTransactions(selectedAccountId);
    }
  }, [selectedAccountId]);

  const totalClosingAcrossAll = accounts.reduce(
    (sum, acc) => sum + (Number(acc.closing_balance) || 0),
    0,
  );

  const selectedAccountInfo = accounts.find((a) => a.id === selectedAccountId);

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name.trim()) {
      toast.error("Account name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await createAccount({
        name: newAccount.name.trim(),
        type: newAccount.type,
        account_number:
          newAccount.type === "Cash"
            ? undefined
            : newAccount.accountNumber.trim(),
        opening_balance: Number(newAccount.openingBalance) || 0,
      });

      toast.success("Account created successfully.");
      setIsAddOpen(false);
      setNewAccount({
        name: "",
        type: "Cash",
        accountNumber: "",
        openingBalance: "",
      });

      await loadAccounts();
      setSelectedAccountId(created.id);
    } catch (error) {
      toast.error("Failed to create account", {
        description:
          error instanceof Error ? error.message : "Error creating record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Accounts (Cash & Bank)</h1>
          <p className="text-sm text-muted-foreground">
            Track real-time balances across Cash, Bank, JazzCash, and Easypaisa
            accounts.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2 gap-2">
            <Plus className="h-4 w-4" /> Add Account
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddAccountSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Create a new cash vault, bank account, or mobile wallet.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="accountName">
                    Account Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountName"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Meezan Bank Main"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Account Type</Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(val) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        type: (val as AccountType) || "Cash",
                        accountNumber: val === "Cash" ? "" : prev.accountNumber,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type">
                        {newAccount.type}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash Vault</SelectItem>
                      <SelectItem value="Bank">Bank Account</SelectItem>
                      <SelectItem value="JazzCash">JazzCash Wallet</SelectItem>
                      <SelectItem value="Easypaisa">
                        Easypaisa Wallet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAccount.type !== "Cash" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="accountNumber">
                      Account / IBAN / Phone Number
                    </Label>
                    <Input
                      id="accountNumber"
                      value={newAccount.accountNumber}
                      onChange={(e) =>
                        setNewAccount((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="e.g. 0300-1234567"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="openingBalance">Opening Balance (PKR)</Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    value={newAccount.openingBalance}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        openingBalance: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Account"}
                </Button>
              </DialogFooter>
            </form>
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
            Rs. {totalClosingAcrossAll.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-4 text-center py-6">
            Loading accounts...
          </p>
        ) : accounts.length === 0 ? (
          <p className="text-muted-foreground col-span-4 text-center py-6">
            No accounts configured yet.
          </p>
        ) : (
          accounts.map((acc) => {
            const closing = Number(acc.closing_balance) || 0;
            const Icon = typeIcon[acc.type] || Wallet;
            return (
              <Card
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`cursor-pointer transition-all ${
                  selectedAccountId === acc.id
                    ? "border-2 border-slate-900 shadow-sm"
                    : "hover:bg-muted/50"
                }`}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                    {acc.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-xl font-bold ${
                      closing >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    Rs. {closing.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {acc.type}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Selected Account Ledger Detail */}
      {selectedAccountInfo && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAccountInfo.name}{" "}
              {selectedAccountInfo.account_number && (
                <span className="text-muted-foreground font-normal text-sm">
                  ({selectedAccountInfo.account_number})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-muted/20 p-4 rounded-lg">
              <div>
                <p className="text-muted-foreground text-xs">Opening Balance</p>
                <p className="font-bold text-base">
                  Rs.{" "}
                  {Number(selectedAccountInfo.opening_balance).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Inflow</p>
                <p className="font-bold text-base text-green-600">
                  + Rs.{" "}
                  {Number(
                    selectedAccountInfo.total_inflow || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Outflow</p>
                <p className="font-bold text-base text-red-600">
                  - Rs.{" "}
                  {Number(
                    selectedAccountInfo.total_outflow || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Closing Balance</p>
                <p className="font-bold text-base">
                  Rs.{" "}
                  {Number(
                    selectedAccountInfo.closing_balance || 0,
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category / Ref</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txnsLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      Loading account transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      No transactions recorded yet for this account.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">
                            {t.category}
                          </span>
                          {t.reference_id && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {t.reference_id}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{t.description || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.type === "INFLOW" ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {t.type === "INFLOW" ? "Inflow" : "Outflow"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          t.type === "INFLOW"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.type === "INFLOW" ? "+" : "-"} Rs.{" "}
                        {Number(t.amount).toLocaleString()}
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
