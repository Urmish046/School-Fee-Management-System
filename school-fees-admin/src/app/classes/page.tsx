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
  DialogFooter,
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

/* =========================================================
   TYPES
========================================================= */

type FeeComponent = {
  id: number;
  feeComponentId: number;
  name: string;
  amount: string;
};

type ClassRow = {
  id: number;
  name: string;
  sections: string[];
  fees: {
    feeComponentId: number;
    name: string;
    amount: number;
  }[];
  totalFee: number;
};

type EditableClass = Omit<ClassRow, "fees"> & {
  fees: FeeComponent[];
};

/* =========================================================
   API CLASS -> FRONTEND CLASS
========================================================= */

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

/* =========================================================
   PAGE
========================================================= */

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [editingClass, setEditingClass] = useState<EditableClass | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

  /* =======================================================
     BUILD FEE ROWS
  ======================================================= */

  const buildFeeRows = (
    components: ApiFeeComponent[],
    fees: ApiClassFee[] = [],
  ): FeeComponent[] => {
    return components.map((component) => {
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
  };

  /* =======================================================
     LOAD FEE COMPONENTS
  ======================================================= */

  useEffect(() => {
    const loadFeeComponents = async () => {
      try {
        const result = await listFeeComponents();
        const components = result.data ?? [];
        setAvailableFeeComponents(components);
        setFeeComponents(buildFeeRows(components));
      } catch (error) {
        toast.error("Unable to load fee components", {
          description:
            error instanceof Error
              ? error.message
              : "Check the fee components API.",
        });
      }
    };

    loadFeeComponents();
  }, []);

  /* =======================================================
     LOAD CLASSES
  ======================================================= */

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
    loadClasses(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadClasses(1, search);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* =======================================================
     FEE COMPONENT ACTIONS
  ======================================================= */

  const addFeeComponent = () => {
    if (availableFeeComponents.length === 0) {
      toast.error("No fee components available.");
      return;
    }

    const usedIds = feeComponents.map((component) => component.feeComponentId);
    const unusedComponent = availableFeeComponents.find(
      (component) => !usedIds.includes(component.id),
    );

    if (!unusedComponent) {
      toast.error("All fee components are already added.");
      return;
    }

    setFeeComponents((prev) => [
      ...prev,
      {
        id: unusedComponent.id,
        feeComponentId: unusedComponent.id,
        name: unusedComponent.name,
        amount: "",
      },
    ]);
  };

  const updateFeeComponent = (
    id: number,
    field: "feeComponentId" | "amount",
    value: string,
  ) => {
    setFeeComponents((prev) =>
      prev.map((component) => {
        if (component.id !== id) return component;

        if (field === "feeComponentId") {
          const selected = availableFeeComponents.find(
            (item) => item.id === Number(value),
          );
          if (!selected) return component;

          return {
            ...component,
            feeComponentId: selected.id,
            name: selected.name,
          };
        }

        return {
          ...component,
          amount: value,
        };
      }),
    );
  };

  const removeFeeComponent = (id: number) => {
    setFeeComponents((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((component) => component.id !== id);
    });
  };

  /* =======================================================
     CREATE CLASS
  ======================================================= */

  const handleOpenCreate = () => {
    setClassName("");
    setSections("");
    setFeeComponents(buildFeeRows(availableFeeComponents));
    setCreateDialogOpen(true);
  };

  const handleSaveClass = async () => {
    if (!className.trim()) {
      toast.error("Class name is required.");
      return;
    }

    try {
      setSaving(true);
      const fees: ClassFeeInput[] = feeComponents
        .filter(
          (component) =>
            component.amount !== "" &&
            component.feeComponentId !== null &&
            component.feeComponentId !== undefined,
        )
        .map((component) => ({
          fee_component_id: Number(component.feeComponentId),
          amount: Number(component.amount) || 0,
        }));

      await createClass({
        name: className.trim(),
        academic_session_id: 1,
        sections: sections
          .split(",")
          .map((section) => section.trim())
          .filter(Boolean),
        fees,
      });

      toast.success("Class and fee structure created.");
      setCreateDialogOpen(false);
      setClassName("");
      setSections("");
      setFeeComponents(buildFeeRows(availableFeeComponents));

      await loadClasses(1, search);
      setPage(1);
    } catch (error) {
      console.error("Create class error:", error);
      toast.error("Failed to create class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     EDIT CLASS
  ======================================================= */

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

  const updateEditingClass = (field: "name" | "sections", value: string) => {
    setEditingClass((current) => {
      if (!current) return current;

      if (field === "name") {
        return {
          ...current,
          name: value,
        };
      }

      return {
        ...current,
        sections: value
          .split(",")
          .map((section) => section.trim())
          .filter(Boolean),
      };
    });
  };

  const updateEditingFee = (
    feeId: number,
    field: "feeComponentId" | "amount",
    value: string,
  ) => {
    setEditingClass((current) => {
      if (!current) return current;

      return {
        ...current,
        fees: current.fees.map((fee) => {
          if (fee.id !== feeId) return fee;

          if (field === "feeComponentId") {
            const selected = availableFeeComponents.find(
              (item) => item.id === Number(value),
            );
            if (!selected) return fee;

            return {
              ...fee,
              feeComponentId: selected.id,
              name: selected.name,
            };
          }

          return {
            ...fee,
            amount: value,
          };
        }),
      };
    });
  };

  const handleUpdateClass = async () => {
    if (!editingClass?.name.trim()) {
      toast.error("Class name is required.");
      return;
    }

    try {
      setSaving(true);
      const fees: ClassFeeInput[] = editingClass.fees
        .filter(
          (fee) =>
            fee.feeComponentId !== null &&
            fee.feeComponentId !== undefined &&
            fee.amount !== "",
        )
        .map((fee) => ({
          fee_component_id: Number(fee.feeComponentId),
          amount: Number(fee.amount) || 0,
        }));

      await updateClass(editingClass.id, {
        name: editingClass.name.trim(),
        sections: editingClass.sections
          .map((section) => section.trim())
          .filter(Boolean),
        academic_session_id: 1,
        fees,
      });

      setEditDialogOpen(false);
      setEditingClass(null);
      await loadClasses(page, search);
      toast.success("Class updated successfully.");
    } catch (error) {
      console.error("Update class error:", error);
      toast.error("Failed to update class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE CLASS
  ======================================================= */

  const handleDeleteClass = async (classRecord: ClassRow) => {
    if (!window.confirm(`Delete ${classRecord.name} and its fee structure?`)) {
      return;
    }

    try {
      setSaving(true);
      await deleteClass(classRecord.id);
      await loadClasses(page, search);
      toast.success("Class deleted");
    } catch (error) {
      console.error("Delete class error:", error);
      toast.error("Failed to delete class", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const createTotalFee = feeComponents.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  const editTotalFee =
    editingClass?.fees.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) ??
    0;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Classes & Fee Structure</h1>
          <p className="text-sm text-muted-foreground">
            Define classes, sections, and their monthly fee components.
          </p>
        </div>

        {/* ADD CLASS DIALOG */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Class & Fees
          </DialogTrigger>

          <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Setup Class Fee Structure</DialogTitle>
              <DialogDescription>
                Create a new class, assign sections, and set default fee
                components.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="className">
                  Class Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="className"
                  placeholder="e.g. Class 9"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sections">Sections (comma separated)</Label>
                <Input
                  id="sections"
                  placeholder="e.g. A, B, C"
                  value={sections}
                  onChange={(event) => setSections(event.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Fee Components (Monthly)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeeComponent}
                    className="h-8 gap-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Component
                  </Button>
                </div>

                {/* SCROLLABLE LIST CONTAINER */}
                <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5 rounded-md border p-2 bg-slate-50/50">
                  {feeComponents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No fee components assigned. Click Add Component above.
                    </p>
                  ) : (
                    feeComponents.map((component, index) => (
                      <div
                        key={component.id}
                        className="grid grid-cols-[1.4fr_1fr_auto] items-end gap-2 bg-white p-2 rounded border border-slate-200"
                      >
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-500">
                            Component {index + 1}
                          </Label>
                          <select
                            value={component.feeComponentId}
                            onChange={(event) =>
                              updateFeeComponent(
                                component.id,
                                "feeComponentId",
                                event.target.value,
                              )
                            }
                            className="h-9 w-full rounded-md border bg-background px-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                          >
                            {availableFeeComponents.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-500">
                            Amount (PKR)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            className="h-9 text-xs"
                            value={component.amount}
                            onChange={(event) =>
                              updateFeeComponent(
                                component.id,
                                "amount",
                                event.target.value,
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
                          className="h-9 w-9 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100 p-2.5 text-xs font-semibold">
                  <span>Total Base Fee:</span>
                  <span className="text-sm font-bold text-blue-700">
                    Rs. {createTotalFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveClass}
                disabled={saving}
                className="bg-slate-900 text-slate-50 hover:bg-slate-800"
              >
                {saving ? "Saving..." : "Save Fee Structure"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* EDIT CLASS DIALOG */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Update Class Fee Structure</DialogTitle>
              <DialogDescription>
                Edit the class details and monthly fee components.
              </DialogDescription>
            </DialogHeader>

            {editingClass && (
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editClassName">
                    Class Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editClassName"
                    value={editingClass.name}
                    onChange={(event) =>
                      updateEditingClass("name", event.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editSections">Sections</Label>
                  <Input
                    id="editSections"
                    value={editingClass.sections.join(", ")}
                    onChange={(event) =>
                      updateEditingClass("sections", event.target.value)
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-700">
                      Fee Components (Monthly)
                    </Label>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5 rounded-md border p-2 bg-slate-50/50">
                    {editingClass.fees.map((fee, index) => (
                      <div
                        key={fee.id}
                        className="grid grid-cols-[1.4fr_1fr_auto] items-end gap-2 bg-white p-2 rounded border border-slate-200"
                      >
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-500">
                            Component {index + 1}
                          </Label>
                          <select
                            value={fee.feeComponentId}
                            onChange={(event) =>
                              updateEditingFee(
                                fee.id,
                                "feeComponentId",
                                event.target.value,
                              )
                            }
                            className="h-9 w-full rounded-md border bg-background px-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                          >
                            {availableFeeComponents.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor={`edit-fee-${fee.id}`}
                            className="text-[11px] text-slate-500"
                          >
                            Amount (PKR)
                          </Label>
                          <Input
                            id={`edit-fee-${fee.id}`}
                            type="number"
                            min="0"
                            className="h-9 text-xs"
                            value={fee.amount}
                            onChange={(event) =>
                              updateEditingFee(
                                fee.id,
                                "amount",
                                event.target.value,
                              )
                            }
                            placeholder="0"
                          />
                        </div>

                        <div className="h-9 w-9" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100 p-2.5 text-xs font-semibold">
                    <span>Total Base Fee:</span>
                    <span className="text-sm font-bold text-blue-700">
                      Rs. {editTotalFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdateClass}
                disabled={saving}
                className="bg-slate-900 text-slate-50 hover:bg-slate-800"
              >
                {saving ? "Updating..." : "Update Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* CLASSES TABLE */}
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
                <TableHead className="text-right">Actions</TableHead>
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
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No classes found.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  return (
                    <TableRow key={cls.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{cls.name}</TableCell>

                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {cls.sections.map((sec) => (
                            <Badge key={sec} variant="outline">
                              {sec}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {cls.fees.length > 0
                            ? cls.fees.map((fee) => (
                                <div key={fee.feeComponentId}>
                                  {fee.name}: Rs. {fee.amount.toLocaleString()}
                                </div>
                              ))
                            : "—"}
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-blue-700">
                        Rs. {cls.totalFee.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClass(cls)}
                            disabled={saving}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClass(cls)}
                            disabled={saving}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
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
