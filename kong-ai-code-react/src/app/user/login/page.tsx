"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Eye, EyeOff } from "lucide-react";
import { userLogin } from "@/api";
import { useUserStore } from "@/store";
import { message } from "@/components/ui/toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    userAccount: "",
    userPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setLoginUser } = useUserStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userAccount || !formData.userPassword) {
      message.error("请输入账号和密码");
      return;
    }

    setLoading(true);
    try {
      const response = await userLogin(formData);
      if (response.code === 0) {
        // 登录成功
        localStorage.setItem('token', 'mock-token'); // 这里应该从响应中获取token
        setLoginUser(response.data);
        message.success("登录成功");
        router.push("/");
      } else {
        message.error(response.message || "登录失败");
      }
    } catch (error) {
      message.error("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-16 items-center justify-center border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-5 w-5 text-primary" />
          <span>AI代码 · 登录</span>
        </div>
      </div>

      <div className="container flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm border-muted">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Login to your account</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
              </div>
              <Button variant="link" className=" text-black " asChild>
                <Link href="/user/register">Sign Up</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="userAccount">Email</Label>
                <Input
                  id="userAccount"
                  name="userAccount"
                  type="account"
                  placeholder="请输入账号"
                  value={formData.userAccount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="userPassword">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="userPassword"
                    name="userPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.userPassword}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90"
                disabled={loading}
              >
                {loading ? "登录中..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
