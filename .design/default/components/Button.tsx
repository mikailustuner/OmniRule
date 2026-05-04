import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    borderRadius: '6px',
    transition: 'background-color 150ms ease, opacity 150ms ease, transform 100ms ease',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
  },
  variant: {
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1.5px solid #3b82f6',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#111827',
    },
    destructive: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
  },
  size: {
    sm: { padding: '6px 12px', fontSize: '14px', lineHeight: 1.4 },
    md: { padding: '10px 20px', fontSize: '16px', lineHeight: 1.5 },
    lg: { padding: '14px 28px', fontSize: '18px', lineHeight: 1.5 },
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        ...styles.base,
        ...styles.variant[variant],
        ...styles.size[size],
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
          aria-hidden="true"
        />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
