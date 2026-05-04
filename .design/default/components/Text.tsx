import React from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'muted' | 'lead';
type TextColor = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive';

interface TextProps {
  as?: keyof JSX.IntrinsicElements;
  variant?: TextVariant;
  color?: TextColor;
  truncate?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const variantMap: Record<TextVariant, React.CSSProperties> = {
  h1:   { fontSize: '48px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' },
  h2:   { fontSize: '32px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
  h3:   { fontSize: '20px', fontWeight: 600, lineHeight: 1.3 },
  h4:   { fontSize: '18px', fontWeight: 600, lineHeight: 1.4 },
  lead: { fontSize: '18px', fontWeight: 400, lineHeight: 1.6, color: '#6b7280' },
  body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.7 },
  small:{ fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
  muted:{ fontSize: '14px', fontWeight: 400, lineHeight: 1.5, color: '#6b7280' },
};

const colorMap: Record<TextColor, string> = {
  default:     '#111827',
  muted:       '#6b7280',
  primary:     '#3b82f6',
  success:     '#10b981',
  warning:     '#f59e0b',
  destructive: '#ef4444',
};

const defaultTag: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', lead: 'p', body: 'p', small: 'span', muted: 'span',
};

export const Text: React.FC<TextProps> = ({
  as,
  variant = 'body',
  color,
  truncate = false,
  children,
  style,
  className,
}) => {
  const Tag = (as ?? defaultTag[variant]) as React.ElementType;

  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: color ? colorMap[color] : colorMap.default,
        ...variantMap[variant],
        ...(truncate ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        } : {}),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default Text;
