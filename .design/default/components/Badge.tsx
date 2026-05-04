import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default:     { backgroundColor: '#f3f4f6', color: '#374151' },
  primary:     { backgroundColor: '#3b82f61a', color: '#2563eb' },
  success:     { backgroundColor: '#10b9811a', color: '#065f46' },
  warning:     { backgroundColor: '#f59e0b1a', color: '#92400e' },
  destructive: { backgroundColor: '#ef44441a', color: '#991b1b' },
  outline:     { backgroundColor: 'transparent', color: '#374151', border: '1px solid #e5e7eb' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  style,
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: '9999px',
        fontWeight: 500,
        fontSize: size === 'sm' ? '12px' : '14px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
