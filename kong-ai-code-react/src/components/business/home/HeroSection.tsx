import React from 'react';
import { FlipWords } from "@/components/ui/flip-words";

interface HeroSectionProps {
  showChatArea: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ showChatArea }) => {
  if (showChatArea) return null;

  return (
    <section className="text-center space-y-4 max-w-4xl mx-auto pt-8">
      {/* Feature 标签 */}
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-amber-200/90">Feature</span>
        <span className="text-sm text-slate-400">Codebase Integrations Learn More ↗</span>
      </div>

      {/* 主标题 - 翻转动画 */}
      <h1 className="text-4xl font-light leading-tight md:text-5xl lg:text-6xl text-slate-100">
        Build Scalable
        <FlipWords
          words={["Systems", "Applications", "Platforms", "APIs"]}
          duration={3000}
          className="text-emerald-400"
        />
      </h1>
    </section>
  );
};
