"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { addApp } from "@/api";
import type { AppAddRequest } from "@/types/api";
import { message } from "@/components/ui/toast";

export default function AppCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appName: "",
    appDesc: "",
    appIcon: "",
    appType: 0,
    scoringStrategy: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appName.trim()) {
      message.error("应用名称不能为空");
      return;
    }
    if (!formData.appDesc.trim()) {
      message.error("应用描述不能为空");
      return;
    }

    setLoading(true);
    try {
      const request: AppAddRequest = {
        initPrompt: [
          `应用名称：${formData.appName.trim()}`,
          `应用描述：${formData.appDesc.trim()}`,
          formData.appIcon.trim() ? `应用图标：${formData.appIcon.trim()}` : undefined,
          `应用类型：${formData.appType === 0 ? "评分应用" : "测试应用"}`,
          `评分策略：${formData.scoringStrategy === 0 ? "自定义" : "AI评分"}`,
        ]
          .filter(Boolean)
          .join("\n"),
      };

      const response = await addApp(request);
      if (response.code === 0) {
        message.success("应用创建成功");
        router.push(`/app/chat/${response.data}`);
      } else {
        message.error(response.message || "创建失败");
      }
    } catch (error) {
      message.error("创建失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-xs dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">AI代码</span>
          </Link>
          <div className="flex space-x-4">
            <Link href="/navigation/apps">
              <Button variant="ghost">应用列表</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/navigation/apps')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                创建应用
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                创建一个新的AI应用，开始您的代码生成之旅
              </p>
            </div>
          </div>
        </div>

        {/* 创建表单 */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
              <CardDescription>
                填写应用的基本信息，创建后即可开始与AI对话生成代码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">应用名称 *</Label>
                  <Input
                    id="appName"
                    name="appName"
                    type="text"
                    placeholder="请输入应用名称"
                    value={formData.appName}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">给您的应用起一个简洁明了的名字</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appDesc">应用描述 *</Label>
                  <Textarea
                    id="appDesc"
                    name="appDesc"
                    placeholder="请描述您的应用功能和需求..."
                    value={formData.appDesc}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500">详细描述您的应用需求，AI会根据这些信息生成相应的代码</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appIcon">应用图标</Label>
                  <Input
                    id="appIcon"
                    name="appIcon"
                    type="url"
                    placeholder="请输入图标URL（可选）"
                    value={formData.appIcon}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500">可选择性添加一个图标URL来美化您的应用</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appType">应用类型</Label>
                    <Select
                      value={formData.appType.toString()}
                      onValueChange={(value) => handleSelectChange('appType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">评分应用</SelectItem>
                        <SelectItem value="1">测试应用</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">评分应用用于生成带评分的代码，测试应用用于生成测试代码</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scoringStrategy">评分策略</Label>
                    <Select
                      value={formData.scoringStrategy.toString()}
                      onValueChange={(value) => handleSelectChange('scoringStrategy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">自定义评分</SelectItem>
                        <SelectItem value="1">AI自动评分</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">选择代码的评分方式</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/navigation/apps')}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        创建应用
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
