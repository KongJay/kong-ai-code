import React from 'react';
import { Code, Users, Bot } from "lucide-react";

interface FeatureCardsProps {
  showChatArea: boolean;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ showChatArea }) => {
  if (showChatArea) return null;

  return (
    <section className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
      {[
        {
          title: "生成代码",
          desc: "自然语言描述，快速得到可运行代码。",
          icon: <Code className="h-4 w-4 text-slate-400" />,
        },
        {
          title: "对话迭代",
          desc: "上下文连续对话，快速微调页面与逻辑。",
          icon: <Bot className="h-4 w-4 text-slate-400" />,
        },
        {
          title: "部署分享",
          desc: "一键构建并生成访问链接，方便演示与协作。",
          icon: <Users className="h-4 w-4 text-slate-400" />,
        },
      ].map((item, idx) => (
        <div key={idx} className="rounded-xl border border-neutral-700/50 bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-2 mb-2">
            {item.icon}
            <span className="text-sm font-medium text-slate-200">{item.title}</span>
          </div>
          <p className="text-sm text-slate-500">{item.desc}</p>
        </div>
      ))}
    </section>
  );
};
