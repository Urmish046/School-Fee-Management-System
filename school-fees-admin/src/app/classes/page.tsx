"use client";

import { useEffect, useState } from "react";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createClass,
  deleteClass,
  listClasses,
  listFeeComponents,
  updateClass,
  type ApiClass,
  type ApiClassFee,
  type ApiFeeComponent,
  type ClassFeeInput,
} from "@/lib/api/classes";

type FeeComponent = {
  id: number;
  feeComponentId: number | null;
  name: string;
  amount: string;
};

type ClassRow = {
  id: number;
  name: string;
  sections: string[];
  fees: { feeComponentId: number; name: string; amount: number }[];
  totalFee: number;
};

type EditableClass = Omit<ClassRow, "fees"> & { fees: FeeComponent[] };

const toClassRow = (item: ApiClass): ClassRow => ({
  id: item.class_id,
  name: item.class_name,
  sections: (item.sections ?? []).map((section) => section.name),
  fees: (item.fees ?? []).map((fee) => ({
    feeComponentId: fee.fee_component_id,
    name: fee.name,
    amount: Number(fee.amount) || 0,
  })),
  totalFee: Number(item.total_base_fee) || 0,
});

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [editingClass, setEditingClass] = useState<EditableClass | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [sections, setSections] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableFeeComponents, setAvailableFeeComponents] = useState<
    ApiFeeComponent[]
  >([]);
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);

  const buildFeeRows = (
    components: ApiFeeComponent[],
    fees: ApiClassFee[] = [],
  ) => {
    const rows = components.map((component) => {
      const existing = fees.find(
        (fee) => fee.fee_component_id === component.id,
      );
      return {
        id: component.id,
        feeComponentId: component.id,
        name: component.name,
        amount: existing ? String(existing.amount) : "",
      };
    });
    const missing = fees.filter(
      (fee) =>
        !components.some((component) => component.id === fee.fee_component_id),
    );
    return [
      ...rows,
      ...missing.map((fee) => ({
        id: fee.fee_component_id,
        feeComponentId: fee.fee_component_id,
        name: fee.name,
        amount: String(fee.amount),
      })),
    ];
  };

  useEffect(() => {
    listFeeComponents()
      .then((result) => {
        const components = result.data ?? [];
        setAvailableFeeComponents(components);
        setFeeComponents(buildFeeRows(components));
      })
      .catch((error) =>
        toast.error("Unable to load fee components", {
          description:
            error instanceof Error
              ? error.message
              : "Check the fee components API.",
        }),
      );
  }, []);

  const loadClasses = async (targetPage = page, searchTerm = search) => {
    setLoading(true);
    try {
      const result = await listClasses(targetPage, 10, searchTerm);
      setClasses((result.data ?? []).map(toClassRow));
      setTotalPages(result.pagination?.totalPages ?? 1);
    } catch (error) {
      setClasses([]);
      toast.error("Unable to load classes", {
        description:
          error instanceof Error ? error.message : "Check the classes API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses(
      page,
      search,
    ); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadClasses(1, search);
    }, 350);
    return () => clearTimeout(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [search]);

  const addFeeComponent = () => {
    setFeeComponents((prev) => [
      ...prev,
      { id: Date.now(), feeComponentId: null, name: "", amount: "" },
    ]);
  };

  const updateFeeComponent = (
    id: number,
    field: "name" | "amount",
    value: string,
  ) => {
    setFeeComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, [field]: value } : component,
      ),
    );
  };

  const removeFeeComponent = (id: number) => {
    setFeeComponents((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((component) => component.id !== id);
    });
  };

  const handleSaveClass = async () => {
    if (!className.trim()) {
      toast.error("Class name is required.");
      return;
    }
    setSaving(true);
    try {
      const fees: ClassFeeInput[] = feeComponents
        .filter((component) => component.amount !== "")
        .map((component) =>
          component.feeComponentId
            ? {
                fee_component_id: component.feeComponentId,
                amount: Number(component.amount) || 0,
              }
            : {
                fee_component_name: component.name.trim(),
                amount: Number(component.amount) || 0,
              },
        );
      await createClass({
        name: className.trim(),
        academic_session_id: 1,
        sections: sections
          .split(",")
          .map((section) => section.trim())
          .filter(Boolean),
        fees: fees.filter((fee) => "fee_component_id" in fee),
      });
      toast.success("Class and fee structure created.");
      setClassName("");
      setSections("");
      await loadClasses(1, search);
    } catch (error) {
      toast.error("Failed to create class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = (classRecord: ClassRow) => {
    setEditingClass({
      ...classRecord,
      sections: [...classRecord.sections],
      fees: buildFeeRows(
        availableFeeComponents,
        classRecord.fees.map((fee) => ({
          fee_component_id: fee.feeComponentId,
          name: fee.name,
          amount: fee.amount,
        })),
      ),
    });
    setEditDialogOpen(true);
  };

  const updateEditingClass = (
    field: "name" | "sections" | "fees",
    value: string,
  ) => {
    setEditingClass((current) => {
      if (!current) return current;
      if (field === "name") return { ...current, name: value };
      if (field === "sections")
        return {
          ...current,
          sections: value
            .split(",")
            .map((section) => section.trim())
            .filter(Boolean),
        };
      return {
        ...current,
        fees: value.split(",").map((amount, index) => ({
          ...current.fees[index],
          amount: amount.trim(),
        })),
      };
    });
  };

  const handleUpdateClass = async () => {
    if (!editingClass?.name.trim()) {
      toast.error("Class name is required.");
      return;
    }
    try {
      const fees: ClassFeeInput[] = editingClass.fees
        .filter((fee) => fee.amount !== "")
        .map((fee) =>
          fee.feeComponentId
            ? {
                fee_component_id: fee.feeComponentId,
                amount: Number(fee.amount) || 0,
              }
            : {
                fee_component_name: fee.name.trim(),
                amount: Number(fee.amount) || 0,
              },
        );
      await updateClass(editingClass.id, {
        name: editingClass.name.trim(),
        sections: editingClass.sections,
        fees: fees.filter(
          (fee) => "fee_component_id" in fee || fee.fee_component_name,
        ),
      });
      setEditDialogOpen(false);
      await loadClasses(page, search);
      toast.success("Class updated");
    } catch (error) {
      toast.error("Failed to update class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDeleteClass = async (classRecord: ClassRow) => {
    if (!window.confirm(`Delete ${classRecord.name} and its fee structure?`))
      return;
    try {
      await deleteClass(classRecord.id);
      await loadClasses(page, search);
      toast.success("Class deleted");
    } catch (error) {
      toast.error("Failed to delete class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const filteredClasses = classes;

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
                Create a new class, assign sections, and set default fee
                components.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Class Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="className" className="text-right">
                  Class Name
                </Label>
                <Input
                  id="className"
                  placeholder="e.g. Class 9"
                  className="col-span-3"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                />
              </div>

              {/* Sections */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sections" className="text-right">
                  Sections
                </Label>
                <Input
                  id="sections"
                  placeholder="e.g. A, B, C"
                  className="col-span-3"
                  value={sections}
                  onChange={(event) => setSections(event.target.value)}
                />
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-600">
                    Fee Components (Monthly)
                  </h4>
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
                    <div
                      key={component.id}
                      className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">
                          Component {index + 1}
                        </Label>
                        {/*
                          FIX: this select was previously rendered with no
                          <option> children at all, so it was impossible to
                          pick or even see which fee component a row mapped
                          to. It now mirrors the Edit dialog's select.
                        */}
                        <select
                          value={component.feeComponentId ?? "__new__"}
                          onChange={(event) => {
                            if (event.target.value === "__new__") {
                              updateFeeComponent(component.id, "name", "");
                              setFeeComponents((current) =>
                                current.map((item) =>
                                  item.id === component.id
                                    ? { ...item, feeComponentId: null }
                                    : item,
                                ),
                              );
                            } else {
                              const selected = availableFeeComponents.find(
                                (item) =>
                                  item.id === Number(event.target.value),
                              );
                              setFeeComponents((current) =>
                                current.map((item) =>
                                  item.id === component.id
                                    ? {
                                        ...item,
                                        feeComponentId: Number(
                                          event.target.value,
                                        ),
                                        name: selected?.name ?? item.name,
                                      }
                                    : item,
                                ),
                              );
                            }
                          }}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                          <option value="__new__">+ Add new component</option>
                          {availableFeeComponents.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        {component.feeComponentId === null && (
                          <Input
                            value={component.name}
                            onChange={(e) =>
                              updateFeeComponent(
                                component.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="New component name"
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Amount</Label>
                        <Input
                          type="number"
                          value={component.amount}
                          onChange={(e) =>
                            updateFeeComponent(
                              component.id,
                              "amount",
                              e.target.value,
                            )
                          }
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
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                {saving ? "Saving..." : "Save Fee Structure"}
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Class Fee Structure</DialogTitle>
              <DialogDescription>
                Edit the class details and monthly fee components.
              </DialogDescription>
            </DialogHeader>
            {editingClass && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editClassName" className="text-right">
                    Class Name
                  </Label>
                  <Input
                    id="editClassName"
                    value={editingClass.name}
                    onChange={(event) =>
                      updateEditingClass("name", event.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editSections" className="text-right">
                    Sections
                  </Label>
                  <Input
                    id="editSections"
                    value={editingClass.sections.join(", ")}
                    onChange={(event) =>
                      updateEditingClass("sections", event.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                {editingClass.fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <div className="col-span-2">
                      <select
                        value={fee.feeComponentId ?? "__new__"}
                        onChange={(event) => {
                          const selected = availableFeeComponents.find(
                            (item) => item.id === Number(event.target.value),
                          );
                          setEditingClass({
                            ...editingClass,
                            fees: editingClass.fees.map((item) =>
                              item.id === fee.id
                                ? {
                                    ...item,
                                    feeComponentId:
                                      event.target.value === "__new__"
                                        ? null
                                        : Number(event.target.value),
                                    name:
                                      event.target.value === "__new__"
                                        ? ""
                                        : (selected?.name ?? item.name),
                                  }
                                : item,
                            ),
                          });
                        }}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="__new__">+ Add new component</option>
                        {availableFeeComponents.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {fee.feeComponentId === null && (
                        <Input
                          value={fee.name}
                          onChange={(event) =>
                            setEditingClass({
                              ...editingClass,
                              fees: editingClass.fees.map((item) =>
                                item.id === fee.id
                                  ? { ...item, name: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          placeholder="New component name"
                        />
                      )}
                    </div>
                    <Input
                      id={`edit-fee-${fee.id}`}
                      type="number"
                      value={fee.amount}
                      onChange={(event) =>
                        setEditingClass({
                          ...editingClass,
                          fees: editingClass.fees.map((item) =>
                            item.id === fee.id
                              ? { ...item, amount: event.target.value }
                              : item,
                          ),
                        })
                      }
                      className="col-span-2"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleUpdateClass}>Update Class</Button>
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
                <TableHead>Fee Components</TableHead>
                <TableHead>Total Base Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading classes...
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No classes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => {
                  const totalFee = cls.totalFee;
                  return (
                    <TableRow key={cls.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {cls.sections.map((sec) => (
                            <Badge key={sec} variant="outline">
                              {sec}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {cls.fees.length
                            ? cls.fees.map((fee) => (
                                <div key={fee.feeComponentId}>
                                  {fee.name}: Rs. {fee.amount.toLocaleString()}
                                </div>
                              ))
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-700">
                        Rs. {totalFee.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClass(cls)}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClass(cls)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
