import React from "react";
import { useRouter } from "next/navigation";
import { IconUser, IconApps, IconLogout } from "@tabler/icons-react";
import { useUserStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const { loginUser, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/user/login";
  };

  if (!loginUser) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/user/login")}
          className="text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-500/10"
        >
          登录
        </button>
        <button
          onClick={() => router.push("/user/register")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          注册
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-emerald-400">
              {(loginUser.userName || loginUser.userAccount || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-slate-200">
            {loginUser.userName || loginUser.userAccount}
          </p>
          <p className="text-xs text-slate-500">
            {loginUser.userAccount}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <IconUser className="mr-2 h-4 w-4" />
          <span>个人资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/navigation/apps")}>
          <IconApps className="mr-2 h-4 w-4" />
          <span>应用列表</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
