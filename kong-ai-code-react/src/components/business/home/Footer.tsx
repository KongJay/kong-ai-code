import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  
  // 在聊天页面隐藏 Footer
  if (pathname?.startsWith('/app/chat/')) {
    return null;
  }

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="container flex h-14 items-center px-4 text-sm text-slate-500">
        <span>© 2026 AI · 红模仿</span>
      </div>
    </footer>
  );
};
