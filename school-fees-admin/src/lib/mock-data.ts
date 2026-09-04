export type Family = {
  id: string;
  familyId: string;
  fatherName: string;
  motherName: string;
  contact: string;
  whatsapp: string;
  address: string;
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
    contact: "0300-1234567",
    whatsapp: "0300-1234567",
    address: "Street 5, Wah Cantt",
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
    contact: "0321-9876543",
    whatsapp: "0321-9876543",
    address: "Model Town, Wah Cantt",
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
    contact: "0333-4567890",
    whatsapp: "0333-4567890",
    address: "Taxila Road",
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
    contact: "0345-1122334",
    whatsapp: "0345-1122334",
    address: "Askari Colony",
    totalChildren: 1,
    balance: 2000,
    status: "Inactive",
    paymentStatus: "Unpaid",
  },
];