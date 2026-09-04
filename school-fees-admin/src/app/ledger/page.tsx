"use client";

import { useState } from "react";
import { mockLedgerEntries, openingBalance } from "@/lib/mock-ledger";
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
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export default function LedgerPage() {
  const [search, setSearch] = useState("");

  const totalIncome = mockLedgerEntries
    .filter((e) => e.type === "Income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = mockLedgerEntries
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const closingBalance = openingBalance + totalIncome - totalExpense;

  const filteredEntries = mockLedgerEntries.filter(
    (entry) =>
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.category.toLowerCase().includes(search.toLowerCase()) ||
      entry.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Owner Ledger</h1>
        <p className="text-sm text-muted-foreground">
          Opening balance, income, expenses and closing balance overview.
        </p>
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
              Rs. {openingBalance.toLocaleString()}
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
              + Rs. {totalIncome.toLocaleString()}
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
              - Rs. {totalExpense.toLocaleString()}
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
                closingBalance >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              Rs. {closingBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formula strip */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-center font-medium">
            Opening Balance (Rs. {openingBalance.toLocaleString()}) + Income
            (Rs. {totalIncome.toLocaleString()}) − Expenses (Rs.{" "}
            {totalExpense.toLocaleString()}) ={" "}
            <span className="font-bold">
              Closing Balance: Rs. {closingBalance.toLocaleString()}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredEntries.length})</CardTitle>
          <Input
            placeholder="Search by description, category or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{entry.id}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.type === "Income" ? "default" : "destructive"}
                    >
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      entry.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {entry.type === "Income" ? "+" : "-"} Rs.{" "}
                    {entry.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}