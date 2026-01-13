"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function AppsSearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (next: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
        <Input
          placeholder="搜索应用..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-[#18181b] border-neutral-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
      <Button
        onClick={onSearch}
        variant="outline"
        className="border-neutral-700 bg-transparent text-slate-200 hover:bg-neutral-800/60"
      >
        搜索
      </Button>
    </div>
  );
}


