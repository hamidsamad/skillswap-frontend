import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

export default function UserAvatar({
  user,
  src,
  name,
  size = 'md',
  className = '',
  alt = 'User avatar'
}) {
  const [imgError, setImgError] = useState(false);

  // Determine avatar URL and display name from props or user object
  const avatarUrl = src !== undefined ? src : user?.avatar;
  const displayName = name || user?.name || 'User';

  // Extract up to 2 uppercase initials
  const getInitials = (n) => {
    if (!n) return 'SS';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Preset size styles
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
    xl: 'w-16 h-16 text-lg rounded-2xl',
    '2xl': 'w-24 h-24 text-2xl rounded-3xl',
    '3xl': 'w-28 h-28 text-3xl rounded-3xl'
  };

  const chosenSize = sizeMap[size] || sizeMap.md;
  const initials = getInitials(displayName);

  // If avatar URL is provided and has not errored
  if (avatarUrl && !imgError && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={displayName || alt}
        onError={() => setImgError(true)}
        className={`${chosenSize} object-cover border border-slate-200 dark:border-slate-700/80 shadow-sm ${className}`}
      />
    );
  }

  // Graceful, modern Pakistani brand gradient initials fallback (no forced dicebear)
  return (
    <div
      aria-label={displayName}
      className={`${chosenSize} bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-500 text-white font-extrabold flex items-center justify-center select-none shadow-sm border border-white/20 shrink-0 ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
