/**
 * 首页组件 - AI代码生成器主页面
 *
 * 功能特性:
 * 1. 用户友好的界面设计，包含Hero区域、聊天区域、功能卡片
 * 2. 一键创建应用并开始AI对话
 * 3. 支持实时流式对话
 * 4. 响应式设计，支持聊天状态切换
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addApp } from "@/api"; // 应用创建API
import { createChatSSE } from "@/lib/sse"; // SSE流式聊天工具
import { message } from "@/components/ui/toast"; // 消息提示组件
import { useUserStore } from "@/store"; // 用户状态管理
import type { ChatMessage } from "@/types/api"; // 聊天消息类型
import { HeroSection, ChatSection, FeatureCards } from "@/components/business/home"; // 首页业务组件
import { TerminalChat } from "@/components/ui/terminal";

/**
 * 首页组件定义
 * 主要功能：提供用户界面让用户快速创建应用并开始AI对话
 */
export default function Home() {
  // ===== 路由和状态管理 =====
  const router = useRouter(); // Next.js路由实例，用于页面跳转
  const { loginUser, isLoading: isUserLoading } = useUserStore(); // 当前登录用户信息

  // ===== 表单和UI状态 =====
  const [inputValue, setInputValue] = useState(""); // 用户输入的需求描述
  const [selectedModel, setSelectedModel] = useState("arch-base"); // 选择的AI模型（预留字段）
  const [isCreating, setIsCreating] = useState(false); // 是否正在创建应用
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在生成代码
  const [mode, setMode] = useState(0); // 模式：0=chat, 1=studio, 2=agent

  // ===== 聊天相关状态 =====
  const [messages, setMessages] = useState<ChatMessage[]>([]); // 聊天消息列表
  const [currentAppId, setCurrentAppId] = useState<number | null>(null); // 当前应用ID

  // ===== DOM引用 =====
  const messagesEndRef = useRef<HTMLDivElement>(null); // 消息列表底部引用，用于自动滚动
  const closeSSERef = useRef<(() => void) | null>(null); // SSE连接关闭函数引用

  // ===== 工具函数 =====

  /**
   * 自动滚动到消息列表底部
   * 当有新消息时保持用户视角在最新消息
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ===== 副作用处理 =====

  /**
   * 组件挂载时检查登录状态
   * 修复：只有明确未登录且状态已加载完成时才跳转
   */
  useEffect(() => {
    // 等待用户状态加载完成
    if (!isUserLoading && !loginUser) {
      console.log('用户未登录，跳转到登录页');
      router.push("/user/login");
    }
  }, [loginUser, isUserLoading, router]);

  /**
   * 监听消息变化，自动滚动到底部
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 组件卸载时清理SSE连接
   * 防止内存泄漏和不必要的网络连接
   */
  useEffect(() => {
    return () => {
      if (closeSSERef.current) {
        closeSSERef.current();
      }
    };
  }, []);

  // ===== 核心业务逻辑 =====

  /**
   * 创建应用并开始AI对话的主函数
   *
   * 流程：
   * 1. 输入验证和登录检查
   * 2. 如果已有应用，直接发送消息
   * 3. 创建新应用并建立SSE连接开始对话
   * 4. 处理各种错误情况
   */
  const handleCreateApp = async () => {
    // 防止重复提交
    if (!inputValue.trim() || isCreating || isGenerating) return;

    // 登录状态检查
    if (!loginUser) {
      message.error("请先登录");
      router.push("/user/login");
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue(""); // 清空输入框

    // 如果当前已有应用在对话，直接发送消息而不是创建新应用
    if (currentAppId) {
      await sendMessage(userMessage);
      return;
    }

    // ===== 第一阶段：UI更新 =====
    // 立即显示用户消息，提供即时反馈
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userMessage,
    }]);

    // ===== 第二阶段：创建应用 =====
    setIsCreating(true);
    try {
      const res = await addApp({ 
        initPrompt: userMessage,
        mode,
       });
      const response = res as any; // API响应已在拦截器中解包

      if (response.code === 0 && response.data) {
        const appId = response.data as number;
        setCurrentAppId(appId); // 保存应用ID，用于后续对话

        // ===== 第三阶段：开始AI对话 =====
        // 添加AI消息占位符
        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: aiMsgId,
          type: 'ai',
          content: '',
          loading: true, // 显示加载状态
        }]);

        // 建立SSE流式连接，开始实时对话
        setIsGenerating(true);
        closeSSERef.current = createChatSSE(appId, userMessage, {
          // 消息接收回调 - 实时更新AI回复内容
          onMessage: (content) => {
            setMessages(prev => prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content, loading: false } // 更新内容并停止加载
                : msg
            ));
          },

          // 对话完成回调
          onDone: () => {
            setIsGenerating(false);
            closeSSERef.current = null; // 清理连接引用
          },

          // 网络错误处理
          onError: (error) => {
            console.error('生成失败:', error);
            setMessages(prev => prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content: '抱歉，生成过程中出现了错误，请重试。', loading: false }
                : msg
            ));
            setIsGenerating(false);
            closeSSERef.current = null;
            message.error('生成失败，请重试');
          },

          // 业务逻辑错误处理（如参数错误、权限问题等）
          onBusinessError: (errorMessage) => {
            setMessages(prev => prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content: `❌ ${errorMessage}`, loading: false }
                : msg
            ));
            setIsGenerating(false);
            closeSSERef.current = null;
            message.error(errorMessage);
          },
        });
      } else {
        // API返回错误，显示错误信息并移除用户消息
        message.error(response.message || "创建应用失败");
        setMessages(prev => prev.filter(msg => msg.id !== userMsgId));
      }
    } catch (error) {
      // 网络或其他异常错误处理
      console.error("创建应用失败:", error);
      message.error("创建应用失败，请稍后重试");
      setMessages(prev => prev.filter(msg => msg.id !== userMsgId));
    } finally {
      setIsCreating(false); // 重置创建状态
    }
  };

  /**
   * 发送消息到已有应用（继续对话）
   *
   * 与handleCreateApp不同，这个函数用于在已创建的应用中发送消息
   * 不需要创建新应用，直接建立SSE连接进行对话
   */
  const sendMessage = async (userMessage: string) => {
    // 状态检查：确保有应用ID且没有正在进行的生成
    if (!currentAppId || isGenerating) return;

    // ===== 第一阶段：UI更新 =====
    // 添加用户消息
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userMessage,
    }]);

    // 添加AI消息占位符
    const aiMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMsgId,
      type: 'ai',
      content: '',
      loading: true,
    }]);

    // ===== 第二阶段：建立SSE连接 =====
    setIsGenerating(true);
    closeSSERef.current = createChatSSE(currentAppId, userMessage, {
      onMessage: (content) => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content, loading: false }
            : msg
        ));
      },
      onDone: () => {
        setIsGenerating(false);
        closeSSERef.current = null;
      },
      onError: (error) => {
        console.error('生成失败:', error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content: '抱歉，生成过程中出现了错误，请重试。', loading: false }
            : msg
        ));
        setIsGenerating(false);
        closeSSERef.current = null;
        message.error('生成失败，请重试');
      },
      onBusinessError: (errorMessage) => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content: `❌ ${errorMessage}`, loading: false }
            : msg
        ));
        setIsGenerating(false);
        closeSSERef.current = null;
        message.error(errorMessage);
      },
    });
  };

  /**
   * 跳转到完整聊天页面
   * 当用户想要查看完整对话历史或使用更多功能时
   */
  const goToFullChat = () => {
    if (currentAppId) {
      router.push(`/app/chat/${currentAppId}`);
    }
  };

  // ===== 计算属性 =====

  /**
   * 是否显示聊天区域
   * 当有消息时隐藏Hero区域和功能卡片，显示聊天界面
   */
  const showChatArea = messages.length > 0;

  // ===== 渲染逻辑 =====

  // 显示加载状态
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">检查登录状态...</div>
      </div>
    );
  }

  // 如果未登录，显示空内容（useEffect 会处理跳转）
  if (!loginUser) {
    return null;
  }

  return (
    /**
     * 根容器：深色主题背景，全屏高度
     */
    <div className="min-h-screen bg-[#0d0d0d] text-slate-100">

      {/**
       * 顶部导航栏下方的"对话框"（消息展示区）
       * 仅在开始对话后展示，避免撑破外层：内部自带滚动条
       */}
      {showChatArea && (
        <section className="container px-4 pt-6">
          <div className="mx-auto max-w-3xl px-4">
            <TerminalChat
              messages={messages.map((msg) => ({
                id: msg.id,
                type: msg.type,
                content: msg.loading ? "" : msg.content,
                loading: msg.loading,
                createTime: msg.createTime,
              }))}
              isTyping={isGenerating}
              className="w-full max-w-none"
            />
          </div>
        </section>
      )}

      {/**
       * 主内容区域
       * 使用响应式布局，内容居中，垂直间距
       */}
      <main className="container px-4 pt-6 pb-8 space-y-8">

        {/**
         * Hero区域：包含标题和动画文本
         * 当有聊天消息时隐藏，只在初始状态显示
         */}
        <HeroSection showChatArea={showChatArea} />

        {/**
         * 聊天区域：核心交互组件
         * 包含消息列表、输入框、工具栏等
         * 传递所有必要的props和事件处理器
         */}
        <ChatSection
          loginUser={loginUser}              // 当前用户信息
          messages={messages}                // 消息列表
          currentAppId={currentAppId}        // 当前应用ID
          inputValue={inputValue}            // 输入框值
          isCreating={isCreating}            // 创建应用状态
          isGenerating={isGenerating}        // AI生成状态
          onInputChange={setInputValue}      // 输入变化处理
          onSendMessage={handleCreateApp}    // 发送消息处理
          onGoToFullChat={goToFullChat}      // 跳转完整聊天
          onModeChange={setMode}             // 模式变化处理
        />
      </main>
    </div>
  );
}