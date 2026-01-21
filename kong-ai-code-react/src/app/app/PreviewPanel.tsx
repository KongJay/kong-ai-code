import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit3, ExternalLink, Loader2 } from "lucide-react";

interface PreviewPanelProps {
  previewUrl: string;
  previewKey: number;
  isGenerating: boolean;
  isEditMode: boolean;
  isOwner: boolean;
  onToggleEdit: () => void;
  onIframeLoad: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewUrl,
  previewKey,
  isGenerating,
  isEditMode,
  isOwner,
  onToggleEdit,
  onIframeLoad
}) => {
  return (
    <div className="hidden lg:flex flex-1 flex-col border-l  bg-neutral-800 border-neutral-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 ">
        <h3 className="text-sm font-medium text-slate-300">网站预览</h3>
        <div className="flex items-center gap-2">
          {isOwner && previewUrl ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleEdit}
              className={`text-slate-400 hover:text-slate-200 ${isEditMode ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {isEditMode ? '退出编辑' : '编辑模式'}
            </Button>
          ) : (
            <div className="text-xs text-slate-500 flex flex-col">
              <span>
                {!isOwner ? '🔒 需要所有者权限' : !previewUrl ? '⏳ 等待网站生成...' : '❌ 编辑模式不可用'}
              </span>
              <span className="text-slate-600">
                所有者: {isOwner ? '✅' : '❌'} | 预览: {previewUrl ? '✅' : '❌'}
              </span>
            </div>
          )}
          {previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
              className="text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              新窗口打开
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 ">
        {!previewUrl && !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <div className="text-4xl mb-4">🌐</div>
            <p className="text-sm">网站生成完成后将在这里展示</p>
          </div>
        ) : isGenerating && !previewUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm">正在生成网站...</p>
          </div>
        ) : (
          <iframe
            key={previewKey}
            src={previewUrl}
            className="w-full h-full border-none preview-iframe"
            title="网站预览"
            onLoad={onIframeLoad}
          />
        )}
      </div>
    </div>
  );
};
