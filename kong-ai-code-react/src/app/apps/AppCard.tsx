/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lens } from "@/components/ui/lens";
import { Code, Users } from "lucide-react";
import type { AppVO } from "@/types/api";

export function AppCard({ app }: { app: AppVO }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-neutral-800/70 bg-[#141414] text-slate-100 shadow-none">
      <CardHeader className="p-0">
        <Lens
          zoomFactor={1.6}
          lensSize={150}
          isStatic={false}
          ariaLabel="Zoom Area"
          lensColor="black"
        >
          <img
            src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="image placeholder"
            width={500}
            height={500}
            className="h-44 w-full object-cover"
          />
        </Lens>
      </CardHeader>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl truncate">{app.appName}</CardTitle>
            <div className="mt-1 flex items-center text-sm text-slate-500">
              <Users className="h-3 w-3 mr-1" />
              <span className="truncate">{app.user?.userName || "未知用户"}</span>
            </div>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Code className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        <CardDescription className="mt-3 text-slate-400 line-clamp-2">
          {app.appDesc || "暂无描述"}
        </CardDescription>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {app.createTime ? new Date(app.createTime).toLocaleDateString() : "-"}
        </span>
        <div className="flex space-x-2">
          <Link href={`/app/edit/${app.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-700 bg-transparent text-slate-200 hover:bg-neutral-800/60"
            >
              编辑
            </Button>
          </Link>
          <Link href={`/app/chat/${app.id}`}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              开始对话
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}


