import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, CloudUpload } from "lucide-react";
import { Code } from "lucide-react";
import type { AppVO } from "@/types/api";

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
  onDeploy
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-400 hover:text-slate-200"
        >
          ← 返回
        </Button>
        <div className="flex items-center gap-3">
          {app?.appIcon ? (
            <img src={app.appIcon} alt={app.appName} className="w-8 h-8 rounded-lg" />
          ) : (
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Code className="h-4 w-4 text-emerald-400" />
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold text-slate-100">{app?.appName}</h1>
            {app?.codeGenType && (
              <span className="text-xs text-slate-500">{app.codeGenType}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          disabled={downloading || !isOwner}
          className="text-slate-400 hover:text-slate-200"
        >
          {downloading ? '下载中...' : '下载代码'}
        </Button>
        <Button
          size="sm"
          onClick={onDeploy}
          disabled={deploying}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {deploying ? '部署中...' : '部署'}
        </Button>
      </div>
    </header>
  );
};
