import React from 'react';

interface UserAvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      <span className={`${textSizeClasses[size]} font-bold text-white`}>
        {(name || 'U').charAt(0).toUpperCase()}
      </span>
    </div>
  );
};
