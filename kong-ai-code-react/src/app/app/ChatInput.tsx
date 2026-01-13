import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  isGenerating: boolean;
  isOwner: boolean;
  placeholder: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  isGenerating,
  isOwner,
  placeholder,
  onInputChange,
  onSend
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-neutral-800">
      <div className="flex gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={isOwner ? placeholder : "无法在别人的作品下对话"}
          disabled={isGenerating || !isOwner}
          className="flex-1 min-h-[60px] max-h-[120px] bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={onSend}
          disabled={isGenerating || !inputValue.trim() || !isOwner}
          className="h-auto px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
