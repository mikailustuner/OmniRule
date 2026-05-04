# Command: Mobile — React Native & Expo Specialist

Cross-platform mobile development with React Native and Expo.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax.

---

## Invocation

```
/mobile scaffold screen HomeScreen
/mobile scaffold component BottomSheet
/mobile navigation setup expo-router
/mobile build eas preview
/mobile audit                    — audit for mobile-specific issues
```

---

## Scaffold Mode

Generates platform-aware components:
- iOS/Android conditional logic
- `expo-secure-store` for credentials
- `FlashList` for performant lists
- `blurHash` placeholders for images
- Proper TypeScript types for Expo SDK

## Navigation Setup

Scaffolds `expo-router` structure:
```
app/
  (auth)/
    login.tsx
    register.tsx
  (app)/
    _layout.tsx
    index.tsx
    [id].tsx
```

## Audit Mode

Checks for:
- Hardcoded API keys in bundle
- Missing secure storage for credentials
- Unoptimized image loading
- Missing error boundaries
- Platform-specific accessibility issues

---

## Agent Execution Protocol

1. Activate `mobile-ops` agent (load `agents/MOBILE_AGENT.md`)
2. Load skills: `mobile-patterns`, `react-expert`, `typescript-expert`
3. Parse subcommand from `$ARGUMENTS`
4. Always check `app.json` + `package.json` for Expo SDK version
5. Activate `security-officer` for credential handling

---

*OmniRule — agents/MOBILE_AGENT.md*
