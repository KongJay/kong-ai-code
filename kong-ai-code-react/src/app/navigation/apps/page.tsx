"use client";

import { useState, useEffect } from "react";
import { listMyAppVoByPage } from "@/api";
import type { AppVO, AppQueryRequest } from "@/types/api";
import { message } from "@/components/ui/toast";
import { useUserStore } from "@/store";
import { AppsEmptyState, AppsGrid, AppsPageHeader, AppsSearchBar } from "@/app/components/apps";

export default function AppsPage() {
  const { loginUser } = useUserStore();
  const [apps, setApps] = useState<AppVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [queryRequest, setQueryRequest] = useState<AppQueryRequest>({
    current: 1,
    pageSize: 12,
  });

  const loadApps = async () => {
    // 我的应用必须登录才能查看
    if (!loginUser) {
      setApps([]);
      return;
    }

    setLoading(true);
    try {
      const response = await listMyAppVoByPage({
        ...queryRequest,
        appName: searchText || undefined,
      });
      if (response.code === 0) {
        setApps(response.data.records);
      } else {
        message.error(response.message || "获取应用列表失败");
      }
    } catch (error) {
      message.error("获取应用列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [queryRequest, searchText, loginUser]);

  const handleSearch = () => {
    setQueryRequest(prev => ({ ...prev, current: 1 }));
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-100">
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <AppsPageHeader />

        {/* 搜索栏 */}
        <AppsSearchBar value={searchText} onChange={setSearchText} onSearch={handleSearch} />

        {/* 应用列表 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : !loginUser ? (
          <AppsEmptyState variant="needLogin" />
        ) : apps.length === 0 ? (
          <AppsEmptyState variant="noApps" />
        ) : (
          <AppsGrid apps={apps} />
        )}
      </main>
    </div>
  );
}
