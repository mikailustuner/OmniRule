import React, { useState } from 'react';

type InputVariant = 'default' | 'error' | 'success';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: InputVariant;
  size?: 'sm' | 'md' | 'lg';
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  variant = 'default',
  size = 'md',
  leftAddon,
  rightAddon,
  fullWidth = false,
  id,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

  const resolvedVariant = error ? 'error' : variant;
  const borderColor = resolvedVariant === 'error'
    ? '#ef4444'
    : resolvedVariant === 'success'
    ? '#10b981'
    : focused ? '#3b82f6' : '#e5e7eb';

  const sizeMap = {
    sm: { padding: '6px 10px', fontSize: 14 },
    md: { padding: '10px 14px', fontSize: 16 },
    lg: { padding: '13px 16px', fontSize: 18 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftAddon && (
          <span style={{
            position: 'absolute', left: 10, color: '#6b7280',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            {leftAddon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: fullWidth ? '100%' : 'auto',
            backgroundColor: '#ffffff',
            border: `1.5px solid ${borderColor}`,
            borderRadius: '6px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#111827',
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow: focused ? `0 0 0 3px ${borderColor}33` : 'none',
            paddingLeft: leftAddon ? 36 : sizeMap[size].padding.split(' ')[1],
            paddingRight: rightAddon ? 36 : sizeMap[size].padding.split(' ')[1],
            paddingTop: sizeMap[size].padding.split(' ')[0],
            paddingBottom: sizeMap[size].padding.split(' ')[0],
            fontSize: `${sizeMap[size].fontSize}px`,
            ...style,
          }}
        />

        {rightAddon && (
          <span style={{
            position: 'absolute', right: 10, color: '#6b7280',
            display: 'flex', alignItems: 'center',
          }}>
            {rightAddon}
          </span>
        )}
      </div>

      {(hint || error) && (
        <span style={{
          fontSize: '12px',
          color: error ? '#ef4444' : '#6b7280',
        }}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
};

export default Input;
