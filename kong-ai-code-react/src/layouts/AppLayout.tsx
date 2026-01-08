"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/business/home";
import { Navigation, SidebarContent } from "./index";


interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
        "h-screen bg-[#0d0d0d]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarContent open={open} />
      </Sidebar>

      {/* 主内容区域 */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Navigation />

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* 全局底部 Footer */}
        <Footer />
      </main>
    </div>
  );
}
