import React from 'react';
import { ExternalLink } from "lucide-react";

interface DeploySuccessBannerProps {
  deployedUrl: string;
}

export const DeploySuccessBanner: React.FC<DeploySuccessBannerProps> = ({
  deployedUrl
}) => {
  if (!deployedUrl) return null;

  return (
    <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
      <span className="text-sm text-emerald-400">部署成功！</span>
      <a
        href={deployedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
      >
        访问网站 <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};
