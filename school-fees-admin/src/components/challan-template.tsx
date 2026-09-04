import { Card } from "@/components/ui/card";

interface ChildBreakdown {
  name: string;
  className: string;
  amount: number;
}

interface ChallanProps {
  challanNo: string;
  family: string;
  amount: string | number;
  dueDate: string;
  children?: ChildBreakdown[];
  concessionLabel?: string;
  concessionAmount?: number;
  arrears?: number;
  paymentInstructions?: string[];
  compact?: boolean;
}

export function ChallanTemplate({
  challanNo,
  family,
  amount,
  dueDate,
  children = [],
  concessionLabel,
  concessionAmount = 0,
  arrears = 0,
  paymentInstructions = [
    "1. Fee must be paid by the 10th of every month.",
    "2. Late fee of Rs. 50/day applies after due date.",
    "3. Fees are non-refundable.",
    "Bank: HBL (Habib Bank Limited) | A/C: PK32 HABB 0000 1234 5678",
  ],
  compact = false,
}: ChallanProps) {
  const numberValue = typeof amount === "number" ? amount : Number(String(amount).replace(/[^\d.-]/g, "")) || 0;
  const numericAmount = Number.isFinite(numberValue) ? numberValue : 0;
  const formatCurrency = (value: number) => new Intl.NumberFormat("en-PK").format(value);

  return (
    <Card className={`${compact ? "p-2.5" : "p-4"} border-2 border-slate-800 w-full mb-2 break-inside-avoid`}>
      <div className={`flex justify-between items-center border-b-2 border-slate-800 ${compact ? "pb-2 mb-2" : "pb-4 mb-4"}`}>
        <div>
          <h2 className={`${compact ? "text-base" : "text-xl"} font-bold uppercase tracking-wider`}>SKYLARKS Educational System</h2>
          {!compact && <p className="text-sm text-gray-600">School Fees & Financial Management</p>}
        </div>
        <div className="text-right">
          <h3 className="font-bold">FEE CHALLAN</h3>
          {!compact && <p className="text-sm">Copy: Parent / Bank / School</p>}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-2 ${compact ? "text-[10px] mb-2" : "text-sm mb-4"}`}>
        <div>
          <p><span className="font-semibold">Challan No:</span> {challanNo}</p>
          <p><span className="font-semibold">Family:</span> {family}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Issue Date:</span> 01 Sep 2026</p>
          <p><span className="font-semibold text-red-600">Due Date:</span> {dueDate}</p>
        </div>
      </div>

      <div className={compact ? "mb-2" : "mb-4"}>
        {!compact && <p className="text-sm font-semibold mb-2">Student Fee Breakdown</p>}
        <table className={`w-full border-collapse border border-slate-300 ${compact ? "text-[10px]" : "text-sm"}`}>
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-1 text-left">Student</th>
              <th className="border border-slate-300 p-1 text-left">Class</th>
              <th className="border border-slate-300 p-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {children.length > 0 ? (
              children.map((child) => (
                <tr key={`${child.name}-${child.className}`}>
                  <td className="border border-slate-300 p-1">{child.name}</td>
                  <td className="border border-slate-300 p-1">{child.className}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatCurrency(child.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-slate-300 p-1" colSpan={3}>Monthly Tuition Fee</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <table className={`w-full border-collapse border border-slate-300 ${compact ? "text-[10px] mb-2" : "text-sm mb-4"}`}>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 p-1 text-left">Description</th>
            <th className="border border-slate-300 p-1 text-right">Rs</th>
          </tr>
        </thead>
        <tbody>
          {concessionLabel && concessionAmount > 0 && (
            <tr>
              <td className="border border-slate-300 p-1 text-green-700">{concessionLabel}</td>
              <td className="border border-slate-300 p-1 text-right text-green-700">- {formatCurrency(concessionAmount)}</td>
            </tr>
          )}
          <tr>
            <td className="border border-slate-300 p-1">Arrears</td>
            <td className="border border-slate-300 p-1 text-right">{formatCurrency(arrears)}</td>
          </tr>
          <tr className="font-bold">
            <td className="border border-slate-300 p-1 text-right">Total:</td>
            <td className="border border-slate-300 p-1 text-right">{formatCurrency(numericAmount)}</td>
          </tr>
        </tbody>
      </table>

      {!compact && (
        <div className="mt-4 mb-4 border border-slate-300 rounded-md p-3 text-xs text-slate-700">
          <p className="font-semibold mb-2">Payment Instructions</p>
          <ul className="space-y-1">
            {paymentInstructions.map((instruction) => (
              <li key={instruction}>• {instruction}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`flex justify-between items-end ${compact ? "mt-4 text-[9px]" : "mt-8 text-xs"} text-gray-500`}>
        <div className="border-t border-gray-400 w-24 text-center pt-1">Cashier</div>
        <div className="border-t border-gray-400 w-24 text-center pt-1">Bank</div>
      </div>
    </Card>
  );
}