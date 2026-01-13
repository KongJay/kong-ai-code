import React from 'react';
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import type { ElementInfo } from "@/lib/visualEditor";

interface SelectedElementInfoProps {
  selectedElementInfo: ElementInfo | null;
  onClear: () => void;
}

export const SelectedElementInfo: React.FC<SelectedElementInfoProps> = ({
  selectedElementInfo,
  onClear
}) => {
  if (!selectedElementInfo) return null;

  return (
    <div className="mx-4 mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">
            选中元素：{selectedElementInfo.tagName.toLowerCase()}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-slate-400 hover:text-slate-200 h-auto p-1"
        >
          ✕
        </Button>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        {selectedElementInfo.id && (
          <div>
            <span className="text-slate-500">ID：</span>
            <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">
              #{selectedElementInfo.id}
            </code>
          </div>
        )}
        {selectedElementInfo.className && (
          <div>
            <span className="text-slate-500">类名：</span>
            <code className="bg-slate-800 px-2 py-1 rounded text-yellow-300">
              .{selectedElementInfo.className.split(' ').join('.')}
            </code>
          </div>
        )}
        {selectedElementInfo.textContent && (
          <div>
            <span className="text-slate-500">内容：</span>
            <span className="text-slate-200">
              {selectedElementInfo.textContent.substring(0, 50)}
              {selectedElementInfo.textContent.length > 50 ? '...' : ''}
            </span>
          </div>
        )}
        {selectedElementInfo.pagePath && (
          <div>
            <span className="text-slate-500">页面路径：</span>
            <span className="text-slate-200">{selectedElementInfo.pagePath}</span>
          </div>
        )}
        <div>
          <span className="text-slate-500">选择器：</span>
          <code className="bg-slate-800 px-2 py-1 rounded text-red-300 text-xs break-all">
            {selectedElementInfo.selector}
          </code>
        </div>
      </div>
    </div>
  );
};
