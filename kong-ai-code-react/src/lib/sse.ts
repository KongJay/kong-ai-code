/**
 * SSE (Server-Sent Events) 工具函数
 * 用于处理流式聊天响应
 */

// 获取 API 基础地址
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8123/api';
};

export interface SSECallbacks {
  onMessage: (content: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  onBusinessError?: (message: string) => void;
}

/**
 * 创建 SSE 连接进行聊天代码生成
 */
export const createChatSSE = (
  appId: string | number,
  message: string,
  callbacks: SSECallbacks
): (() => void) => {
  const baseURL = getApiBaseUrl();
  
  // 构建 URL 参数
  const params = new URLSearchParams({
    appId: String(appId),
    message: message,
  });

  const url = `${baseURL}/app/chat/gen/code?${params}`;

  // 创建 EventSource 连接
  const eventSource = new EventSource(url, {
    withCredentials: true,
  });

  let fullContent = '';
  let streamCompleted = false;

  // 处理接收到的消息
  eventSource.onmessage = (event) => {
    if (streamCompleted) return;

    try {
      // 解析 JSON 包装的数据
      const parsed = JSON.parse(event.data);
      const content = parsed.d;

      // 拼接内容
      if (content !== undefined && content !== null) {
        fullContent += content;
        callbacks.onMessage(fullContent);
      }
    } catch (error) {
      console.error('解析消息失败:', error);
    }
  };

  // 处理 done 事件
  eventSource.addEventListener('done', () => {
    if (streamCompleted) return;

    streamCompleted = true;
    eventSource.close();
    callbacks.onDone();
  });

  // 处理 business-error 事件（后端限流等错误）
  eventSource.addEventListener('business-error', (event: MessageEvent) => {
    if (streamCompleted) return;

    try {
      const errorData = JSON.parse(event.data);
      console.error('SSE 业务错误事件:', errorData);

      const errorMessage = errorData.message || '生成过程中出现错误';
      
      if (callbacks.onBusinessError) {
        callbacks.onBusinessError(errorMessage);
      } else {
        callbacks.onError(new Error(errorMessage));
      }

      streamCompleted = true;
      eventSource.close();
    } catch (parseError) {
      console.error('解析错误事件失败:', parseError);
      callbacks.onError(new Error('服务器返回错误'));
    }
  });

  // 处理连接错误
  eventSource.onerror = () => {
    if (streamCompleted) return;

    // 检查是否是正常的连接关闭
    if (eventSource.readyState === EventSource.CONNECTING) {
      streamCompleted = true;
      eventSource.close();
      callbacks.onDone();
    } else {
      streamCompleted = true;
      eventSource.close();
      callbacks.onError(new Error('SSE 连接错误'));
    }
  };

  // 返回关闭连接的函数
  return () => {
    streamCompleted = true;
    eventSource.close();
  };
};

