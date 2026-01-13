import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI代码 - AI驱动的代码生成平台",
  description: "通过智能对话的方式，让AI理解你的需求并生成高质量的代码。支持多种编程语言和框架。",
  keywords: "AI, 代码生成, 编程助手, 对话式开发",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
