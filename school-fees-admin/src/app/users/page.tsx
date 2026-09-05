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
import {
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  listUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  type ApiUser,
  type ApiRole,
} from "@/lib/api/users";

const rolePermissions: Record<string, { label: string; access: boolean }[]> = {
  SUPER_ADMIN: [
    { label: "Full Database Access & Audits", access: true },
    { label: "Manage Roles & System Settings", access: true },
    { label: "Collect Fee Payments & Invoices", access: true },
    { label: "Manage Academic Sessions & Classes", access: true },
    { label: "Delete Users & Modify Staff", access: true },
  ],
  ADMIN: [
    { label: "Full Database Access & Audits", access: false },
    { label: "Manage Roles & System Settings", access: true },
    { label: "Collect Fee Payments & Invoices", access: true },
    { label: "Manage Academic Sessions & Classes", access: true },
    { label: "Delete Users & Modify Staff", access: false },
  ],
  PRINCIPAL: [
    { label: "Full Database Access & Audits", access: false },
    { label: "Manage Roles & System Settings", access: false },
    { label: "Collect Fee Payments & Invoices", access: true },
    { label: "Manage Academic Sessions & Classes", access: true },
    { label: "Delete Users & Modify Staff", access: false },
  ],
  ACCOUNTANT: [
    { label: "Full Database Access & Audits", access: false },
    { label: "Manage Roles & System Settings", access: false },
    { label: "Collect Fee Payments & Invoices", access: true },
    { label: "Manage Academic Sessions & Classes", access: false },
    { label: "Delete Users & Modify Staff", access: false },
  ],
};

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active matrix tab
  const [activeRoleKey, setActiveRoleKey] = useState("SUPER_ADMIN");

  // Add User State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    role_id: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);

  // Edit User State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role_id: "",
    is_active: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        listUsers({ page, limit: 10, search: search || undefined }),
        getRoles().catch(() => []),
      ]);

      setUsers(usersRes.data || []);
      setTotalPages(usersRes.pagination?.totalPages || 1);
      setTotalCount(usersRes.count || 0);
      setRoles(rolesRes || []);
    } catch (error) {
      toast.error("Failed to load users", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.role_id) {
      toast.error("Name, email, and role are required.");
      return;
    }

    try {
      setAdding(true);
      await createUser({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        role_id: Number(addForm.role_id),
        password: addForm.password || undefined,
      });

      toast.success("User added successfully.");
      setIsAddOpen(false);
      setAddForm({ name: "", email: "", role_id: "", password: "" });
      loadData();
    } catch (error) {
      toast.error("Failed to create user", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleOpenEdit = (user: ApiUser) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role_id: String(user.role_id),
      is_active: user.is_active,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setUpdating(true);
      await updateUser(editingId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role_id: Number(editForm.role_id),
        is_active: editForm.is_active,
      });

      toast.success("User updated successfully.");
      setIsEditOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to update user", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (user: ApiUser) => {
    if (
      !confirm(`Are you sure you want to permanently delete user ${user.name}?`)
    ) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully.");
      loadData();
    } catch (error) {
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage administrative staff accounts and their access roles.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-800 h-10 px-4 py-2 gap-2">
            <Plus className="h-4 w-4" /> Add User
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>Add Staff User</DialogTitle>
                <DialogDescription>
                  Register a new staff member and configure their security role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Ahmed Raza"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.com"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Assigned Role *</Label>
                  <Select
                    value={addForm.role_id}
                    onValueChange={(val) =>
                      setAddForm((p) => ({ ...p, role_id: val ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role">
                        {
                          roles.find((r) => String(r.id) === addForm.role_id)
                            ?.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Defaults to Password123!"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding ? "Saving..." : "Save User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user credentials and permission roles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={editForm.role_id}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, role_id: val ?? "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role">
                      {
                        roles.find((r) => String(r.id) === editForm.role_id)
                          ?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editForm.is_active ? "active" : "inactive"}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, is_active: val === "active" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({totalCount})</CardTitle>
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "default" : "destructive"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(u)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify access boundaries and capabilities assigned to each role.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.keys(rolePermissions).map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setActiveRoleKey(roleKey)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  activeRoleKey === roleKey
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {roleKey}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Feature</TableHead>
                <TableHead className="text-right">Access Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolePermissions[activeRoleKey]?.map((perm) => (
                <TableRow key={perm.label}>
                  <TableCell>{perm.label}</TableCell>
                  <TableCell className="text-right">
                    {perm.access ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                        <X className="h-4 w-4" /> Restricted
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
