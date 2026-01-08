import { create } from 'zustand';
import type { ChatHistory } from '@/types/api';

interface ChatState {
  chatHistory: ChatHistory[];
  setChatHistory: (history: ChatHistory[]) => void;
  addChatMessage: (message: ChatHistory) => void;
  clearChatHistory: () => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatHistory: [],
  setChatHistory: (history) => set({ chatHistory: history }),
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  clearChatHistory: () => set({ chatHistory: [] }),
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
}));
