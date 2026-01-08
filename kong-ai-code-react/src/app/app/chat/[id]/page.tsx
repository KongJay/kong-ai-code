"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAppVoById, deployApp, listAppChatHistory } from "@/api";
import { createChatSSE } from "@/lib/sse";
import { useUserStore } from "@/store";
import type { AppVO, ChatMessage, ChatHistory } from "@/types/api";
import { message } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { VisualEditor, type ElementInfo } from "@/lib/visualEditor";
import { Loader2 } from "lucide-react";
import {
  ChatHeader,
  MessageList,
  SelectedElementInfo,
  ChatInput,
  PreviewPanel,
  DeploySuccessBanner
} from "@/app/components/app";

// 获取预览 URL
const getStaticPreviewUrl = (codeGenType: string, appId: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8123/api';
  const staticUrl = `${baseURL}/static/${codeGenType}_${appId}/`;
  if (codeGenType === 'vue_project') {
    return `${staticUrl}dist/index.html`;
  }
  return staticUrl;
};

export default function AppChatPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;
  const { loginUser } = useUserStore();
  
  // 应用信息
  const [app, setApp] = useState<AppVO | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  
  // 聊天相关
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 历史加载
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [lastCreateTime, setLastCreateTime] = useState<string>();
  
  // 预览相关
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  
  // 部署相关
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");
  
  // 下载相关
  const [downloading, setDownloading] = useState(false);

  // 可视化编辑相关
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<ElementInfo | null>(null);
  const visualEditorRef = useRef<VisualEditor | null>(null);

  // SSE 清理函数
  const closeSSERef = useRef<(() => void) | null>(null);

  // 权限检查
  const isOwner = app?.userId === loginUser?.id;

  // 编辑模式切换
  const toggleEditMode = useCallback(() => {
    if (!visualEditorRef.current) return;

    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe) {
      message.error('请等待页面加载完成');
      return;
    }

    const newEditMode = visualEditorRef.current.toggleEditMode();
    setIsEditMode(newEditMode);

    if (!newEditMode) {
      setSelectedElementInfo(null);
    }
  }, []);

  // 清除选中元素
  const clearSelectedElement = useCallback(() => {
    setSelectedElementInfo(null);
    visualEditorRef.current?.clearSelection();
  }, []);

  // 获取输入框占位符
  const getInputPlaceholder = useCallback(() => {
    if (selectedElementInfo) {
      return `正在编辑 ${selectedElementInfo.tagName.toLowerCase()} 元素，描述您想要的修改...`;
    }
    return '请描述你想生成的网站，越详细效果越好哦';
  }, [selectedElementInfo]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 初始化可视化编辑器
  useEffect(() => {
    visualEditorRef.current = new VisualEditor({
      onElementSelected: (elementInfo: ElementInfo) => {
        setSelectedElementInfo(elementInfo);
      },
    });

    return () => {
      if (visualEditorRef.current) {
        visualEditorRef.current.disableEditMode();
      }
      // 清理 SSE 连接
      if (closeSSERef.current) {
        closeSSERef.current();
      }
    };
  }, []);

  // 加载应用信息和聊天历史
  useEffect(() => {
    loadAppInfo();
  }, [appId]);

  // 监听iframe消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      visualEditorRef.current?.handleIframeMessage(event);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 加载应用信息
  const loadAppInfo = async () => {
    try {
      const response = await getAppVoById(appId);
      if (response.code === 0 && response.data) {
        const appData = response.data;
        setApp(appData);
        // 加载聊天历史
        await loadChatHistory(false);
        // 关键：不要依赖 state 里 app 是否已刷新（setState 是异步的）
        // 直接用本次请求拿到的 codeGenType 来更新预览；如果后端未返回，默认回退为 html
        updatePreview(appData.codeGenType);
      } else {
        message.error(response.message || "获取应用信息失败");
        router.push('/apps');
      }
    } catch (error) {
      message.error("获取应用信息失败");
      router.push('/apps');
    } finally {
      setAppLoading(false);
    }
  };

  // 加载聊天历史
  const loadChatHistory = async (isLoadMore = false) => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    
    try {
      const response = await listAppChatHistory({
        appId,
        pageSize: 10,
        lastCreateTime: isLoadMore ? lastCreateTime : undefined,
      });
      
      if (response.code === 0 && response.data?.records) {
        const chatHistories = response.data.records;
        
        if (chatHistories.length > 0) {
          // 将后端历史转换为前端消息格式，并反转顺序（老消息在前）
          const historyMessages: ChatMessage[] = chatHistories
            .map((chat: ChatHistory) => ({
              id: chat.id,
              type: chat.messageType as 'user' | 'ai',
              content: chat.message || '',
              createTime: chat.createTime,
            }))
            .reverse();
          
          if (isLoadMore) {
            setMessages(prev => [...historyMessages, ...prev]);
          } else {
            setMessages(historyMessages);
            // 如果有历史消息，更新预览
            if (historyMessages.length >= 2) {
              updatePreview();
            }
          }
          
          // 更新游标
          setLastCreateTime(chatHistories[chatHistories.length - 1]?.createTime);
          setHasMoreHistory(chatHistories.length === 10);
        } else {
          setHasMoreHistory(false);
        }
      }
    } catch (error) {
      console.error("加载聊天历史失败:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 更新预览
  const updatePreview = (codeGenType?: string) => {
    const resolvedCodeGenType = codeGenType || app?.codeGenType || "html";
    console.log('updatePreview', appId, resolvedCodeGenType);
    if (appId) {
      const newPreviewUrl = getStaticPreviewUrl(resolvedCodeGenType, appId);
      console.log('newPreviewUrl', newPreviewUrl);
      setPreviewUrl(newPreviewUrl);
      setPreviewKey(prev => prev + 1); // 强制刷新 iframe
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isGenerating || !isOwner) return;

    let prompt = inputValue.trim();

    // 如果有选中的元素，将元素信息添加到提示词中
    if (selectedElementInfo) {
      let elementContext = `\n\n选中元素信息：`;
      if (selectedElementInfo.pagePath) {
        elementContext += `\n- 页面路径: ${selectedElementInfo.pagePath}`;
      }
      elementContext += `\n- 标签: ${selectedElementInfo.tagName.toLowerCase()}\n- 选择器: ${selectedElementInfo.selector}`;
      if (selectedElementInfo.textContent) {
        elementContext += `\n- 当前内容: ${selectedElementInfo.textContent.substring(0, 100)}`;
      }
      prompt += elementContext;
    }

    setInputValue("");

    // 发送消息后，清除选中元素并退出编辑模式
    if (selectedElementInfo) {
      clearSelectedElement();
      if (isEditMode) {
        toggleEditMode();
      }
    }

    // 添加用户消息（包含元素信息）
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: prompt,
    }]);

    // 添加 AI 消息占位符
    const aiMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMsgId,
      type: 'ai',
      content: '',
      loading: true,
    }]);

    setIsGenerating(true);

    // 创建 SSE 连接
    closeSSERef.current = createChatSSE(appId, prompt, {
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
        // 延迟更新预览
        setTimeout(() => {
          loadAppInfo();
        }, 1000);
      },
      onError: (error: Error) => {
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
      onBusinessError: (errorMessage: string) => {
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

  // 下载代码
  const handleDownloadCode = async () => {
    if (!appId || downloading) return;
    setDownloading(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8123/api';
      const url = `${baseURL}/app/download/${appId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId}.zip`;
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      
      message.success('代码下载成功');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  // 部署应用
  const handleDeploy = async () => {
    if (!appId || deploying) return;
    setDeploying(true);
    
    try {
      const response = await deployApp({ appId });

      if (response.code === 0 && response.data) {
        setDeployedUrl(response.data);
        message.success('部署成功！');
      } else {
        message.error(response.message || '部署失败');
      }
    } catch (error) {
      console.error('部署失败:', error);
      message.error('部署失败，请重试');
    } finally {
      setDeploying(false);
    }
  };

  // 加载中状态
  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">应用不存在</h2>
          <Button onClick={() => router.push('/apps')} variant="outline">
            返回应用列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d0d0d] flex flex-col">
      <ChatHeader
        app={app}
        isOwner={isOwner}
        deploying={deploying}
        downloading={downloading}
        onBack={() => router.push('/apps')}
        onDownload={handleDownloadCode}
        onDeploy={handleDeploy}
      />

      <DeploySuccessBanner deployedUrl={deployedUrl} />

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧聊天区域 */}
        <div className="flex-1 flex flex-col min-w-0 lg:max-w-[50%]">
          <MessageList
            messages={messages}
            isTyping={isGenerating}
            loadingHistory={loadingHistory}
            hasMoreHistory={hasMoreHistory}
            onLoadMore={() => loadChatHistory(true)}
            messagesEndRef={messagesEndRef}
          />

          <SelectedElementInfo
            selectedElementInfo={selectedElementInfo}
            onClear={clearSelectedElement}
          />

          <ChatInput
            inputValue={inputValue}
            isGenerating={isGenerating}
            isOwner={isOwner}
            placeholder={isOwner ? getInputPlaceholder() : "无法在别人的作品下对话"}
            onInputChange={setInputValue}
            onSend={sendMessage}
          />
        </div>

        <PreviewPanel
          previewUrl={previewUrl}
          previewKey={previewKey}
          isGenerating={isGenerating}
          isEditMode={isEditMode}
          isOwner={isOwner}
          onToggleEdit={toggleEditMode}
          onIframeLoad={() => {
            const iframe = document.querySelector('iframe') as HTMLIFrameElement;
            if (iframe && visualEditorRef.current) {
              visualEditorRef.current.init(iframe);
              visualEditorRef.current.onIframeLoad();
            }
          }}
        />
      </div>
    </div>
  );
}
