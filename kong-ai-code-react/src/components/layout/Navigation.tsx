import React, { useEffect } from "react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { UserMenu } from "./UserMenu";
import { useUserStore } from "@/store";

export const Navigation: React.FC = () => {
  const { setLoginUser } = useUserStore();

  // 初始化时检查 localStorage 中的用户状态
  useEffect(() => {
    try {
      const userStorage = localStorage.getItem('user-storage');
      if (userStorage) {
        const parsed = JSON.parse(userStorage);
        if (parsed.state?.loginUser) {
          setLoginUser(parsed.state.loginUser);
        }
      }
    } catch (error) {
      console.error("Failed to restore user state:", error);
    }
  }, [setLoginUser]);

  return (
    <nav className="border-b border-neutral-800/50 bg-black/20 backdrop-blur-sm">
      <div className="w-full px-6 py-1 flex justify-between items-center">
        {/* 左侧：打字动画 */}
        <div className="flex items-center space-x-3">
          <TypingAnimation
            words={["Hello World! 👋"]}
            className="text-lg font-semibold text-slate-100"
            duration={150}
            typeSpeed={100}
            deleteSpeed={50}
            pauseDelay={2000}
            loop={true}
          />
        </div>

        {/* 右侧：用户菜单 */}
        <UserMenu />
      </div>
    </nav>
  );
};
