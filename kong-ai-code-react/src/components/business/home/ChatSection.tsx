import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubIcon, DockerIcon } from "@/components/icons";
import { UserAvatar } from "@/components/common";
import {
  MessageSquare, Copy, Settings, Paperclip, ArrowUp, ChevronDown,
  Hexagon, Loader2, ExternalLink
} from "lucide-react";
import type { ChatMessage } from "@/types/api";
import type { LoginUserVO } from "@/types/api";

interface ChatSectionProps {
  loginUser: LoginUserVO | null;
  messages: ChatMessage[];
  currentAppId: number | null;
  inputValue: string;
  isCreating: boolean;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onGoToFullChat: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  loginUser,
  messages,
  currentAppId,
  inputValue,
  isCreating,
  isGenerating,
  onInputChange,
  onSendMessage,
  onGoToFullChat
}) => {
  const showChatArea = messages.length > 0;

  return (
    <section className="mx-auto max-w-3xl px-4">
      <div className="rounded-2xl border border-neutral-700/40 bg-[#1a1a1a] shadow-2xl shadow-black/50">
        {/* 顶部栏 */}


        <div className=" rounded-2xl flex items-center justify-between px-5 py-1 ">
          <div className="flex items-center gap-1.5 text-sm">
            {loginUser ? (
              <>
                <span className="text-emerald-400 font-medium">{loginUser.userName || loginUser.userAccount}</span>
                <span className="text-neutral-500">已登录</span>
              </>
            ) : (
              <>
                <Link href="/user/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">SignIn</Link>
                <span className="text-neutral-500">to get free credits</span>
              </>
            )}
          </div>
          {currentAppId && (
            <button
              onClick={onGoToFullChat}
              className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              查看完整对话
            </button>
          )}
        </div>


        {/* 输入区域 */}
        <div className="mx-auto w-[730px] bg-[#18181b]   rounded-2xl px-2 py-1 border border-neutral-600/50">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder={showChatArea ? "继续对话，描述您想要的修改..." : "Ask, learn, brainstorm and create amazing systems..."}
            className="p-1 w-full bg-transparent text-neutral-300 placeholder:text-neutral-300 placeholder:font-medium text-[12px] leading-relaxed resize-none focus:outline-hidden min-h-[32px] max-h-[32px]"
            rows={1}
            disabled={isCreating || isGenerating}
          />
 
          {/* 底部工具栏 */}
          <div className="flex items-center justify-between  mt-4">
            {/* 左侧图标组 */}
            <div className="flex items-center gap-0.5">
              <button className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <MessageSquare className="h-[18px] w-[18px]" />
              </button>
              <button className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <Copy className="h-[18px] w-[18px]" />
              </button>
              <button className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <GitHubIcon />
              </button>
              <button className="p-1 text-sky-400 hover:text-sky-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <DockerIcon />
              </button>
              <button className="p-1 text-orange-400 hover:text-orange-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <Hexagon className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* 右侧控制组 */}
            <div className="flex justify-around  items-center gap-0.5">
              {/* 模型选择器 */}
              <button className="flex items-center gap-2 rounded-full bg-neutral-800/80 pl-2 pr-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700/80 transition-colors border border-neutral-700/50">
               
                <span className="text-[13px]">arch-base</span>
                <ChevronDown className="h-[15px] w-[15px] text-neutral-500" />
              </button>

              {/* 设置按钮 */}
              <button className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <Settings className="h-[15px] w-[15px]" />
              </button>

              {/* 附件按钮 */}
              <button className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 rounded-lg transition-colors">
                <Paperclip className="h-[15px] w-[15px]" />
              </button>

              {/* 发送按钮 */}
              <button
                onClick={onSendMessage}
                className={`p-1 rounded-full flex items-center justify-center transition-all ${
                  inputValue.trim() && !isCreating && !isGenerating
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-white ring-2 ring-neutral-300/20'
                    : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                }`}
                disabled={!inputValue.trim() || isCreating || isGenerating}
              >
                {isCreating || isGenerating ? (
                  <Loader2 className="  h-[15px] w-[15px] animate-spin" />
                ) : (
                  <ArrowUp className=" h-[15px] w-[15px]" />
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
