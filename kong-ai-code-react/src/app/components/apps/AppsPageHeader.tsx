"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AppsPageHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">我的应用</h1>
        <p className="text-slate-400">管理你创建的应用，并继续与AI对话</p>
      </div>
      <Link href="/app/create">
        <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
          <Plus className="h-4 w-4" />
          创建应用
        </Button>
      </Link>
    </div>
  );
}


