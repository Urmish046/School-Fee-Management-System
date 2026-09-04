"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, CheckCircle2, AlertCircle, Plus } from "lucide-react";

export default function AcademicSessionsPage() {
  const classOptions = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];
  const [sessions, setSessions] = useState(["2025-2026", "2026-2027"]);
  const [currentSession, setCurrentSession] = useState("2025-2026");
  const [targetSession, setTargetSession] = useState("2026-2027");
  const [fromClass, setFromClass] = useState("Class 4");
  const [toClass, setToClass] = useState("Class 5");
  const [isPromoted, setIsPromoted] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  const handleCurrentSessionChange = (value: string | null) => setCurrentSession(value ?? "");
  const handleTargetSessionChange = (value: string | null) => setTargetSession(value ?? "");
  const handleFromClassChange = (value: string | null) => setFromClass(value ?? "");
  const handleToClassChange = (value: string | null) => setToClass(value ?? "");

  const previewStudents = [
    { id: "STD-001", name: "Ali Arshad", currentClass: "Class 4 (Sec A)", nextClass: "Class 5 (Sec A)", status: "Eligible" },
    { id: "STD-002", name: "Ahmed Arshad", currentClass: "Class 4 (Sec A)", nextClass: "Class 5 (Sec A)", status: "Eligible" },
    { id: "STD-005", name: "Zainab Ali", currentClass: "Class 4 (Sec B)", nextClass: "Class 5 (Sec B)", status: "Eligible" },
    { id: "STD-012", name: "Bilal Ahmed", currentClass: "Class 4 (Sec A)", nextClass: "Class 5 (Sec A)", status: "Pending Dues" },
  ];

  const eligibleStudents = previewStudents.filter((student) => student.status === "Eligible");

  const handleAddSession = () => {
    const normalized = newSessionName.trim();

    if (!normalized) {
      toast.error("Session name is required.");
      return;
    }

    if (sessions.includes(normalized)) {
      toast.error("This session already exists.");
      return;
    }

    setSessions((prev) => [...prev, normalized]);
    setCurrentSession(normalized);
    setTargetSession(normalized);
    setNewSessionName("");
    toast.success("New session created.", {
      description: `${normalized} has been added to the academic session list.`,
    });
  };

  const handlePromote = () => {
    if (eligibleStudents.length === 0) {
      toast.error("No eligible students are available for promotion.");
      return;
    }

    setIsPromoted(true);
    toast.success("Bulk Promotion Successful!", {
      description: `${eligibleStudents.length} eligible students from ${fromClass} have been promoted to ${toClass} for session ${targetSession}.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Academic Sessions & Bulk Promotion</h1>
        <p className="text-sm text-muted-foreground">
          Manage academic year transitions, class promotions, and fee structure rollover.
        </p>
      </div>

      {/* Session Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Session Transition Control</CardTitle>
          <CardDescription>Select source and target classes for bulk student promotion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Current Active Session</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1">
                  <Select value={currentSession} onValueChange={handleCurrentSessionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session} value={session}>
                          {session} {session === currentSession ? "(Active)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog>
                  <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add Session
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Add New Session</DialogTitle>
                      <DialogDescription>Create a new academic year for future promotions.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="newSession">Session Name</Label>
                        <Input
                          id="newSession"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          placeholder="e.g. 2027-2028"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <DialogClose
                        onClick={handleAddSession}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
                      >
                        Save Session
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Promotion Session</Label>
              <Select value={targetSession} onValueChange={handleTargetSessionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session} {session === targetSession ? "(Incoming)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label>Promote From Class</Label>
              <Select value={fromClass} onValueChange={handleFromClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Source class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Promote To Class</Label>
              <Select value={toClass} onValueChange={handleToClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Preview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promotion Preview ({previewStudents.length} Students)</CardTitle>
            <CardDescription>Review student statuses before executing the bulk transition.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none">
              <ArrowRightLeft className="mr-2 h-4 w-4" /> 
              {isPromoted ? "Students Promoted" : "Execute Bulk Promotion"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Confirm Bulk Promotion</DialogTitle>
                <DialogDescription>
                  This will promote all eligible students from {fromClass} to {toClass} for session {targetSession}. Pending dues students will be excluded.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Eligible students</span>
                  <span className="font-medium">{eligibleStudents.length}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Pending dues students</span>
                  <span className="font-medium">{previewStudents.length - eligibleStudents.length}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2">
                  Cancel
                </DialogClose>
                <DialogClose onClick={handlePromote} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2">
                  Confirm Promotion
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Current Placement</TableHead>
                <TableHead>Target Placement</TableHead>
                <TableHead>Financial Clearance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewStudents.map((st) => (
                <TableRow key={st.id}>
                  <TableCell className="font-medium">{st.id}</TableCell>
                  <TableCell>{st.name}</TableCell>
                  <TableCell className="text-muted-foreground">{st.currentClass}</TableCell>
                  <TableCell className="font-medium text-blue-600">{st.nextClass}</TableCell>
                  <TableCell>
                    {st.status === "Eligible" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Eligible
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" /> Pending Dues
                      </Badge>
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