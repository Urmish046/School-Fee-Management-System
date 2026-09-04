export type StudentPayment = {
  id: string;
  date: string;
  receiptNo: string;
  method: string;
  month: string;
  amountPaid: number;
};

// Payment history keyed by studentId (e.g. "STD-001")
export const mockStudentPayments: Record<string, StudentPayment[]> = {
  "STD-001": [
    { id: "1", date: "10 Aug 2026", receiptNo: "REC-001", method: "Cash", month: "August 2026", amountPaid: 4000 },
    { id: "2", date: "12 Jul 2026", receiptNo: "REC-002", method: "Bank Transfer", month: "July 2026", amountPaid: 4000 },
  ],
  "STD-002": [
    { id: "1", date: "10 Aug 2026", receiptNo: "REC-001", method: "Cash", month: "August 2026", amountPaid: 3000 },
  ],
  "STD-003": [
    { id: "1", date: "05 Aug 2026", receiptNo: "REC-003", method: "JazzCash", month: "August 2026", amountPaid: 5000 },
    { id: "2", date: "04 Jul 2026", receiptNo: "REC-004", method: "JazzCash", month: "July 2026", amountPaid: 5000 },
  ],
  "STD-004": [],
};

// Extra profile details keyed by studentId (things not already in mockStudents)
export const mockStudentProfiles: Record<
  string,
  {
    admissionDate: string;
    dob: string;
    gender: string;
    bForm: string;
    motherName: string;
    rollNumber: string;
    contact: string;
    address: string;
    academicSession: string;
  }
> = {
  "STD-001": {
    admissionDate: "01 Apr 2023",
    dob: "12 Mar 2015",
    gender: "Male",
    bForm: "37405-XXXXXXX-1",
    motherName: "Sadia Arshad",
    rollNumber: "07",
    contact: "0300-1234567",
    address: "Street 5, Wah Cantt",
    academicSession: "2026-2027",
  },
  "STD-002": {
    admissionDate: "01 Apr 2023",
    dob: "20 Jun 2017",
    gender: "Male",
    bForm: "37405-XXXXXXX-2",
    motherName: "Sadia Arshad",
    rollNumber: "12",
    contact: "0300-1234567",
    address: "Street 5, Wah Cantt",
    academicSession: "2026-2027",
  },
  "STD-003": {
    admissionDate: "15 Aug 2021",
    dob: "02 Jan 2012",
    gender: "Female",
    bForm: "37405-XXXXXXX-3",
    motherName: "Ayesha Imran",
    rollNumber: "04",
    contact: "0321-9876543",
    address: "Model Town, Wah Cantt",
    academicSession: "2025-2026",
  },
  "STD-004": {
    admissionDate: "10 Jan 2024",
    dob: "18 Sep 2018",
    gender: "Male",
    bForm: "37405-XXXXXXX-4",
    motherName: "Nadia Tariq",
    rollNumber: "02",
    contact: "0333-4567890",
    address: "Taxila Road",
    academicSession: "2026-2027",
  },
};