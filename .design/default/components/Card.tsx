import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  header,
  footer,
  actions,
  padding = 'md',
  elevated = false,
  bordered = true,
  style,
  children,
  onClick,
}) => {
  const paddingMap = { none: 0, sm: 12, md: 20, lg: 32 };
  const p = paddingMap[padding];

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: bordered ? '1px solid #e5e7eb' : 'none',
        boxShadow: elevated ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : 'none',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        ...style,
      }}
    >
      {header && (
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: `${p}px` }}>
          {header}
        </div>
      )}

      <div style={{ padding: `${p}px` }}>
        {title && (
          <h3 style={{
            margin: '0 0 6px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.3,
          }}>
            {title}
          </h3>
        )}
        {description && (
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: 1.6,
          }}>
            {description}
          </p>
        )}
        {children}
        {actions && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {actions}
          </div>
        )}
      </div>

      {footer && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: `${Math.round(p * 0.7)}px ${p}px`,
          backgroundColor: '#f9fafb',
          fontSize: '14px',
          color: '#6b7280',
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
