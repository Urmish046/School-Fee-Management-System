"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";

interface ReceiptProps {
  receiptNo: string;
  date: string;
  amount: string;
  method: string;
  receivedFrom: string;
  month: string;
}

export function ReceiptModal({ receiptNo, date, amount, method, receivedFrom, month }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger className="text-blue-600 hover:underline hover:text-blue-800 font-medium transition-colors">
        {receiptNo}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] print:shadow-none print:border-0">
        
        {/* Printable Receipt Area */}
        <div className="receipt-print-area bg-white text-black p-4">
          <div className="text-center border-b-2 border-slate-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900">School Name</h2>
            <p className="text-sm text-slate-500 mt-1">Official Payment Receipt</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-semibold text-slate-900">{receiptNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-900">{date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Fee Month:</span>
              <span className="font-semibold text-slate-900">{month}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Received From:</span>
              <span className="font-semibold text-slate-900">{receivedFrom}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-slate-900">{method}</span>
            </div>
            
            <div className="flex justify-between items-center border-t-2 border-dashed border-slate-200 pt-4 mt-2">
              <span className="font-bold text-lg text-slate-900">Total Paid:</span>
              <span className="font-bold text-lg text-slate-900">{amount}</span>
            </div>
          </div>

          <div className="mt-12 flex justify-between items-end">
            <div className="border-t border-slate-800 w-32 text-center text-xs pt-2">Cashier Signature</div>
            <div className="border-t border-slate-800 w-32 text-center text-xs pt-2">School Stamp</div>
          </div>
        </div>

        {/* Print Button (Hidden during print) */}
        <div className="flex justify-end mt-4 print:hidden">
          <Button onClick={handlePrint} className="bg-slate-900 text-white hover:bg-slate-800">
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}