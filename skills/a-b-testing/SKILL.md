---
name: a-b-testing
description: "A/B Testing: Statistical significance, Test design, Result analysis, Segmentation, Conversion optimization."
triggers:
  files: ["ab-test.config.json", "experiments.json"]
  directories: ["experiments/", "tests/"]
  keywords: ["A/B test", "experiment", "statistical significance", "conversion", "variant"]
auto_load_when: "Designing or analyzing A/B tests for product improvements"
agent: platform-engineer
tools: ["Read", "Write", "Bash"]
---

# A/B Testing Patterns

**Focus:** Test design, statistical analysis, optimization

## 1. Test Design

```
Test Types:
├── Split URL Test       → /a vs /b (different pages)
├── Feature Flag Test   → Toggle feature on/off
├── Component Test      → Different component variants
├── Redirect Test       → Redirect to different landing pages
└── Multi-armed Bandit → Auto-optimize allocation

Test Structure:
{
  "id": "checkout-button-color",
  "name": "Checkout Button Color Test",
  "description": "Test red vs green checkout button",
  "status": "running",
  "startDate": "2024-01-01",
  "endDate": "2024-01-15",
  "traffic": 50,  // 50% of users
  "variants": [
    { "id": "control", "name": "Control (Blue)", "weight": 50 },
    { "id": "variant-a", "name": "Red Button", "weight": 25 },
    { "id": "variant-b", "name": "Green Button", "weight": 25 }
  ],
  "metrics": [
    { "name": "conversion_rate", "goal": "increase" },
    { "name": "revenue", "goal": "increase" }
  ]
}
```

---

## 2. Statistical Analysis

```
Sample Size Calculation:
n = (16 * σ²) / δ²

Where:
- σ = standard deviation
- δ = minimum detectable effect

Rule of Thumb:
├── 1000 visitors per variation minimum
├── Run for at least 1 week
├── Wait for statistical significance (p < 0.05)
└── Minimum 95% confidence level

Significance Calculation:
Control: 100 conversions / 10000 visitors = 1%
Variant: 130 conversions / 10000 visitors = 1.3%

Z-score = (p1 - p2) / sqrt(p*(1-p)*(1/n1 + 1/n2))
p = (c1 + c2) / (n1 + n2)

If Z > 1.96 → Significant at 95%

Confidence Intervals:
Conversion ± 1.96 * sqrt(conversion * (1 - conversion) / visitors)
```

---

## 3. Implementation

```
Client-side Assignment:
function assignVariant(userId: string, testId: string): string {
  const hash = simpleHash(`${userId}-${testId}`)
  const bucket = hash % 100

  if (bucket < 50) return 'control'
  if (bucket < 75) return 'variant-a'
  return 'variant-b'
}

Server-side Assignment:
app.get('/experiment/:testId', (req, res) => {
  const variant = assignVariant(req.userId, req.params.testId)
  res.json({ variant, testId: req.params.testId })
})

Tracking:
function trackExperiment(testId, variant, event) {
  analytics.track('Experiment Viewed', {
    experiment_id: testId,
    variant: variant,
    event: event
  })
}

Conversion:
function trackConversion(testId, variant, conversionType) {
  analytics.track('Experiment Conversion', {
    experiment_id: testId,
    variant: variant,
    conversion_type: conversionType,
    value: cartValue
  })
}
```

---

## 4. Result Analysis

```
Key Metrics:
├── Primary: Conversion rate, Revenue per visitor
├── Secondary: Time on site, Bounce rate, Cart value
└── Guardrail: Page load time, Error rate

Results Table:
| Variant | Visitors | Conversions | Rate | Lift | Significant |
|---------|----------|-------------|------|------|-------------|
| Control | 10,000   | 100         | 1.0% | -    | -           |
| Red     | 10,000   | 130         | 1.3% | +30% | Yes (p<0.05)|
| Green   | 10,000   | 110         | 1.1% | +10% | No          |

Segmentation:
├── By device: desktop, mobile, tablet
├── By source: organic, paid, social
├── By geography: US, EU, Asia
└── By behavior: new vs returning

Winner Decision:
├── Statistically significant improvement
├── No negative impact on guardrail metrics
├── Business impact justifies implementation cost
└── Replicable in production environment
```

---

## Key Patterns

1. **Define metrics upfront** — Primary and secondary metrics
2. **Calculate sample size** — Before starting test
3. **Wait for significance** — Don't stop early
4. **Segment results** — Look beyond aggregate
5. **Document learnings** — Even failed tests are valuable

---

## Anti-Patterns

```
❌ Stopping test early when looks good
✅ Wait for statistical significance

❌ Testing too many things at once
✅ One change per test

❌ Not calculating sample size
✅ Plan before starting

❌ Ignoring guardrail metrics
✅ Monitor performance, errors

❌ No documentation
✅ Document hypothesis and learnings

❌ Cherry-picking results
✅ Report all metrics, positive and negative
```

---

## Quick Reference

| Concept | Formula | Note |
|---|---|---|
| Conversion Rate | conversions / visitors | Primary metric |
| Lift | (variant - control) / control | Relative improvement |
| Statistical Significance | p < 0.05 | 95% confidence |
| Sample Size | n = 16σ²/δ² | Minimum visitors |
| Z-score | (p1-p2)/SE | Test statistic |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
