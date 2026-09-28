import React, { useState } from 'react';

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username = 'Cinephile',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const firstLetter = (username.trim()[0] || 'U').toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  if (avatarUrl && avatarUrl.trim().length > 0 && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-full object-cover border border-white/20 shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-tr from-[#7b2cbf] via-[#00d2ff] to-[#ec4899] p-0.5 shadow-lg shadow-[#00d2ff]/20 flex-shrink-0 flex items-center justify-center ${className}`}
      title={username}
    >
      <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-black text-white select-none">
        <span className="text-[#00d2ff] font-black drop-shadow-[0_0_8px_rgba(0,210,255,0.8)] leading-none">
          {firstLetter}
        </span>
      </div>
    </div>
  );
};
