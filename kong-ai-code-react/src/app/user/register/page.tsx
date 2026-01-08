"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Eye, EyeOff } from "lucide-react";
import { userRegister } from "@/api";
import { message } from "@/components/ui/toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userAccount: "",
    userPassword: "",
    checkPassword: "",
    userName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCheckPassword, setShowCheckPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userAccount || !formData.userPassword || !formData.checkPassword) {
      message.error("请填写完整的注册信息");
      return;
    }

    if (formData.userPassword !== formData.checkPassword) {
      message.error("两次输入的密码不一致");
      return;
    }

    if (formData.userPassword.length < 6) {
      message.error("密码长度不能少于6位");
      return;
    }

    setLoading(true);
    try {
      const response = await userRegister(formData);
      if (response.code === 0) {
        message.success("注册成功，请登录");
        router.push("/user/login");
      } else {
        message.error(response.message || "注册失败");
      }
    } catch (error) {
      message.error("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">注册AI代码妈妈</CardTitle>
          <CardDescription>
            创建您的账号，开启AI编程之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userAccount">账号</Label>
              <Input
                id="userAccount"
                name="userAccount"
                type="text"
                placeholder="请输入账号"
                value={formData.userAccount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">昵称</Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                placeholder="请输入昵称（可选）"
                value={formData.userName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">密码</Label>
              <div className="relative">
                <Input
                  id="userPassword"
                  name="userPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={formData.userPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkPassword">确认密码</Label>
              <div className="relative">
                <Input
                  id="checkPassword"
                  name="checkPassword"
                  type={showCheckPassword ? "text" : "password"}
                  placeholder="请再次输入密码"
                  value={formData.checkPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCheckPassword(!showCheckPassword)}
                >
                  {showCheckPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已有账号？
            </span>
            <Link
              href="/user/login"
              className="text-sm text-blue-600 hover:underline ml-1"
            >
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
