"use client";

import { useState } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

// Dummy Data for Classes & Fees
const mockClasses = [
  { id: "CLS-01", name: "Class 1", sections: ["A", "B", "C"], tuition: 3000, computer: 0, transport: 1500 },
  { id: "CLS-02", name: "Class 2", sections: ["A", "B"], tuition: 3500, computer: 500, transport: 1500 },
  { id: "CLS-03", name: "Class 8", sections: ["A"], tuition: 5000, computer: 1000, transport: 2000 },
];

type FeeComponent = {
  id: number;
  name: string;
  amount: string;
};

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([
    { id: 1, name: "Tuition Fee", amount: "" },
    { id: 2, name: "Computer", amount: "" },
    { id: 3, name: "Transport", amount: "" },
  ]);

  const addFeeComponent = () => {
    setFeeComponents((prev) => [
      ...prev,
      { id: Date.now(), name: "", amount: "" },
    ]);
  };

  const updateFeeComponent = (id: number, field: "name" | "amount", value: string) => {
    setFeeComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, [field]: value } : component
      )
    );
  };

  const removeFeeComponent = (id: number) => {
    setFeeComponents((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((component) => component.id !== id);
    });
  };

  const handleSaveClass = () => {
    toast.success("Fee Structure Saved!", {
      description: "The class and its custom fee components have been updated.",
    });
  };

  const filteredClasses = mockClasses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Classes & Fee Structure</h1>
          <p className="text-sm text-muted-foreground">
            Define classes, sections, and their monthly fee components.
          </p>
        </div>

        {/* Add Class & Fees Dialog */}
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2">
            + Add Class & Fees
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Setup Class Fee Structure</DialogTitle>
              <DialogDescription>
                Create a new class, assign sections, and set default fee components.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              {/* Class Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="className" className="text-right">Class Name</Label>
                <Input id="className" placeholder="e.g. Class 9" className="col-span-3" />
              </div>

              {/* Sections */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sections" className="text-right">Sections</Label>
                <Input id="sections" placeholder="e.g. A, B, C" className="col-span-3" />
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-600">Fee Components (Monthly)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeeComponent}
                    className="h-8 gap-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Fee Component
                  </Button>
                </div>

                <div className="space-y-3">
                  {feeComponents.map((component, index) => (
                    <div key={component.id} className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Component {index + 1}</Label>
                        <Input
                          value={component.name}
                          onChange={(e) => updateFeeComponent(component.id, "name", e.target.value)}
                          placeholder="e.g. Exam Fee"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Amount</Label>
                        <Input
                          type="number"
                          value={component.amount}
                          onChange={(e) => updateFeeComponent(component.id, "amount", e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeeComponent(component.id)}
                        disabled={feeComponents.length === 1}
                        className="h-10 w-10 text-slate-500 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="flex justify-end">
              <DialogClose
                onClick={handleSaveClass}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Save Fee Structure
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Fee Structures</CardTitle>
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Tuition Fee</TableHead>
                <TableHead>Computer Fee</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Total Base Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => {
                const totalFee = cls.tuition + cls.computer + cls.transport;
                return (
                  <TableRow key={cls.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {cls.sections.map(sec => (
                          <Badge key={sec} variant="outline">{sec}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>Rs. {cls.tuition.toLocaleString()}</TableCell>
                    <TableCell>Rs. {cls.computer.toLocaleString()}</TableCell>
                    <TableCell>Rs. {cls.transport.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-blue-700">
                      Rs. {totalFee.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}