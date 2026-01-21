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
        "rounded-none border-x-0 border-t-0 border-b-0",
        "px-4 py-1 drak bg-neutral-800"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
        {/* 返回按钮 - 使用深色主题，与header背景融合 */}
      
          <ArrowLeftIcon className="h-4 w-4 text-white" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {app?.appName ?? "未命名应用"}
              </span>

              {app?.codeGenType && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0"
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
           
            size="sm"
            onClick={onDownload}
            disabled={downloading || !isOwner}
            className="bg-[#0d0d0d] text-white"
          >
            <Download className="mr-2 h-4 w-4 " />
            {downloading ? "下载中…" : "下载代码"}
          </Button>

          <Button
            size="sm"
            onClick={onDeploy}
            disabled={deploying}
            className="bg-[#0d0d0d] text-white"
          >
            <CloudUpload className="mr-2 h-4 w-4 " />
            {deploying ? "部署中…" : "部署"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
