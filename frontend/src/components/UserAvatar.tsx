import React, { useState } from 'react';
import { User } from '../types';

interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  borderColor?: string;
  onClick?: () => void;
  alt?: string;
}

export const getInitials = (nameOrEmail?: string): string => {
  if (!nameOrEmail) return 'YT';
  const clean = nameOrEmail.trim().replace(/^@/, '');
  const parts = clean.split(/[_\s.-]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const getSafeAvatarUrl = (user?: Partial<User> | null): string => {
  const seed = encodeURIComponent(user?.email || user?.name || 'user');
  if (user?.avatar) {
    if (user.avatar.includes('googleusercontent.com') || user.avatar.startsWith('data:') || user.avatar.startsWith('/')) {
      return user.avatar;
    }
    if (user.avatar.includes('dicebear.com')) {
      // Migrate any dicebear URL to 9.x avataaars svg
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    }
    return user.avatar;
  }
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 36,
  style,
  className,
  borderColor,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(user?.name || user?.email);
  const avatarUrl = getSafeAvatarUrl(user);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        border: borderColor ? `2px solid ${borderColor}` : '1.5px solid var(--primary-neon, #0ea5e9)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(14, 165, 233, 0.22)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        position: 'relative',
        ...style,
      }}
    >
      {!hasError ? (
        <img
          src={avatarUrl}
          alt=""
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: `${Math.max(11, Math.round(size * 0.38))}px`,
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.03em',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};
