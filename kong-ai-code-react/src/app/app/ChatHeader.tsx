import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Download,
  CloudUpload,
  Code,
  ArrowLeftIcon,
} from "lucide-react";

import type { AppVO } from "@/types/api";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  app: AppVO | null;
  isOwner: boolean;
  deploying: boolean;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
  onDeploy: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  app,
  isOwner,
  deploying,
  downloading,
  onBack,
  onDownload,
  onDeploy,
}) => {
  return (
    // ChatHeader 主容器 - 使用深色主题设计，紧凑布局
    <Card
      className={cn(
        "rounded-none border-x-0 border-t-0", // 无圆角，移除左右和顶部边框
        "px-4 py-1 bg-[#0d0d0d]" // 水平内边距4，垂直内边距1，深色背景
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
        {/* 返回按钮 - 使用深色主题，与header背景融合 */}
        <Button
          variant="outline"
          size="sm"
          className="bg-[#0d0d0d] hover:bg-[#0d0d0d]/80"
          aria-label="Go Back"
        >
          <ArrowLeftIcon className="h-4 w-4 text-white" />
        </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {app?.appIcon ? (
                <AvatarImage src={app.appIcon} alt={app.appName} />
              ) : (
                <AvatarFallback>
                  <Code className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                {app?.appName ?? "未命名应用"}
              </span>

              {app?.codeGenType && (
                <Badge
                  variant="secondary"
                  className="mt-0.5 w-fit"
                >
                  {app.codeGenType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownload}
            disabled={downloading || !isOwner}
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "下载中…" : "下载代码"}
          </Button>

          <Button
            size="sm"
            onClick={onDeploy}
            disabled={deploying}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {deploying ? "部署中…" : "部署"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
