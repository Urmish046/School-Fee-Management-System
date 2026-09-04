export type Family = {
  id: string;
  familyId: string;
  fatherName: string;
  motherName: string;
  cnic: string;
  contact: string;
  motherContact: string;
  whatsapp: string;
  email: string;
  address: string;
  emergencyContact: string;
  notes: string;
  admissionDate: string;
  scholarshipInfo: string;
  totalChildren: number;
  balance: number;
  status: "Active" | "Inactive";
  paymentStatus: "Paid" | "Partial" | "Unpaid";
};

export const mockFamilies: Family[] = [
  {
    id: "1",
    familyId: "FAM-0001",
    fatherName: "Muhammad Arshad",
    motherName: "Sadia Arshad",
    cnic: "37401-1234567-1",
    contact: "0300-1234567",
    motherContact: "0300-1234568",
    whatsapp: "0300-1234567",
    email: "arshad.family@email.com",
    address: "Street 5, Wah Cantt",
    emergencyContact: "0300-1234569",
    notes: "",
    admissionDate: "2023-03-01",
    scholarshipInfo: "",
    totalChildren: 4,
    balance: 7000,
    status: "Active",
    paymentStatus: "Unpaid",
  },
  {
    id: "2",
    familyId: "FAM-0002",
    fatherName: "Imran Khan",
    motherName: "Ayesha Imran",
    cnic: "37401-2345678-2",
    contact: "0321-9876543",
    motherContact: "0321-9876544",
    whatsapp: "0321-9876543",
    email: "imran.khan@email.com",
    address: "Model Town, Wah Cantt",
    emergencyContact: "0321-9876545",
    notes: "",
    admissionDate: "2022-08-15",
    scholarshipInfo: "",
    totalChildren: 2,
    balance: 0,
    status: "Active",
    paymentStatus: "Paid",
  },
  {
    id: "3",
    familyId: "FAM-0003",
    fatherName: "Tariq Mehmood",
    motherName: "Nadia Tariq",
    cnic: "37401-3456789-3",
    contact: "0333-4567890",
    motherContact: "0333-4567891",
    whatsapp: "0333-4567890",
    email: "tariq.mehmood@email.com",
    address: "Taxila Road",
    emergencyContact: "0333-4567892",
    notes: "Staff member — teaches Grade 6.",
    admissionDate: "2021-01-10",
    scholarshipInfo: "Staff child discount applied.",
    totalChildren: 3,
    balance: 4500,
    status: "Active",
    paymentStatus: "Partial",
  },
  {
    id: "4",
    familyId: "FAM-0004",
    fatherName: "Kamran Ali",
    motherName: "Fatima Kamran",
    cnic: "37401-4567890-4",
    contact: "0345-1122334",
    motherContact: "0345-1122335",
    whatsapp: "0345-1122334",
    email: "kamran.ali@email.com",
    address: "Askari Colony",
    emergencyContact: "0345-1122336",
    notes: "",
    admissionDate: "2020-06-20",
    scholarshipInfo: "",
    totalChildren: 1,
    balance: 2000,
    status: "Inactive",
    paymentStatus: "Unpaid",
  },
];