---
name: llm-integration
description: "LLM Integration: API patterns, self-hosted models, fallback strategies, cost optimization." 
triggers:
  extensions: [".py", ".ts"]
  directories: ["ai/", "llm/", "models/"]
  keywords: ["openai", "anthropic", "llm", "gpt", "chatgpt", "claude", "gemini", "huggingface"]
auto_load_when: "Integrating LLMs or building AI-powered features"
agent: ai-engineer
tools: ["Read", "Write", "Bash"]
---

# LLM Integration Patterns

**Focus:** API patterns, self-hosted models, reliability, cost optimization

## 1. LLM Selection Decision

```
Which LLM to use?
├── Simple tasks (summarization, classification) → Small/fast models
│   └── GPT-4o-mini, Claude Haiku, Gemini Flash
│
├── Complex reasoning → Large models
│   └── GPT-4, Claude Sonnet/Opus, Gemini Pro
│
├── Code generation → Specialized models
│   └── Codex, CodeLlama, Claude
│
├── Latency critical → Streaming + small model
│
└── Cost critical → Batch processing + smaller model
```

---

## 2. API Integration Patterns

```
LLM API Call Flow:
├── Request preparation
│   ├── Validate input (max length, content filtering)
│   ├── Build messages with system prompt
│   └── Add few-shot examples if needed
│
├── API call with retry
│   ├── Exponential backoff (1s, 2s, 4s, max 3 retries)
│   ├── Timeout: 30s for sync, handle async
│   └── Fallback to backup model on failure
│
├── Response processing
│   ├── Parse JSON if structured output needed
│   ├── Validate response format
│   └── Handle rate limits (429) with backoff
│
└── Error handling
    ├── Distinguish API error vs network error
    ├── Log for debugging (no sensitive data)
    └── Return graceful degradation
```

**Pattern - Structured Output:**
```python
# BAD - parsing unstructured text
response = llm.chat("Extract name and email from: " + text)
# Parse with regex = fragile

# GOOD - use structured output
response = llm.chat(
    messages,
    response_format={"type": "json_object", "schema": UserSchema}
)
```

---

## 3. Self-Hosted vs API

```
When to self-host:
├── Data privacy/sovereignty (healthcare, legal)
├── Custom fine-tuned models needed
├── Very high volume (cost optimization)
└── Offline/edge deployment

When to use API:
├── Rapid prototyping
├── General-purpose models sufficient
└── Low volume (< 1M tokens/day)

Hybrid: API for prod, self-hosted for sensitive data
```

---

## 4. Cost Optimization

```
Cost Components:
├── Input tokens (prompt)
│   ├── Truncate long documents
│   ├── Use summaries instead of full text
│   └── Cache common system prompts
│
├── Output tokens (completion)
│   ├── Max tokens limit for predictable costs
│   ├── Stream to show progress (perceived faster)
│   └── Temperature = 0 for deterministic tasks
│
└── API calls
    ├── Batch requests when possible
    └── Implement response caching for similar queries
```

---

## Key Patterns

1. **Fallback chain** - Primary → Backup → Third-party
2. **Streaming-first** - Show tokens as they arrive
3. **Structured output** - Use JSON schema, not parsing
4. **Cost tracking** - Log token usage per request
5. **Circuit breaker** - Stop calling after N failures

---

## Anti-Patterns

```
❌ No retry logic — single API call without handling failures
✅ Implement exponential backoff with circuit breaker

❌ Hardcoding API keys in source code
✅ Use environment variables, secret managers

❌ Sending unlimited context — context window has limits + cost
✅ Truncate, summarize, or use RAG to retrieve relevant chunks

❌ No response validation — blindly trusting LLM output
✅ Validate structure, sanitize before use

❌ Ignoring rate limits — getting 429 errors
✅ Implement backoff, use multiple API keys if needed
```

---

## Quick Reference

| Scenario | Solution | Tool/Pattern |
|---|---|---|
| Chat interface | Streaming response | SSE, WebSocket |
| Document Q&A | RAG pipeline | LangChain, LlamaIndex |
| Data extraction | Structured output | JSON schema validation |
| High volume | Response caching | Redis, semantic cache |
| Low latency | Small model + caching | GPT-4o-mini |
| Sensitive data | Self-hosted | Ollama, vLLM |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
