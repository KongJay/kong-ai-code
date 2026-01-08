"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

export function AppsEmptyState({
  variant,
}: {
  variant: "needLogin" | "noApps";
}) {
  const router = useRouter();

  if (variant === "needLogin") {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-100 mb-2">请先登录</h3>
        <p className="text-slate-400 mb-4">登录后即可查看你创建的应用</p>
        <Button
          onClick={() => router.push("/user/login")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          去登录
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-100 mb-2">暂无应用</h3>
      <p className="text-slate-400 mb-4">还没有任何应用，快来创建一个吧！</p>
      <Link href="/app/create">
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          创建第一个应用
        </Button>
      </Link>
    </div>
  );
}


