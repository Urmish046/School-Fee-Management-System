import { mockFamilies } from "@/lib/mock-data";
import { mockStudentsFull } from "@/lib/mock-students-full";
import { applyConcession, mockConcessions } from "@/lib/mock-concessions";

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled" | "Waived";
export type PaymentMethod = "Cash" | "Bank" | "Online Transfer" | "JazzCash" | "Easypaisa" | "Cheque" | "Other";
export type FeePayment = { receiptNo: string; date: string; amount: number; method: PaymentMethod; reference: string; remarks: string; receivedBy: string };
export type FeeInvoice = {
  id: string; challanNo: string; familyId: string; familyName: string; phone: string; billingMonth: string; dueDate: string;
  students: { id: string; name: string; className: string; section: string; amount: number }[];
  grossFee: number; concessionAmount: number; concessionLabel?: string; previousArrears: number;
  total: number; amountPaid: number; balance: number; status: PaymentStatus; payments: FeePayment[]; createdAt: string;
};

const INVOICE_KEY = "skylarks-fee-invoices";
const SEQUENCE_KEY = "skylarks-challan-sequence";
const CHANGE_EVENT = "skylarks-fee-invoices-changed";

export function readInvoices(): FeeInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const invoices = JSON.parse(localStorage.getItem(INVOICE_KEY) ?? "[]") as FeeInvoice[];
    return invoices.map((invoice) => ({ ...invoice, payments: invoice.payments ?? [] }));
  } catch { return []; }
}

function saveInvoices(invoices: FeeInvoice[]) {
  localStorage.setItem(INVOICE_KEY, JSON.stringify(invoices));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToInvoices(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener(CHANGE_EVENT, listener); window.removeEventListener("storage", listener); };
}

function nextChallanNumber() {
  const next = Number(localStorage.getItem(SEQUENCE_KEY) ?? "0") + 1;
  localStorage.setItem(SEQUENCE_KEY, String(next));
  return `FC-2026-${String(next).padStart(6, "0")}`;
}

function arrearsFor(familyId: string, month: string, invoices: FeeInvoice[]) {
  const previous = invoices.filter((invoice) => invoice.familyId === familyId && invoice.billingMonth < month).sort((a, b) => b.billingMonth.localeCompare(a.billingMonth))[0];
  return previous?.balance ?? mockFamilies.find((family) => family.familyId === familyId)?.balance ?? 0;
}

export function generateMonthlyInvoices(month: string, dueDate: string) {
  const invoices = readInvoices();
  let created = 0;
  const families = mockFamilies.filter((family) => family.status === "Active");
  for (const family of families) {
    if (invoices.some((invoice) => invoice.familyId === family.familyId && invoice.billingMonth === month)) continue;
    const students = mockStudentsFull.filter((student) => student.familyId === family.familyId && student.status === "Active");
    if (!students.length) continue;
    const grossFee = students.reduce((sum, student) => sum + student.monthlyFee, 0);
    const concessions = mockConcessions.filter((concession) => {
      if (concession.status !== "Active") return false;
      const applies = concession.appliesTo === "Family" ? concession.targetId === family.familyId : students.some((student) => student.id === concession.targetId);
      const date = new Date(`${month}-01T00:00:00`);
      return applies && (!concession.startDate || date >= new Date(`${concession.startDate}T00:00:00`)) && (!concession.endDate || date <= new Date(`${concession.endDate}T23:59:59`));
    });
    const concessionAmount = concessions.reduce((sum, concession) => {
      const base = concession.appliesTo === "Family" ? grossFee : students.find((student) => student.id === concession.targetId)?.monthlyFee ?? 0;
      return sum + base - applyConcession(base, concession);
    }, 0);
    const previousArrears = arrearsFor(family.familyId, month, invoices);
    const total = Math.max(0, grossFee - concessionAmount + previousArrears);
    invoices.push({
      id: `INV-${month.replace("-", "")}-${family.familyId}`, challanNo: nextChallanNumber(), familyId: family.familyId, familyName: family.fatherName, phone: family.contact,
      billingMonth: month, dueDate, students: students.map((student) => ({ id: student.id, name: student.name, className: student.className, section: student.section, amount: student.monthlyFee })),
      grossFee, concessionAmount, concessionLabel: concessions[0]?.reason, previousArrears, total, amountPaid: 0, balance: total, status: "Unpaid", payments: [], createdAt: new Date().toISOString(),
    });
    created++;
  }
  if (created) saveInvoices(invoices);
  return { invoices, created };
}

export function recordPayment(invoiceId: string, payment: Omit<FeePayment, "receiptNo">) {
  const invoices = readInvoices();
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice || payment.amount <= 0 || payment.amount > invoice.balance) return false;
  const receiptNo = `REC-${String(Date.now()).slice(-8)}`;
  invoice.amountPaid += payment.amount;
  invoice.balance = Math.max(0, invoice.total - invoice.amountPaid);
  invoice.status = invoice.balance ? "Partially Paid" : "Paid";
  invoice.payments.push({ ...payment, receiptNo });
  saveInvoices(invoices);
  return true;
}

export function updateInvoiceStatus(invoiceId: string, status: "Cancelled" | "Waived") {
  const invoices = readInvoices();
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice) return false;
  invoice.status = status;
  if (status === "Waived") invoice.balance = 0;
  saveInvoices(invoices);
  return true;
}

export function getInvoiceStatus(invoice: FeeInvoice): PaymentStatus {
  if (invoice.status !== "Unpaid") return invoice.status;
  return new Date(`${invoice.dueDate}T23:59:59`) < new Date() ? "Overdue" : "Unpaid";
}
