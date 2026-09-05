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
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TrendingUp, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ReceiptModal } from "@/components/ui/receipt-modal";
import {
  listPayments,
  collectInvoicePayment,
  type ApiPaymentListItem,
} from "@/lib/api/payments";
import { listInvoices, type ApiInvoice } from "@/lib/api/invoices";

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online Transfer",
  "JazzCash",
  "Easypaisa",
];

export default function IncomePage() {
  const [payments, setPayments] = useState<ApiPaymentListItem[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Collect Payment Form State
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await listPayments({
        page,
        limit: 10,
        payment_method: methodFilter !== "all" ? methodFilter : undefined,
        search: search || undefined,
      });

      setPayments(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.totalCount || 0);
    } catch (error) {
      toast.error("Failed to load payments", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnpaidInvoices = async () => {
    try {
      const res = await listInvoices({ limit: 100 });
      const payable = (res.data || []).filter(
        (inv) =>
          inv.status === "Unpaid" ||
          inv.status === "Partially Paid" ||
          inv.status === "Overdue",
      );
      setInvoices(payable);
    } catch {
      // Non-fatal if fetch fails
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, methodFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadPayments();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isCollectOpen) {
      loadUnpaidInvoices();
    }
  }, [isCollectOpen]);

  const selectedInvoice = invoices.find(
    (inv) => String(inv.id) === selectedInvoiceId,
  );
  const remainingDue = selectedInvoice
    ? Number(selectedInvoice.total_payable) -
      Number(selectedInvoice.paid_amount || 0)
    : 0;

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !amountPaid || Number(amountPaid) <= 0) {
      toast.error("Please choose a challan and specify a valid amount.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await collectInvoicePayment({
        invoice_id: Number(selectedInvoiceId),
        amount_paid: Number(amountPaid),
        payment_method: paymentMethod,
        payment_date: paymentDate,
        reference_number: refNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success("Payment recorded successfully", {
        description: res.message,
      });

      setIsCollectOpen(false);
      setSelectedInvoiceId("");
      setAmountPaid("");
      setRefNumber("");
      setNotes("");
      loadPayments();
    } catch (error) {
      toast.error("Payment failed", {
        description:
          error instanceof Error ? error.message : "Error saving transaction",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalCollectedSum = payments.reduce(
    (sum, p) => sum + (Number(p.amount_paid) || 0),
    0,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Fee Collection & Income</h1>
          <p className="text-sm text-muted-foreground">
            Track student fee payments, manual receipts, and real-time revenue
            intake.
          </p>
        </div>

        <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2 gap-2">
            <Plus className="h-4 w-4" /> Collect Payment
          </DialogTrigger>
          <DialogContent className="sm:max-w-120">
            <form onSubmit={handleCollectSubmit}>
              <DialogHeader>
                <DialogTitle>Record Fee Payment</DialogTitle>
                <DialogDescription>
                  Receive tuition or challan dues against an active family
                  invoice.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>
                    Target Challan / Invoice{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedInvoiceId}
                    onValueChange={(val) => {
                      setSelectedInvoiceId(val ?? "");
                      const inv = invoices.find((i) => String(i.id) === val);
                      if (inv) {
                        const due =
                          Number(inv.total_payable) -
                          Number(inv.paid_amount || 0);
                        setAmountPaid(String(due));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unpaid invoice">
                        {selectedInvoice
                          ? `${selectedInvoice.challan_no} - ${selectedInvoice.father_parent_name} (Due: Rs. ${remainingDue.toLocaleString()})`
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No pending unpaid challans
                        </SelectItem>
                      ) : (
                        invoices.map((inv) => {
                          const due =
                            Number(inv.total_payable) -
                            Number(inv.paid_amount || 0);
                          return (
                            <SelectItem key={inv.id} value={String(inv.id)}>
                              {inv.challan_no} - {inv.father_parent_name} (Due:
                              Rs. {due.toLocaleString()})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amountPaid">
                      Amount (PKR) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      placeholder="e.g. 5000"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(val) => setPaymentMethod(val ?? "Cash")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Method">
                          {paymentMethod}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="refNumber">Ref / Transaction #</Label>
                    <Input
                      id="refNumber"
                      placeholder="e.g. TXN-9842"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes / Memo</Label>
                  <Input
                    id="notes"
                    placeholder="Optional cashier remarks"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCollectOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm & Save Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Revenue Summary Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Page Revenue ({payments.length} Transactions)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            Rs. {totalCollectedSum.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Payments History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts & Transactions ({totalCount})</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Input
              placeholder="Search by receipt no, challan no or parent name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={methodFilter}
              onValueChange={(val) => setMethodFilter(val ?? "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by method">
                  {methodFilter === "all"
                    ? "All Payment Methods"
                    : methodFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
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
                <TableHead>Receipt No</TableHead>
                <TableHead>Challan No</TableHead>
                <TableHead>Family / Payer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Collected By</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-semibold">
                      <ReceiptModal
                        receiptNo={p.receipt_no}
                        date={new Date(p.payment_date).toLocaleDateString()}
                        amount={`Rs. ${Number(p.amount_paid).toLocaleString()}`}
                        method={p.payment_method}
                        receivedFrom={p.father_parent_name}
                        month={p.billing_month}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.challan_no}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.father_parent_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(p.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {p.received_by_user || "System"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      + Rs. {Number(p.amount_paid).toLocaleString()}
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
