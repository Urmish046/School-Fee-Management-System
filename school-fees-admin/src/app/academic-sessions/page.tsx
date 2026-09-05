"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Check, ArrowRightLeft } from "lucide-react";
import {
  AcademicSession,
  AcademicClass,
  getAcademicSessions,
  createAcademicSession,
  updateAcademicSession,
  getAcademicClasses,
  executePromotion,
} from "@/lib/api/academic-sessions";

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [targetSessionId, setTargetSessionId] = useState<string>("");
  const [fromClassId, setFromClassId] = useState<string>("");
  const [toClassId, setToClassId] = useState<string>("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);

  const [newSessionName, setNewSessionName] = useState("");
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(
    null,
  );
  const [editSessionName, setEditSessionName] = useState("");

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [sessionsData, classesData] = await Promise.all([
        getAcademicSessions(),
        getAcademicClasses(),
      ]);

      setSessions(sessionsData);
      setClasses(classesData);

      const activeSession = sessionsData.find((s) => s.is_active);
      if (activeSession) {
        setCurrentSessionId(String(activeSession.id));
      } else if (sessionsData.length > 0) {
        setCurrentSessionId(String(sessionsData[0].id));
      }

      if (sessionsData.length > 0) {
        setTargetSessionId(String(sessionsData[0].id));
      }

      if (classesData.length > 0) {
        setFromClassId(String(classesData[0].class_id));
        if (classesData.length > 1) {
          setToClassId(String(classesData[1].class_id));
        } else {
          setToClassId(String(classesData[0].class_id));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load academic data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAddSession = async () => {
    const trimmed = newSessionName.trim();
    if (!trimmed) {
      toast.error("Session name is required.");
      return;
    }

    try {
      const newSession = await createAcademicSession(trimmed);
      setSessions((prev) => [newSession, ...prev]);
      setNewSessionName("");
      setIsAddDialogOpen(false);
      toast.success("Academic session created successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create session",
      );
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    const trimmed = editSessionName.trim();
    if (!trimmed) {
      toast.error("Session name is required.");
      return;
    }

    try {
      const updated = await updateAcademicSession(editingSession.id, {
        name: trimmed,
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      setIsEditDialogOpen(false);
      setEditingSession(null);
      toast.success("Session updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update session",
      );
    }
  };

  const handleToggleStatus = async (session: AcademicSession) => {
    try {
      const nextStatus = !session.is_active;
      const updated = await updateAcademicSession(session.id, {
        is_active: nextStatus,
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      toast.success(`Session marked as ${nextStatus ? "Active" : "Inactive"}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle status",
      );
    }
  };

  const handleExecutePromotion = async () => {
    if (!fromClassId || !toClassId || !currentSessionId || !targetSessionId) {
      toast.error("Please ensure all source and target fields are selected.");
      return;
    }

    if (fromClassId === toClassId && currentSessionId === targetSessionId) {
      toast.error("Source and target cannot be the same class and session.");
      return;
    }

    try {
      setPromoting(true);
      const res = await executePromotion({
        from_class_id: Number(fromClassId),
        to_class_id: Number(toClassId),
        from_session_id: Number(currentSessionId),
        to_session_id: Number(targetSessionId),
      });

      toast.success(res.message || "Students promoted successfully!");
      setIsPromoteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to promote students",
      );
    } finally {
      setPromoting(false);
    }
  };

  const currentSessionLabel =
    sessions.find((s) => String(s.id) === currentSessionId)?.name ||
    "Select active session";
  const targetSessionLabel =
    sessions.find((s) => String(s.id) === targetSessionId)?.name ||
    "Select target session";
  const fromClassLabel =
    classes.find((c) => String(c.class_id) === fromClassId)?.class_name ||
    "Select source class";
  const toClassLabel =
    classes.find((c) => String(c.class_id) === toClassId)?.class_name ||
    "Select target class";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Academic Sessions & Bulk Promotion
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage academic sessions, configure active periods, and execute
          student class rollovers.
        </p>
      </div>

      {/* Configured Academic Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Configured Academic Sessions</CardTitle>
            <CardDescription>
              All academic years stored in the database.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-9 px-3">
              <Plus className="h-4 w-4" /> Add Session
            </DialogTrigger>
            <DialogContent className="sm:max-w-105">
              <DialogHeader>
                <DialogTitle>Add Academic Session</DialogTitle>
                <DialogDescription>
                  Define a new academic period (e.g., 2026-2027).
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label htmlFor="session_name">Session Name</Label>
                <Input
                  id="session_name"
                  placeholder="2026-2027"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSession}>Create Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Session Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {loading
                      ? "Loading sessions..."
                      : "No academic sessions found."}
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs">
                      #{session.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={session.is_active ? "default" : "secondary"}
                      >
                        {session.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(session)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {session.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSession(session);
                          setEditSessionName(session.name);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session Transition Control */}
      <Card>
        <CardHeader>
          <CardTitle>Session Transition Control</CardTitle>
          <CardDescription>
            Select source and target classes for bulk student promotion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Source Academic Session</Label>
              <Select
                value={currentSessionId}
                onValueChange={(val) => setCurrentSessionId(val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select active session">
                    {currentSessionLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} {s.is_active ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Promotion Session</Label>
              <Select
                value={targetSessionId}
                onValueChange={(val) => setTargetSessionId(val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination session">
                    {targetSessionLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Promote From Class</Label>
              <Select
                value={fromClassId}
                onValueChange={(val) => setFromClassId(val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source class">
                    {fromClassLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.class_id} value={String(c.class_id)}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Promote To Class</Label>
              <Select
                value={toClassId}
                onValueChange={(val) => setToClassId(val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Destination class">
                    {toClassLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.class_id} value={String(c.class_id)}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Dialog
              open={isPromoteDialogOpen}
              onOpenChange={setIsPromoteDialogOpen}
            >
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Execute Bulk
                Promotion
              </DialogTrigger>
              <DialogContent className="sm:max-w-105">
                <DialogHeader>
                  <DialogTitle>Confirm Bulk Promotion</DialogTitle>
                  <DialogDescription>
                    This will promote all active students from{" "}
                    <strong>{fromClassLabel}</strong> ({currentSessionLabel}) to{" "}
                    <strong>{toClassLabel}</strong> for session{" "}
                    <strong>{targetSessionLabel}</strong>.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-sm text-muted-foreground">
                  Section assignments will be reset so students can be
                  redistributed in their new class.
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPromoteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleExecutePromotion} disabled={promoting}>
                    {promoting ? "Promoting..." : "Confirm & Execute"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Edit Session Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Edit Academic Session</DialogTitle>
            <DialogDescription>Update session title</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="edit_session_name">Session Name</Label>
            <Input
              id="edit_session_name"
              value={editSessionName}
              onChange={(e) => setEditSessionName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSession}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
