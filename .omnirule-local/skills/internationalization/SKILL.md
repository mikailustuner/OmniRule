---
name: internationalization
description: "i18n architecture, pluralization rules, RTL support, and locale patterns for global applications."
---

# Internationalization Patterns

## 1. Architecture Decision

```
i18n strategy:
├── Library choice:
│   ├── i18next: Most popular, extensible
│   ├── react-intl: React-focused, messageformat
│   ├── formatjs: Modern, uses ICU
│   └── lingui: Compiler-based, small bundle
│
├── Translation source:
│   ├── JSON: Simple, key-value
│   ├── XLIFF: Industry standard, tooling
│   ├── gettext: GNU tools, Python ecosystem
│   └── ICU: Complex formatting, plural-aware
│
└── Integration:
    ├── Client-side: Most common, SEO concerns
    ├── Server-side: Better perf, SEO-friendly
    └── Hybrid: Detect, choose per-route
```

## 2. When to Use What

```
Client-side i18n when:
├── Single-page app
├── No SEO requirements
├── Fast initial page not critical
└── Most content is dynamic

Server-side i18n when:
├── SEO is critical
├── Static content dominates
├── Faster TTFB needed
└── Content in CMS

Hybrid i18n when:
├── Mix of static/dynamic content
├── Need best of both
└── Complex routing requirements
```

## 3. Pluralization Patterns

```
Plural rules (ICU):
├── One: English, German (singular)
├── Other: Most languages
├── Few: Polish, Russian (1,2,3,4; 5+)
├── Many: Arabic (0, 2-10, 11-26...)
├── Zero: Welsh, Scottish Gaelic
└── Two: Slovenian, Scottish Gaelic

Implementation:
├── Use library: {count, plural, one{# item} other{# items}}
├── NEVER: count + "item" concatenation
├── NEVER: count === 1 ? "item" : "items"
└── ALWAYS: Test with all plural forms
```

## 4. RTL Support

```
RTL languages:
├── Arabic, Hebrew, Persian, Urdu
├── Languages starting RTL (Tigrinya, etc.)
└── Mixed: UI LTR, content RTL

Layout patterns:
├── Logical properties: margin-inline-start, not margin-left
├── Flexbox: Works automatically
├── Grid: Start/end, not left/right
└── Icons: Mirror when meaningful (arrows, etc.)

Testing:
├── Check with Arabic/Hebrew strings
├── Verify icons, numbers, dates
└── Test form alignment
```

## 5. Locale Patterns

```
Locale selection:
├── Browser: navigator.language
├── URL: /en/, /ar/, query param
├── Cookie: Remember preference
├── Headers: Accept-Language
└── IP geolocation: Fallback

Locale format:
├── en-US: Language-REGION
├── Use: Language without region often sufficient
└── Detect: Use Locale.lookup()
```

## 6. Date/Number/Currency

```
Formatting libraries:
├── Intl (native): DateTimeFormat, NumberFormat
├── date-fns: Modular, tree-shakeable
├── dayjs: Lightweight, moment-compatible
└── luxon: Modern, timezone handling

Patterns:
├── NEVER: Manual date string construction
├── ALWAYS: Use Intl.DateTimeFormat
├── Currency: Use ISO 4217 codes
└── Numbers: Respect locale conventions
```

## 7. Content Translation Strategy

```
Translation approach:
├── Full: All text translated (high cost)
├── Partial: UI translated, content flagged
├── Pseudo-localization: Test layout
└── Key-based: Separate from content

Workflow:
├── Extract: Pull strings from code
├── Translate: External service or team
├── Validate: Context, length, markup
└── Deploy: CDN, sync, versioned
```

## 8. Fallback Strategy

```
Missing translation handling:
├── Fallback chain: ar -> en-US -> en -> key
├── Never show: raw translation key
├── Log missing: Track untranslated
├── Mark in UI: Visual indicator for QA

Language fallbacks:
├── Arabic users -> English
├── Chinese users -> English (if no Chinese)
└── Regional variants: es-ES -> es
```

## Key Patterns

1. **Externalize early** - Don't hardcode any user-facing strings
2. **Logical CSS** - Use inline-start/end, not left/right
3. **Test RTL** - Design for RTL from the start
4. **Plural properly** - Never concatenate count + string
5. **Format numbers/dates** - Never manually format
6. **Consider text expansion** - Some languages 30-40% longer