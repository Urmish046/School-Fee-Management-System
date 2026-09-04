"use client";

import { usePathname } from "next/navigation";
import { Users, GraduationCap, Receipt, CreditCard, LayoutDashboard, Percent, Settings } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpen, BarChart3, TrendingUp, ShieldCheck, Landmark , ArrowRightLeft} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Families", url: "/families", icon: Users },
  { title: "Classes & Fees", url: "/classes", icon: BookOpen },
  { title: "Income", url: "/income", icon: TrendingUp },
  { title: "Accounts", url: "/accounts", icon: Landmark },
  { title: "Users & Permissions", url: "/users", icon: ShieldCheck },
  { title: "Students", url: "/students", icon: GraduationCap },
  { title: "Academic Sessions", url: "/academic-sessions", icon: ArrowRightLeft },
  { title: "Fees & Challans", url: "/fees", icon: Receipt },
  { title: "Owner Ledger", url: "/ledger", icon: BookOpen },
  { title: "Expenses", url: "/expenses", icon: CreditCard },
  { title: "Concessions", url: "/concessions", icon: Percent },
  { title: "Reports Centre", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[#D1D5DB] bg-[#E5E7EB] text-[#374151] shadow-[0_14px_30px_rgba(15,23,42,0.10),0_0_0_1px_rgba(148,163,184,0.12)]">
      <SidebarContent className="bg-[#E5E7EB]">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 pb-3 pt-5 font-serif text-[15px] tracking-normal text-[#667085]">
            School Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      href={item.url}
                      className={`flex w-full items-center gap-3 rounded-none border-l-2 px-3 py-2 transition-colors duration-150 ${
                        isActive
                          ? "border-l-[#C9A35A] bg-[#F3F4F6] text-[#111827] font-medium shadow-sm"
                          : "border-l-transparent text-[#475569] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-[#C9A35A]" : "text-[#64748B]"}`}
                      />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}