"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { School, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Fake authentication delay
    setTimeout(() => {
      toast.success("Login Successful", { 
        description: "Welcome back to the SKYLARKS Admin Portal." 
      });
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-slate-900 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <School className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">School Admin Portal</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@skylarks.edu" 
                required 
                defaultValue="admin@skylarks.edu"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-slate-900 hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                defaultValue="password123"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground justify-center">
          Protected by role-based access control.
        </CardFooter>
      </Card>
    </div>
  );
}