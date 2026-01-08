import React from 'react';
import { Bot } from 'lucide-react';

interface AIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={`rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      <Bot className={`${iconSizeClasses[size]} text-white`} />
    </div>
  );
};
