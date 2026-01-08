"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Eye, ExternalLink } from "lucide-react";
import { listAllChatHistoryByPageForAdmin } from "@/api";
import type { ChatHistory, ChatHistoryQueryRequest } from "@/types/api";
import { message } from "@/components/ui/toast";

export default function ChatManagePage() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryRequest, setQueryRequest] = useState<ChatHistoryQueryRequest>({
    current: 1,
    pageSize: 10,
  });
  const [searchForm, setSearchForm] = useState({
    appId: "",
    userId: "",
  });

  useEffect(() => {
    loadChats();
  }, [queryRequest]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await listAllChatHistoryByPageForAdmin({
        ...queryRequest,
        appId: searchForm.appId || undefined,
        userId: searchForm.userId || undefined,
      });
      if (response.code === 0) {
        setChats(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || "获取聊天记录失败");
      }
    } catch (error) {
      message.error("获取聊天记录失败");
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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            聊天管理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            查看所有用户的聊天记录
          </p>
        </div>
      </div>

      {/* 搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>聊天记录搜索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>应用ID</Label>
              <Input
                type="number"
                value={searchForm.appId}
                onChange={(e) => setSearchForm(prev => ({ ...prev, appId: e.target.value }))}
                placeholder="输入应用ID"
              />
            </div>
            <div className="space-y-2">
              <Label>用户ID</Label>
              <Input
                type="number"
                value={searchForm.userId}
                onChange={(e) => setSearchForm(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="输入用户ID"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 聊天记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>聊天记录列表</CardTitle>
          <CardDescription>
            共 {total} 条聊天记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>应用ID</TableHead>
                <TableHead>用户ID</TableHead>
                <TableHead>用户消息</TableHead>
                <TableHead>AI回复</TableHead>
                <TableHead>对话时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell>{chat.id}</TableCell>
                  <TableCell>{chat.appId}</TableCell>
                  <TableCell>{chat.userId}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p
                        className="text-sm text-gray-900 dark:text-white truncate"
                        title={chat.messageType === "user" ? chat.message : "-"}
                      >
                        {chat.messageType === "user" ? truncateText(chat.message) : "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p
                        className="text-sm text-gray-600 dark:text-gray-300 truncate"
                        title={chat.messageType === "ai" ? chat.message : "-"}
                      >
                        {chat.messageType === "ai" ? truncateText(chat.message) : "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(chat.createTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/app/chat/${chat.appId}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
