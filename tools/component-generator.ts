#!/usr/bin/env tsx
/**
 * OmniRule Component Generator
 *
 * Reads .design/{domain}/tokens/ and generates React + Tailwind components.
 * Falls back to sensible defaults when no extracted tokens exist.
 *
 * Usage:
 *   npm run tool:generate -- <domain>
 *   npm run tool:generate -- --list          # show extracted design sources
 *   npm run tool:generate -- --all           # generate from all extracted domains
 *
 * Output: .design/{domain}/components/  (TSX files + index.ts barrel)
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorTokens {
  primary: string[];
  background: string[];
  text: string[];
  border: string[];
  accent: string[];
}

interface TypographyTokens {
  fontFamilies: string[];
  fontSizes: number[];
  fontWeights: number[];
}

interface SpacingTokens {
  values: number[];
}

interface EffectsTokens {
  borderRadius: string[];
  boxShadow: string[];
}

interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  effects: EffectsTokens;
}

// ─── Default tokens (used when no extracted design exists) ────────────────────

const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: ['#3b82f6', '#2563eb', '#1d4ed8'],
    background: ['#ffffff', '#f9fafb', '#f3f4f6'],
    text: ['#111827', '#374151', '#6b7280'],
    border: ['#e5e7eb', '#d1d5db'],
    accent: ['#10b981', '#f59e0b', '#ef4444'],
  },
  typography: {
    fontFamilies: ['Inter', 'system-ui', 'sans-serif'],
    fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
    fontWeights: [400, 500, 600, 700],
  },
  spacing: { values: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
  effects: {
    borderRadius: ['4px', '6px', '8px', '12px', '16px', '9999px'],
    boxShadow: [
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    ],
  },
};

// ─── Token loader ─────────────────────────────────────────────────────────────

function loadTokens(domain: string): DesignTokens {
  const tokensDir = path.join(process.cwd(), '.design', domain, 'tokens');
  const tokens = { ...DEFAULT_TOKENS };

  function tryLoad<T>(file: string): T | null {
    const p = path.join(tokensDir, file);
    if (!fs.existsSync(p)) return null;
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as T; } catch { return null; }
  }

  const colors = tryLoad<{ palette: string[]; byRole: Record<string, string[]> }>('colors.json');
  if (colors) {
    const role = colors.byRole ?? {};
    if (role.primary?.length) tokens.colors.primary = role.primary.slice(0, 3);
    if (role.background?.length) tokens.colors.background = role.background.slice(0, 3);
    if (role.text?.length) tokens.colors.text = role.text.slice(0, 3);
    if (role.border?.length) tokens.colors.border = role.border.slice(0, 2);
    if (colors.palette?.length > 3) tokens.colors.accent = colors.palette.slice(-3);
  }

  const typo = tryLoad<{ fontFamilies: string[]; fontSizes: number[]; fontWeights: number[] }>('typography.json');
  if (typo) {
    if (typo.fontFamilies?.length) tokens.typography.fontFamilies = typo.fontFamilies;
    if (typo.fontSizes?.length) tokens.typography.fontSizes = typo.fontSizes;
    if (typo.fontWeights?.length) tokens.typography.fontWeights = typo.fontWeights;
  }

  const effects = tryLoad<{ borderRadius: string[]; boxShadow: string[] }>('effects.json');
  if (effects) {
    if (effects.borderRadius?.length) tokens.effects.borderRadius = effects.borderRadius;
    if (effects.boxShadow?.length) tokens.effects.boxShadow = effects.boxShadow;
  }

  return tokens;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function px(val: string | number): string {
  if (typeof val === 'number') return `${val}px`;
  return val;
}

function fontStack(families: string[]): string {
  return families.map(f => (f.includes(' ') ? `'${f}'` : f)).join(', ');
}

// ─── Component generators ─────────────────────────────────────────────────────

function generateButton(t: DesignTokens): string {
  const primary = t.colors.primary[0] ?? '#3b82f6';
  const primaryHover = t.colors.primary[1] ?? '#2563eb';
  const textOnDark = '#ffffff';
  const radius = t.effects.borderRadius[1] ?? '6px';
  const font = fontStack(t.typography.fontFamilies);

  return `import React from 'react';

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
    fontFamily: '${font}',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    borderRadius: '${radius}',
    transition: 'background-color 150ms ease, opacity 150ms ease, transform 100ms ease',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
  },
  variant: {
    primary: {
      backgroundColor: '${primary}',
      color: '${textOnDark}',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '${primary}',
      border: '1.5px solid ${primary}',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '${t.colors.text[0] ?? '#111827'}',
    },
    destructive: {
      backgroundColor: '${t.colors.accent[2] ?? '#ef4444'}',
      color: '#ffffff',
    },
  },
  size: {
    sm: { padding: '6px 12px', fontSize: '${t.typography.fontSizes[1] ?? 14}px', lineHeight: 1.4 },
    md: { padding: '10px 20px', fontSize: '${t.typography.fontSizes[2] ?? 16}px', lineHeight: 1.5 },
    lg: { padding: '14px 28px', fontSize: '${t.typography.fontSizes[3] ?? 18}px', lineHeight: 1.5 },
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
`;
}

function generateCard(t: DesignTokens): string {
  const bg = t.colors.background[0] ?? '#ffffff';
  const border = t.colors.border[0] ?? '#e5e7eb';
  const radius = t.effects.borderRadius[2] ?? '8px';
  const shadow = t.effects.boxShadow[1] ?? '0 1px 3px 0 rgb(0 0 0 / 0.1)';
  const textPrimary = t.colors.text[0] ?? '#111827';
  const textMuted = t.colors.text[2] ?? '#6b7280';

  return `import React from 'react';

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
        backgroundColor: '${bg}',
        borderRadius: '${radius}',
        border: bordered ? '1px solid ${border}' : 'none',
        boxShadow: elevated ? '${shadow}' : 'none',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        ...style,
      }}
    >
      {header && (
        <div style={{ borderBottom: '1px solid ${border}', padding: \`\${p}px\` }}>
          {header}
        </div>
      )}

      <div style={{ padding: \`\${p}px\` }}>
        {title && (
          <h3 style={{
            margin: '0 0 6px 0',
            fontSize: '${t.typography.fontSizes[3] ?? 18}px',
            fontWeight: ${t.typography.fontWeights[2] ?? 600},
            color: '${textPrimary}',
            lineHeight: 1.3,
          }}>
            {title}
          </h3>
        )}
        {description && (
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '${t.typography.fontSizes[1] ?? 14}px',
            color: '${textMuted}',
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
          borderTop: '1px solid ${border}',
          padding: \`\${Math.round(p * 0.7)}px \${p}px\`,
          backgroundColor: '${t.colors.background[1] ?? '#f9fafb'}',
          fontSize: '${t.typography.fontSizes[1] ?? 14}px',
          color: '${textMuted}',
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
`;
}

function generateInput(t: DesignTokens): string {
  const bg = t.colors.background[0] ?? '#ffffff';
  const border = t.colors.border[0] ?? '#e5e7eb';
  const borderFocus = t.colors.primary[0] ?? '#3b82f6';
  const radius = t.effects.borderRadius[1] ?? '6px';
  const textPrimary = t.colors.text[0] ?? '#111827';
  const textMuted = t.colors.text[2] ?? '#6b7280';
  const font = fontStack(t.typography.fontFamilies);

  return `import React, { useState } from 'react';

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
  const inputId = id ?? \`input-\${Math.random().toString(36).slice(2, 7)}\`;

  const resolvedVariant = error ? 'error' : variant;
  const borderColor = resolvedVariant === 'error'
    ? '${t.colors.accent[2] ?? '#ef4444'}'
    : resolvedVariant === 'success'
    ? '${t.colors.accent[0] ?? '#10b981'}'
    : focused ? '${borderFocus}' : '${border}';

  const sizeMap = {
    sm: { padding: '6px 10px', fontSize: ${t.typography.fontSizes[1] ?? 14} },
    md: { padding: '10px 14px', fontSize: ${t.typography.fontSizes[2] ?? 16} },
    lg: { padding: '13px 16px', fontSize: ${t.typography.fontSizes[3] ?? 18} },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '${t.typography.fontSizes[1] ?? 14}px',
            fontWeight: ${t.typography.fontWeights[1] ?? 500},
            color: '${textPrimary}',
            fontFamily: '${font}',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftAddon && (
          <span style={{
            position: 'absolute', left: 10, color: '${textMuted}',
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
            backgroundColor: '${bg}',
            border: \`1.5px solid \${borderColor}\`,
            borderRadius: '${radius}',
            fontFamily: '${font}',
            color: '${textPrimary}',
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow: focused ? \`0 0 0 3px \${borderColor}33\` : 'none',
            paddingLeft: leftAddon ? 36 : sizeMap[size].padding.split(' ')[1],
            paddingRight: rightAddon ? 36 : sizeMap[size].padding.split(' ')[1],
            paddingTop: sizeMap[size].padding.split(' ')[0],
            paddingBottom: sizeMap[size].padding.split(' ')[0],
            fontSize: \`\${sizeMap[size].fontSize}px\`,
            ...style,
          }}
        />

        {rightAddon && (
          <span style={{
            position: 'absolute', right: 10, color: '${textMuted}',
            display: 'flex', alignItems: 'center',
          }}>
            {rightAddon}
          </span>
        )}
      </div>

      {(hint || error) && (
        <span style={{
          fontSize: '${t.typography.fontSizes[0] ?? 12}px',
          color: error ? '${t.colors.accent[2] ?? '#ef4444'}' : '${textMuted}',
        }}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
};

export default Input;
`;
}

function generateBadge(t: DesignTokens): string {
  const radius = t.effects.borderRadius[t.effects.borderRadius.length - 1] ?? '9999px';

  return `import React from 'react';

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
  default:     { backgroundColor: '${t.colors.background[2] ?? '#f3f4f6'}', color: '${t.colors.text[1] ?? '#374151'}' },
  primary:     { backgroundColor: '${t.colors.primary[0] ?? '#3b82f6'}1a', color: '${t.colors.primary[1] ?? '#2563eb'}' },
  success:     { backgroundColor: '${t.colors.accent[0] ?? '#10b981'}1a', color: '#065f46' },
  warning:     { backgroundColor: '${t.colors.accent[1] ?? '#f59e0b'}1a', color: '#92400e' },
  destructive: { backgroundColor: '${t.colors.accent[2] ?? '#ef4444'}1a', color: '#991b1b' },
  outline:     { backgroundColor: 'transparent', color: '${t.colors.text[1] ?? '#374151'}', border: '1px solid ${t.colors.border[0] ?? '#e5e7eb'}' },
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
        borderRadius: '${radius}',
        fontWeight: ${t.typography.fontWeights[1] ?? 500},
        fontSize: size === 'sm' ? '${t.typography.fontSizes[0] ?? 12}px' : '${t.typography.fontSizes[1] ?? 14}px',
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
`;
}

function generateTypography(t: DesignTokens): string {
  const font = fontStack(t.typography.fontFamilies);
  const sizes = t.typography.fontSizes;
  const weights = t.typography.fontWeights;
  const textPrimary = t.colors.text[0] ?? '#111827';
  const textMuted = t.colors.text[2] ?? '#6b7280';

  return `import React from 'react';

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
  h1:   { fontSize: '${sizes[7] ?? 48}px', fontWeight: ${weights[3] ?? 700}, lineHeight: 1.15, letterSpacing: '-0.02em' },
  h2:   { fontSize: '${sizes[6] ?? 32}px', fontWeight: ${weights[3] ?? 700}, lineHeight: 1.2, letterSpacing: '-0.01em' },
  h3:   { fontSize: '${sizes[4] ?? 20}px', fontWeight: ${weights[2] ?? 600}, lineHeight: 1.3 },
  h4:   { fontSize: '${sizes[3] ?? 18}px', fontWeight: ${weights[2] ?? 600}, lineHeight: 1.4 },
  lead: { fontSize: '${sizes[3] ?? 18}px', fontWeight: ${weights[0] ?? 400}, lineHeight: 1.6, color: '${textMuted}' },
  body: { fontSize: '${sizes[2] ?? 16}px', fontWeight: ${weights[0] ?? 400}, lineHeight: 1.7 },
  small:{ fontSize: '${sizes[1] ?? 14}px', fontWeight: ${weights[0] ?? 400}, lineHeight: 1.5 },
  muted:{ fontSize: '${sizes[1] ?? 14}px', fontWeight: ${weights[0] ?? 400}, lineHeight: 1.5, color: '${textMuted}' },
};

const colorMap: Record<TextColor, string> = {
  default:     '${textPrimary}',
  muted:       '${textMuted}',
  primary:     '${t.colors.primary[0] ?? '#3b82f6'}',
  success:     '${t.colors.accent[0] ?? '#10b981'}',
  warning:     '${t.colors.accent[1] ?? '#f59e0b'}',
  destructive: '${t.colors.accent[2] ?? '#ef4444'}',
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
        fontFamily: '${font}',
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
`;
}

function generateIndex(domain: string): string {
  return `// Generated by OmniRule component-generator — domain: ${domain}
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Badge } from './Badge';
export { Text } from './Text';
`;
}

function generateReadme(domain: string, t: DesignTokens): string {
  const primary = t.colors.primary[0] ?? '#3b82f6';
  const font = fontStack(t.typography.fontFamilies);

  return `# Generated Components — ${domain}

> Auto-generated by OmniRule \`component-generator\` from design tokens.
> Source tokens: \`.design/${domain}/tokens/\`

## Components

| Component | Props | Description |
|---|---|---|
| \`Button\` | variant, size, loading, leftIcon, rightIcon | CTA and action buttons |
| \`Card\` | title, description, header, footer, actions, padding, elevated | Content container |
| \`Input\` | label, hint, error, variant, size, leftAddon, rightAddon | Form input field |
| \`Badge\` | variant, size, dot | Status indicators |
| \`Text\` | as, variant, color, truncate | Typography system |

## Design Tokens Used

| Token | Value |
|---|---|
| Primary color | \`${primary}\` |
| Font family | \`${font}\` |
| Base radius | \`${t.effects.borderRadius[1] ?? '6px'}\` |
| Text primary | \`${t.colors.text[0] ?? '#111827'}\` |

## Usage

\`\`\`tsx
import { Button, Card, Input, Badge, Text } from './${domain}/components';

// Button variants
<Button variant="primary">Save</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button loading>Saving...</Button>

// Card
<Card title="My Card" description="Description text" elevated>
  <p>Content here</p>
</Card>

// Input
<Input label="Email" hint="We'll never share your email" type="email" fullWidth />
<Input label="Name" error="Name is required" fullWidth />

// Badge
<Badge variant="success" dot>Active</Badge>
<Badge variant="warning">Pending</Badge>

// Text
<Text variant="h1">Heading</Text>
<Text variant="body" color="muted">Subtitle text</Text>
\`\`\`

## Regenerating

\`\`\`bash
npm run tool:generate -- ${domain}
\`\`\`
`;
}

// ─── Generator orchestration ──────────────────────────────────────────────────

function generate(domain: string): void {
  console.log(`\n[ComponentGen] Generating components for domain: ${domain}`);

  const tokens = loadTokens(domain);
  const hasExtracted = fs.existsSync(path.join(process.cwd(), '.design', domain, 'tokens'));

  if (hasExtracted) {
    console.log('  Using extracted design tokens');
  } else {
    console.log('  No tokens found — using defaults (run npm run tool:extract to extract from URL)');
  }

  const outDir = path.join(process.cwd(), '.design', domain, 'components');
  fs.mkdirSync(outDir, { recursive: true });

  const files = [
    ['Button.tsx', generateButton(tokens)],
    ['Card.tsx', generateCard(tokens)],
    ['Input.tsx', generateInput(tokens)],
    ['Badge.tsx', generateBadge(tokens)],
    ['Text.tsx', generateTypography(tokens)],
    ['index.ts', generateIndex(domain)],
    ['README.md', generateReadme(domain, tokens)],
  ] as const;

  for (const [filename, content] of files) {
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${filename}`);
  }

  console.log(`\n[ComponentGen] Done — .design/${domain}/components/ (${files.length} files)`);
  console.log(`  Import: import { Button, Card, Input, Badge, Text } from '.design/${domain}/components'`);
}

function listDomains(): void {
  const designDir = path.join(process.cwd(), '.design');
  if (!fs.existsSync(designDir)) {
    console.log('[ComponentGen] No extracted designs found. Run: npm run tool:extract -- <URL>');
    return;
  }

  const domains = fs.readdirSync(designDir).filter(d =>
    fs.statSync(path.join(designDir, d)).isDirectory()
  );

  if (domains.length === 0) {
    console.log('[ComponentGen] No domains extracted yet.');
    return;
  }

  console.log('\n[ComponentGen] Available domains:');
  for (const d of domains) {
    const hasTokens = fs.existsSync(path.join(designDir, d, 'tokens'));
    console.log(`  ${hasTokens ? '✓' : '○'} ${d}${hasTokens ? ' (has tokens)' : ''}`);
  }
  console.log('\nGenerate: npm run tool:generate -- <domain>');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [,, ...args] = process.argv;

if (args[0] === '--list' || args[0] === 'list') {
  listDomains();
} else if (args[0] === '--all' || args[0] === 'all') {
  const designDir = path.join(process.cwd(), '.design');
  if (fs.existsSync(designDir)) {
    const domains = fs.readdirSync(designDir).filter(d =>
      fs.statSync(path.join(designDir, d)).isDirectory()
    );
    for (const domain of domains) generate(domain);
  } else {
    console.log('[ComponentGen] No .design/ directory found.');
  }
} else if (args[0]) {
  generate(args[0]);
} else {
  // Default: generate with 'default' domain using default tokens
  generate('default');
}
