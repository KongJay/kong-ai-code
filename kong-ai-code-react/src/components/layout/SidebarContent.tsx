import React from "react";
import { usePathname } from "next/navigation";
import { SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogoExpanded, LogoCollapsed } from "./Logo";

interface SidebarContentProps {
  open: boolean;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ open }) => {
  const pathname = usePathname();

  // 导航链接配置
  const mainLinks = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Chat",
      href: "/chat",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        {
          label: "代码生成对话",
          href: "/chat/1"
        },
        {
          label: "前端布局讨论",
          href: "/chat/2"
        },
        {
          label: "API 设计咨询",
          href: "/chat/3"
        }
      ]
    },
    {
      label: "Studio",
      href: "/apps",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Agents",
      href: "/agents",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <SidebarBody className="justify-between gap-10 bg-[#141414] border-r border-neutral-800">
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {open ? <LogoExpanded /> : <LogoCollapsed />}
        <div className="mt-8 flex flex-col gap-2">
          {mainLinks.map((link, idx) => (
            <SidebarLink
              key={idx}
              link={link}
              // className={pathname === link.href ? "bg-emerald-500/20" : ""}
            />
          ))}
        </div>
      </div>
    </SidebarBody>
  );
};
