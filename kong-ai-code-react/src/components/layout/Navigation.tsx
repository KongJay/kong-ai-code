import React from "react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { UserMenu } from "./UserMenu";

export const Navigation: React.FC = () => {
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
