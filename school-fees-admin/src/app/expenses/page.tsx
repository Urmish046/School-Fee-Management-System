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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type ApiExpense,
  type CreateExpensePayload,
} from "@/lib/api/expenses";
import { getAccounts, type ApiAccount } from "@/lib/api/accounts";

const CATEGORIES = [
  "Utilities",
  "Supplies",
  "Maintenance",
  "Salaries",
  "Printing & Stationery",
  "Refreshments",
  "Rent",
  "Others",
];

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "JazzCash",
  "Easypaisa",
  "Cheque",
];

const initialForm: CreateExpensePayload = {
  title: "",
  category: "Utilities",
  amount: 0,
  payment_method: "Cash",
  paid_to: "",
  reference_no: "",
  expense_date: new Date().toISOString().split("T")[0],
  remarks: "",
  account_id: undefined,
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [totalExpensesSum, setTotalExpensesSum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<CreateExpensePayload>(initialForm);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CreateExpensePayload>(initialForm);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await listExpenses({
        page,
        limit: 10,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: search || undefined,
      });

      setExpenses(res.data || []);
      setTotalExpensesSum(res.totalExpensesSum || 0);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load expenses", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [page, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadExpenses();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => []);
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addForm.title.trim() ||
      !addForm.amount ||
      Number(addForm.amount) <= 0
    ) {
      toast.error("Title and an amount greater than 0 are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createExpense({
        ...addForm,
        amount: Number(addForm.amount),
        title: addForm.title.trim(),
        paid_to: addForm.paid_to?.trim() || undefined,
        reference_no: addForm.reference_no?.trim() || undefined,
        remarks: addForm.remarks?.trim() || undefined,
      });

      toast.success("Expense Recorded!", {
        description:
          "The expense has been logged and debited from the account balance.",
      });

      setIsAddOpen(false);
      setAddForm(initialForm);
      loadExpenses();
    } catch (error) {
      toast.error("Failed to record expense", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (exp: ApiExpense) => {
    setEditingId(exp.id);
    setEditForm({
      title: exp.title,
      category: exp.category,
      amount: Number(exp.amount),
      payment_method: exp.payment_method,
      paid_to: exp.paid_to || "",
      reference_no: exp.reference_no || "",
      expense_date: exp.expense_date
        ? new Date(exp.expense_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      remarks: exp.remarks || "",
      account_id: exp.account_id || undefined,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingId ||
      !editForm.title.trim() ||
      !editForm.amount ||
      Number(editForm.amount) <= 0
    ) {
      toast.error("Title and a valid amount are required.");
      return;
    }

    try {
      setSubmitting(true);
      await updateExpense(editingId, {
        ...editForm,
        amount: Number(editForm.amount),
        title: editForm.title.trim(),
        paid_to: editForm.paid_to?.trim() || undefined,
        reference_no: editForm.reference_no?.trim() || undefined,
        remarks: editForm.remarks?.trim() || undefined,
      });

      toast.success("Expense Updated!", {
        description:
          "The expense and corresponding ledger record have been updated.",
      });

      setIsEditOpen(false);
      setEditingId(null);
      loadExpenses();
    } catch (error) {
      toast.error("Failed to update expense", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (exp: ApiExpense) => {
    if (
      !confirm(
        `Are you sure you want to delete "${exp.title}" (${exp.expense_no})? This will reverse the transaction in your accounts and ledger.`,
      )
    ) {
      return;
    }

    try {
      await deleteExpense(exp.id);
      toast.success("Expense Deleted", {
        description: `${exp.expense_no} removed and account balances recalculated.`,
      });
      loadExpenses();
    } catch (error) {
      toast.error("Failed to delete expense", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">School Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track operational costs, utility bills, maintenance, and staff
            payouts.
          </p>
        </div>

        {/* Add Expense Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </DialogTrigger>
          <DialogContent className="sm:max-w-120 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
                <DialogDescription>
                  Enter expenditure details. It will be debited from the chosen
                  account.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="addTitle">
                    Expense Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="addTitle"
                    placeholder="e.g. Electricity Bill - Main Campus"
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, title: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={addForm.category}
                      onValueChange={(val) =>
                        setAddForm((p) => ({ ...p, category: val ?? "Others" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category">
                          {addForm.category}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addAmount">
                      Amount (PKR) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="addAmount"
                      type="number"
                      placeholder="0"
                      value={addForm.amount || ""}
                      onChange={(e) =>
                        setAddForm((p) => ({
                          ...p,
                          amount: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Paid From Account</Label>
                    <Select
                      value={
                        addForm.account_id ? String(addForm.account_id) : ""
                      }
                      onValueChange={(val) =>
                        setAddForm((p) => ({
                          ...p,
                          account_id: val ? Number(val) : undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto (by method)">
                          {
                            accounts.find((a) => a.id === addForm.account_id)
                              ?.name
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={String(acc.id)}>
                            {acc.name} ({acc.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Payment Method</Label>
                    <Select
                      value={addForm.payment_method}
                      onValueChange={(val) =>
                        setAddForm((p) => ({
                          ...p,
                          payment_method: val ?? "Cash",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Method">
                          {addForm.payment_method}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="addPaidTo">Paid To (Vendor/Staff)</Label>
                    <Input
                      id="addPaidTo"
                      placeholder="e.g. WAPDA / Ali Stationers"
                      value={addForm.paid_to || ""}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, paid_to: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addRef">Invoice / Bill #</Label>
                    <Input
                      id="addRef"
                      placeholder="e.g. BILL-9874"
                      value={addForm.reference_no || ""}
                      onChange={(e) =>
                        setAddForm((p) => ({
                          ...p,
                          reference_no: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="addDate">Date</Label>
                    <Input
                      id="addDate"
                      type="date"
                      value={addForm.expense_date}
                      onChange={(e) =>
                        setAddForm((p) => ({
                          ...p,
                          expense_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addRemarks">Remarks / Notes</Label>
                    <Input
                      id="addRemarks"
                      placeholder="Optional remarks"
                      value={addForm.remarks || ""}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, remarks: e.target.value }))
                      }
                    />
                  </div>
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
                  {submitting ? "Saving..." : "Save Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-120 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>
                Modify the expenditure details. Changes will automatically
                synchronize with your accounts ledger.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="editTitle">
                  Expense Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editTitle"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(val) =>
                      setEditForm((p) => ({ ...p, category: val ?? "Others" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category">
                        {editForm.category}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editAmount">
                    Amount (PKR) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editAmount"
                    type="number"
                    value={editForm.amount || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        amount: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Paid From Account</Label>
                  <Select
                    value={
                      editForm.account_id ? String(editForm.account_id) : ""
                    }
                    onValueChange={(val) =>
                      setEditForm((p) => ({
                        ...p,
                        account_id: val ? Number(val) : undefined,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account">
                        {
                          accounts.find((a) => a.id === editForm.account_id)
                            ?.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.name} ({acc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <Select
                    value={editForm.payment_method}
                    onValueChange={(val) =>
                      setEditForm((p) => ({
                        ...p,
                        payment_method: val ?? "Cash",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Method">
                        {editForm.payment_method}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editPaidTo">Paid To</Label>
                  <Input
                    id="editPaidTo"
                    value={editForm.paid_to || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, paid_to: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editRef">Invoice / Bill #</Label>
                  <Input
                    id="editRef"
                    value={editForm.reference_no || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        reference_no: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editDate">Date</Label>
                  <Input
                    id="editDate"
                    type="date"
                    value={editForm.expense_date}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        expense_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editRemarks">Remarks</Label>
                  <Input
                    id="editRemarks"
                    value={editForm.remarks || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, remarks: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recorded Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rs. {Number(totalExpensesSum).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative outflows logged across all accounts.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({totalCount})</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Input
              placeholder="Search by title, expense no, vendor, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={selectedCategory}
              onValueChange={(val) => setSelectedCategory(val ?? "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category">
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Paid From</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No expense records found.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-semibold">
                      {exp.expense_no}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{exp.title}</span>
                        {exp.paid_to && (
                          <span className="text-xs text-muted-foreground">
                            To: {exp.paid_to}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exp.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {exp.account_name || exp.payment_method}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {exp.recorded_by_name || "System"}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      - Rs. {Number(exp.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(exp)}
                          title="Edit Expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteExpense(exp)}
                          title="Delete Expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t mt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
