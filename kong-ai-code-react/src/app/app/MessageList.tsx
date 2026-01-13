import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AIAvatar, UserAvatar } from "@/components/common";
import type { ChatMessage } from "@/types/api";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  loadingHistory: boolean;
  hasMoreHistory: boolean;
  onLoadMore: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  loadingHistory,
  hasMoreHistory,
  onLoadMore,
  messagesEndRef
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 加载更多按钮 */}
      {hasMoreHistory && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingHistory}
            className="text-slate-500 hover:text-slate-300"
          >
            {loadingHistory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            加载更多历史消息
          </Button>
        </div>
      )}

      {/* 空状态 */}
      {messages.length === 0 && !loadingHistory && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">开始与 AI 对话</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            描述您想要生成的网站，越详细效果越好
          </p>
        </div>
      )}

      {/* 消息列表 */}
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.type === 'ai' && <AIAvatar />}
          <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
            msg.type === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-800 text-slate-200'
          }`}>
            {msg.loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI 正在思考...</span>
              </div>
            ) : msg.type === 'user' ? (
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`${className} bg-neutral-700 px-1 py-0.5 rounded`} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {msg.type === 'user' && <UserAvatar />}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
