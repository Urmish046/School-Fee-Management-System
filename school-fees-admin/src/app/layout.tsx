import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School Fees Admin",
  description: "School Fees & Financial Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <SidebarProvider>
            {/* Yahan humne naya wrapper component laga diya hai */}
            <SidebarWrapper>
              {children}
            </SidebarWrapper>
          </SidebarProvider>
        </TooltipProvider>

        {/* Toast notifications */}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}