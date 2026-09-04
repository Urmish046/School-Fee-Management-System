"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  // Agar login page hai, toh sidebar aur trigger hide kar do, sirf content dikhao
  if (isLogin) {
    return (
      <main className="flex-1 w-full min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(100,116,139,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.28),_transparent_32%),linear-gradient(180deg,#f4f2ee_0%,#edf2f5_100%)]">
        {children}
      </main>
    );
  }

  // Baqi tamam pages ke liye normal layout (Sidebar ke sath)
  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 w-full min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(100,116,139,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.28),_transparent_32%),linear-gradient(180deg,#f4f2ee_0%,#edf2f5_100%)]">
        <SidebarTrigger className="mb-4" />
        {children}
      </main>
    </>
  );
}