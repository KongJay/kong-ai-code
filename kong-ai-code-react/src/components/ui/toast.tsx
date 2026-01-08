import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300",
        {
          "bg-green-500 text-white": type === "success",
          "bg-red-500 text-white": type === "error",
          "bg-blue-500 text-white": type === "info",
        }
      )}
    >
      {message}
    </div>
  );
}

// 简单的消息管理
let toastQueue: Array<{ id: number; message: string; type: "success" | "error" | "info" }> = [];
let toastId = 0;

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  const id = ++toastId;
  toastQueue.push({ id, message, type });

  // 这里可以触发一个全局的状态更新来显示toast
  // 为了简化，我们直接创建一个临时的toast元素
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
    type === "success" ? "bg-green-500" :
    type === "error" ? "bg-red-500" : "bg-blue-500"
  } text-white`;
  toastElement.textContent = message;

  document.body.appendChild(toastElement);

  setTimeout(() => {
    toastElement.remove();
  }, 3000);
}

// 导出简化版本
export const message = {
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  info: (msg: string) => showToast(msg, "info"),
};
