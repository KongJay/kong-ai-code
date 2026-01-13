"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Code, MessageSquare, Edit, ExternalLink, Plus } from "lucide-react";
import { getLoginUser, listMyAppVoByPage, listAppChatHistory } from "@/api";
import { useUserStore } from "@/store";
import type { LoginUserVO, AppVO, ChatHistory, AppQueryRequest } from "@/types/api";
import { message } from "@/components/ui/toast";

export default function ProfilePage() {
  const router = useRouter();
  const { loginUser, logout } = useUserStore();
  const [user, setUser] = useState<LoginUserVO | null>(null);
  const [myApps, setMyApps] = useState<AppVO[]>([]);
  const [recentChats, setRecentChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // 获取用户信息
      const userResponse = await getLoginUser();
      if (userResponse.code === 0) {
        setUser(userResponse.data);
      }

      // 获取我的应用
      const appsResponse = await listMyAppVoByPage({
        current: 1,
        pageSize: 10,
      });
      if (appsResponse.code === 0) {
        const apps = appsResponse.data.records;
        setMyApps(apps);

        // 获取最近聊天记录（这里简化处理，实际应该从最近的应用中获取）
        if (apps.length > 0) {
          const chatPromises = apps.slice(0, 3).map((app) =>
            listAppChatHistory({ appId: app.id, pageSize: 5 })
          );
          const chatResponses = await Promise.all(chatPromises);
          const allChats = chatResponses
            .filter((response) => response.code === 0)
            .flatMap((response) => response.data?.records ?? [])
            .sort(
              (a, b) =>
                new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            )
            .slice(0, 10);
          setRecentChats(allChats);
        }
      }
    } catch (error) {
      message.error("获取用户数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/user/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-xs dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">AI代码妈妈</span>
          </Link>
          <div className="flex space-x-4">
            <Link href="/apps">
              <Button variant="ghost">应用列表</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.userName}</CardTitle>
                  <CardDescription>{user.userAccount}</CardDescription>
                  <Badge variant={user.userRole === "admin" ? "default" : "secondary"} className="mt-2">
                    {user.userRole === "admin" ? "管理员" : "普通用户"}
                  </Badge>
                </div>
              </div>
              <Link href="/app/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建应用
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* 选项卡内容 */}
        <Tabs defaultValue="apps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apps" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>我的应用</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>最近对话</span>
            </TabsTrigger>
          </TabsList>

          {/* 我的应用 */}
          <TabsContent value="apps">
            <div className="grid gap-6">
              {myApps.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      还没有应用
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      创建您的第一个应用，开始AI编程之旅吧！
                    </p>
                    <Link href="/app/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        创建应用
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                myApps.map((app) => {
                  const reviewStatus = getReviewStatusText(app.reviewStatus);
                  return (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {app.appIcon ? (
                              <img
                                src={app.appIcon}
                                alt={app.appName}
                                className="w-12 h-12 rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <Code className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {app.appName}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {app.appDesc}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>类型: {app.appType === 0 ? "评分应用" : "测试应用"}</span>
                                <span>评分: {app.scoringStrategy === 0 ? "自定义" : "AI评分"}</span>
                                <Badge variant={reviewStatus.variant} className="text-xs">
                                  {reviewStatus.text}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/app/edit/${app.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/app/chat/${app.id}`}>
                              <Button size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* 最近对话 */}
          <TabsContent value="chats">
            <div className="space-y-4">
              {recentChats.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      还没有对话记录
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      开始与AI对话，您的对话记录将显示在这里
                    </p>
                    <Link href="/apps">
                      <Button>浏览应用</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                recentChats.map((chat) => {
                  const app = myApps.find(a => a.id === chat.appId);
                  return (
                    <Card key={chat.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {app?.appName || `应用 ${chat.appId}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(chat.createTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span
                                  className={
                                    chat.messageType === "user"
                                      ? "font-medium text-blue-600"
                                      : "font-medium text-green-600"
                                  }
                                >
                                  {chat.messageType === "user" ? "您: " : "AI: "}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 line-clamp-1">
                                  {chat.message}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/app/chat/${chat.appId}`}>
                            <Button variant="outline" size="sm">
                              继续对话
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
