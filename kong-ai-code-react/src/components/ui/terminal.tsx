"use client"

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { motion, MotionProps, useInView } from "motion/react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { cn } from "@/lib/utils"

// 聊天消息类型
interface ChatMessage {
  id: string | number
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  createTime?: string
}

interface SequenceContextValue {
  completeItem: (index: number) => void
  activeIndex: number
  sequenceStarted: boolean
}

const SequenceContext = createContext<SequenceContextValue | null>(null)

const useSequence = () => useContext(SequenceContext)

const ItemIndexContext = createContext<number | null>(null)
const useItemIndex = () => useContext(ItemIndexContext)

interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode
  delay?: number
  className?: string
  startOnView?: boolean
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  startOnView = false,
  ...props
}: AnimatedSpanProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  })

  const sequence = useSequence()
  const itemIndex = useItemIndex()
  const [hasStarted, setHasStarted] = useState(false)
  useEffect(() => {
    if (!sequence || itemIndex === null) return
    if (!sequence.sequenceStarted) return
    if (hasStarted) return
    if (sequence.activeIndex === itemIndex) {
      setHasStarted(true)
    }
  }, [sequence?.activeIndex, sequence?.sequenceStarted, hasStarted, itemIndex])

  const shouldAnimate = sequence ? hasStarted : startOnView ? isInView : true

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: -5 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
      transition={{ duration: 0.3, delay: sequence ? 0 : delay / 1000 }}
      className={cn("grid text-sm font-normal tracking-tight", className)}
      onAnimationComplete={() => {
        if (!sequence) return
        if (itemIndex === null) return
        sequence.completeItem(itemIndex)
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface TypingAnimationProps extends MotionProps {
  children: string
  className?: string
  duration?: number
  delay?: number
  as?: React.ElementType
  startOnView?: boolean
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  startOnView = true,
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string. Received:")
  }

  const MotionComponent = useMemo(
    () =>
      motion.create(Component, {
        forwardMotionProps: true,
      }),
    [Component]
  )

  const [displayedText, setDisplayedText] = useState<string>("")
  const [started, setStarted] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  })

  const sequence = useSequence()
  const itemIndex = useItemIndex()

  useEffect(() => {
    if (sequence && itemIndex !== null) {
      if (!sequence.sequenceStarted) return
      if (started) return
      if (sequence.activeIndex === itemIndex) {
        setStarted(true)
      }
      return
    }

    if (!startOnView) {
      const startTimeout = setTimeout(() => setStarted(true), delay)
      return () => clearTimeout(startTimeout)
    }

    if (!isInView) return

    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [
    delay,
    startOnView,
    isInView,
    started,
    sequence?.activeIndex,
    sequence?.sequenceStarted,
    itemIndex,
  ])

  useEffect(() => {
    if (!started) return

    let i = 0
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingEffect)
        if (sequence && itemIndex !== null) {
          sequence.completeItem(itemIndex)
        }
      }
    }, duration)

    return () => {
      clearInterval(typingEffect)
    }
  }, [children, duration, started])

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("text-sm font-normal tracking-tight", className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  )
}

interface TerminalProps {
  children: React.ReactNode
  className?: string
  sequence?: boolean
  startOnView?: boolean
}

export const Terminal = ({
  children,
  className,
  sequence = true,
  startOnView = true,
}: TerminalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(containerRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const sequenceHasStarted = sequence ? !startOnView || isInView : false

  const contextValue = useMemo<SequenceContextValue | null>(() => {
    if (!sequence) return null
    return {
      completeItem: (index: number) => {
        setActiveIndex((current) => (index === current ? current + 1 : current))
      },
      activeIndex,
      sequenceStarted: sequenceHasStarted,
    }
  }, [sequence, activeIndex, sequenceHasStarted])

  const wrappedChildren = useMemo(() => {
    if (!sequence) return children
    const array = Children.toArray(children)
    return array.map((child, index) => (
      <ItemIndexContext.Provider key={index} value={index}>
        {child as React.ReactNode}
      </ItemIndexContext.Provider>
    ))
  }, [children, sequence])

  const content = (
    <div
      ref={containerRef}
      className={cn(
        "border-border bg-background z-0 h-full max-h-[400px] w-full max-w-lg rounded-xl border",
        className
      )}
    >
      <div className="border-border flex flex-col gap-y-2 border-b p-4">
        <div className="flex flex-row gap-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      <pre className="p-4">
        <code className="grid gap-y-1 overflow-auto">{wrappedChildren}</code>
      </pre>
    </div>
  )

  if (!sequence) return content

  return (
    <SequenceContext.Provider value={contextValue}>
      {content}
    </SequenceContext.Provider>
  )
}

// ============================================================================
// 终端风格聊天组件 - 保持原始终端样式，支持聊天功能
// ============================================================================

interface TerminalChatProps {
  messages: ChatMessage[]
  className?: string
  showPrompt?: boolean
  currentPrompt?: string
  isTyping?: boolean
}

export const TerminalChat = ({
  messages,
  className,
  showPrompt = true,
  currentPrompt = "$ ",
  isTyping = false,
}: TerminalChatProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // 格式化消息为终端风格，保持原始样式
  const formatMessage = (message: ChatMessage) => {
    if (message.loading) {
      return (
        <div className="text-green-400">
          <span className="text-blue-400">AI</span> <span className="text-yellow-400">~</span> <span className="animate-pulse">▊</span>
        </div>
      )
    }

    if (message.type === 'user') {
      return (
        // user 消息：靠右显示（终端风格保持不变，只调整对齐方式）
        <div className="flex justify-end">
          <div className="w-fit max-w-[80%] text-right text-green-400">
            {message.content} <span className="text-yellow-400">~</span>{" "}
            <span className="text-cyan-400">user</span>
          </div>
        </div>
      )
    } else {
      // AI消息 - 支持Markdown但保持终端风格
      return (
        <div className="text-green-400">
          <div className="flex flex-col gap-1">
            <div>
              <span className="text-blue-400">AI</span> <span className="text-yellow-400">~</span>
            </div>
            <div className="ml-4">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="bg-black border border-gray-600 rounded p-2 my-2 font-mono">
                        <div className="text-xs text-gray-500 mb-1">{match[1]}</div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="bg-transparent! p-0!"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-800 px-1 py-0.5 rounded text-green-300 font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <div className="mb-1">{children}</div>,
                  strong: ({ children }) => <span className="text-white font-bold">{children}</span>,
                  em: ({ children }) => <span className="text-yellow-300 italic">{children}</span>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      className={cn(
        // 外层：限制最大高度 + overflow-hidden，避免内容把卡片“撑破/溢出”
        // 使用 flex-col 让内容区占满剩余空间，滚动发生在内容区
        // 这里不再使用 shadcn 的 bg-background / border-border（它们依赖全局主题变量）
        // 直接使用项目的深色背景，保证在未开启 dark theme 时也能保持一致视觉
        "z-0 flex w-full max-w-lg flex-col overflow-hidden rounded-xl  bg-[#18181b] font-mono text-sm max-h-[570px]",
        className
      )}
    >
      {/* 终端标题栏 - 保持原始样式 */}
      <div className="flex flex-col gap-y-2 border-b border-neutral-800/60 p-4">
        <div className="flex flex-row gap-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* 终端内容区域 - 保持原始样式 */}
      <div
        ref={containerRef}
        className="terminal-scroll flex-1 overflow-y-auto p-4"
      >
        {/* 欢迎信息 */}
        <div className="text-green-400 mb-4">
          <div>Welcome to AI Code Generator Terminal</div>
          <div className="text-gray-500">Type your requirements and get AI-generated code instantly.</div>
          <div className="text-gray-500 mt-2">═══════════════════════════════════════════════════════════════</div>
        </div>

        {/* 消息列表 */}
        <div className="grid gap-y-1">
          {messages.map((message) => (
            <div key={message.id} className="mb-3">
              {formatMessage(message)}
            </div>
          ))}
        </div>

        {/* 打字指示器 */}
        {isTyping && !messages.some(msg => msg.loading) && (
          <div className="text-green-400">
            <span className="text-blue-400">AI</span> <span className="text-yellow-400">~</span> <span className="animate-pulse">▊</span>
          </div>
        )}

        {/* 当前提示符 */}
        {showPrompt && !isTyping && (
          <div className="text-green-400 mt-2">
            <span className="text-cyan-400">{currentPrompt}</span><span className="animate-pulse">█</span>
          </div>
        )}
      </div>
    </div>
  )
}
