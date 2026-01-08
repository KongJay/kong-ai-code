"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Code, Search, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { listAppVoByPageByAdmin, deleteAppByAdmin } from "@/api";
import type { AppVO, AppQueryRequest, DeleteRequest } from "@/types/api";
import { message } from "@/components/ui/toast";

export default function AppManagePage() {
  const [apps, setApps] = useState<AppVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryRequest, setQueryRequest] = useState<AppQueryRequest>({
    current: 1,
    pageSize: 10,
  });
  const [searchForm, setSearchForm] = useState({
    appName: "",
    reviewStatus: "",
  });

  useEffect(() => {
    loadApps();
  }, [queryRequest]);

  const loadApps = async () => {
    setLoading(true);
    try {
      const response = await listAppVoByPageByAdmin({
        ...queryRequest,
        appName: searchForm.appName,
        reviewStatus: searchForm.reviewStatus
          ? Number(searchForm.reviewStatus)
          : undefined,
      });
      if (response.code === 0) {
        setApps(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || "获取应用列表失败");
      }
    } catch (error) {
      message.error("获取应用列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setQueryRequest(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQueryRequest(prev => ({ ...prev, current: page }));
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      const request: DeleteRequest = { id: appId };
      const response = await deleteAppByAdmin(request);
      if (response.code === 0) {
        message.success("应用删除成功");
        loadApps();
      } else {
        message.error(response.message || "删除应用失败");
      }
    } catch (error) {
      message.error("删除应用失败");
    }
  };

  const getReviewStatusText = (status: number) => {
    switch (status) {
      case 0:
        return { text: "审核中", variant: "secondary" as const };
      case 1:
        return { text: "审核通过", variant: "default" as const };
      case 2:
        return { text: "审核拒绝", variant: "destructive" as const };
      default:
        return { text: "未知", variant: "outline" as const };
    }
  };

  const getAppTypeText = (type: number) => {
    return type === 0 ? "评分应用" : "测试应用";
  };

  const getScoringStrategyText = (strategy: number) => {
    return strategy === 0 ? "自定义" : "AI评分";
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            应用管理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            管理系统中的所有应用
          </p>
        </div>
      </div>

      {/* 搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>应用搜索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>应用名称</Label>
              <Input
                value={searchForm.appName}
                onChange={(e) => setSearchForm(prev => ({ ...prev, appName: e.target.value }))}
                placeholder="搜索应用名称"
              />
            </div>
            <div className="space-y-2">
              <Label>审核状态</Label>
              <Select
                value={searchForm.reviewStatus}
                onValueChange={(value) => setSearchForm(prev => ({ ...prev, reviewStatus: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="0">审核中</SelectItem>
                  <SelectItem value="1">审核通过</SelectItem>
                  <SelectItem value="2">审核拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 应用列表 */}
      <Card>
        <CardHeader>
          <CardTitle>应用列表</CardTitle>
          <CardDescription>
            共 {total} 个应用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>应用名称</TableHead>
                <TableHead>创建者</TableHead>
                <TableHead>应用类型</TableHead>
                <TableHead>评分策略</TableHead>
                <TableHead>审核状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => {
                const reviewStatus = getReviewStatusText(app.reviewStatus);
                return (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {app.appIcon ? (
                          <img
                            src={app.appIcon}
                            alt={app.appName}
                            className="w-6 h-6 rounded"
                          />
                        ) : (
                          <Code className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium">{app.appName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{app.user?.userName || '未知'}</TableCell>
                    <TableCell>{getAppTypeText(app.appType)}</TableCell>
                    <TableCell>{getScoringStrategyText(app.scoringStrategy)}</TableCell>
                    <TableCell>
                      <Badge variant={reviewStatus.variant}>
                        {reviewStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(app.createTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/app/chat/${app.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除应用 "{app.appName}" 吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteApp(app.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              显示第 {((queryRequest.current || 1) - 1) * (queryRequest.pageSize || 10) + 1} 到 {Math.min((queryRequest.current || 1) * (queryRequest.pageSize || 10), total)} 条，共 {total} 条
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange((queryRequest.current || 1) - 1)}
                disabled={(queryRequest.current || 1) <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange((queryRequest.current || 1) + 1)}
                disabled={(queryRequest.current || 1) * (queryRequest.pageSize || 10) >= total}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
