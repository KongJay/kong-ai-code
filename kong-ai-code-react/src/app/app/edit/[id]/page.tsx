/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, ArrowLeft, Loader2 } from "lucide-react";
import { getAppVoById, updateApp } from "@/api";
import type { AppVO, AppUpdateRequest } from "@/types/api";
import { message } from "@/components/ui/toast";
import { FormShell, LabelInputContainer } from "@/components/ui/signup-form-demo";

export default function AppEditPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<AppVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    appName: "",
    appDesc: "",
  });

  useEffect(() => {
    loadApp();
  }, [appId]);

  useEffect(() => {
    if (app) {
      setFormData({
        appName: app.appName,
        appDesc: app.appDesc,
      });
    }
  }, [app]);

  const loadApp = async () => {
    try {
      const response = await getAppVoById(appId);
      if (response.code === 0) {
        setApp(response.data);
      } else {
        message.error(response.message || "获取应用信息失败");
        router.push('/apps');
      }
    } catch (error) {
      message.error("获取应用信息失败");
      router.push('/apps');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appName.trim()) {
      message.error("应用名称不能为空");
      return;
    }

    setSaving(true);
    try {
      const updateRequest: AppUpdateRequest = {
        id: appId,
        appName: formData.appName.trim(),
        appDesc: formData.appDesc.trim(),
      };

      const response = await updateApp(updateRequest);
      if (response.code === 0) {
        message.success("应用更新成功");
        // 更新本地状态
        if (app) {
          setApp({
            ...app,
            appName: formData.appName.trim(),
            appDesc: formData.appDesc.trim(),
          });
        }
      } else {
        message.error(response.message || "更新失败");
      }
    } catch (error) {
      message.error("更新失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">应用不存在</h2>
          <Button
            onClick={() => router.push("/apps")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            返回应用列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-100">
      <main className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/apps")}
              className="text-slate-300 hover:text-slate-100 hover:bg-neutral-800/60"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>

            <div className="flex items-center space-x-3">
              {app.appIcon ? (
                <img
                  src={app.appIcon}
                  alt={app.appName}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-100">编辑应用</h1>
                <p className="text-slate-400">修改应用的基本信息</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/app/chat/${app.id}`)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            开始对话
          </Button>
        </div>

        {/* 编辑表单（Aceternity FormShell 风格） */}
        <FormShell
          title="应用信息"
          description="修改应用的基本信息，这些信息将显示在应用列表中"
          onSubmit={handleSubmit}
          submitText="保存更改"
          submittingText="保存中..."
          disabled={saving}
          secondaryAction={
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/apps")}
              className="border-neutral-700 bg-transparent text-slate-200 hover:bg-neutral-800/60"
            >
              取消
            </Button>
          }
        >
          <div className="space-y-6">
            <LabelInputContainer>
              <Label htmlFor="appName" className="text-slate-200">
                应用名称 *
              </Label>
              <Input
                id="appName"
                name="appName"
                type="text"
                placeholder="请输入应用名称"
                value={formData.appName}
                onChange={handleInputChange}
                required
                className="bg-[#0d0d0d] border-neutral-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="appDesc" className="text-slate-200">
                应用描述
              </Label>
              <Textarea
                id="appDesc"
                name="appDesc"
                placeholder="请输入应用描述"
                value={formData.appDesc}
                onChange={handleInputChange}
                rows={4}
                className="bg-[#0d0d0d] border-neutral-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
              />
            </LabelInputContainer>

            {/* 只读信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/70">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-500">应用类型</Label>
                <p className="text-sm text-slate-100">
                  {app.appType === 0 ? "评分应用" : "测试应用"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-500">评分策略</Label>
                <p className="text-sm text-slate-100">
                  {app.scoringStrategy === 0 ? "自定义" : "AI评分"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-500">创建时间</Label>
                <p className="text-sm text-slate-100">
                  {new Date(app.createTime).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-500">审核状态</Label>
                <p className="text-sm text-slate-100">
                  {app.reviewStatus === 0
                    ? "审核中"
                    : app.reviewStatus === 1
                      ? "审核通过"
                      : "审核拒绝"}
                </p>
              </div>
            </div>
          </div>
        </FormShell>
      </main>
    </div>
  );
}
