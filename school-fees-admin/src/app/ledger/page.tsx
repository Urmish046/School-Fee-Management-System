"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  getLedger,
  type LedgerSummary,
  type LedgerTransaction,
} from "@/lib/api/ledger";

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<LedgerSummary>({
    opening_balance: 0,
    total_income: 0,
    total_expense: 0,
    closing_balance: 0,
  });
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      const res = await getLedger({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search: search || undefined,
        page,
        limit: 15,
      });

      setSummary(res.summary);
      setTransactions(res.transactions || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (error) {
      toast.error("Failed to load ledger records", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, [page, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadLedgerData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Owner Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Opening balance, income, expenses, and closing balance overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none text-xs"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none text-xs"
            />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opening Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs. {Number(summary.opening_balance).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              + Rs. {Number(summary.total_income).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              - Rs. {Number(summary.total_expense).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-900">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closing Balance
            </CardTitle>
            <Wallet className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summary.closing_balance >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              Rs. {Number(summary.closing_balance).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formula Strip */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-center font-medium">
            Opening Balance (Rs.{" "}
            {Number(summary.opening_balance).toLocaleString()}) + Income (Rs.{" "}
            {Number(summary.total_income).toLocaleString()}) − Expenses (Rs.{" "}
            {Number(summary.total_expense).toLocaleString()}) ={" "}
            <span className="font-bold">
              Closing Balance: Rs.{" "}
              {Number(summary.closing_balance).toLocaleString()}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({totalCount})</CardTitle>
          <Input
            placeholder="Search by description, category, reference, or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category / Ref</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading ledger transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No transactions recorded for the selected range.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((entry) => {
                  const isInflow = entry.type === "INFLOW";
                  return (
                    <TableRow key={entry.id} className="hover:bg-muted/50">
                      <TableCell className="text-xs">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {entry.account_name}
                      </TableCell>
                      <TableCell>{entry.description || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">
                            {entry.category}
                          </span>
                          {entry.reference_id && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {entry.reference_id}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isInflow ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {isInflow ? "Inflow" : "Outflow"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          isInflow ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isInflow ? "+" : "-"} Rs.{" "}
                        {Number(entry.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
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
