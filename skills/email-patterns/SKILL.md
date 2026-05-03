---
name: email-patterns
description: "Email: Transactional email, templates, delivery patterns, feedback loops."
---

# Email Patterns

**Focus:** Delivery, templates, reliability

---

## 1. When to Use Email

```
When email is appropriate:

├── Transactional
    && Order confirmation
    && Password reset
    && Account notifications
│
├── Notifications
    && Alerts and monitoring
    && Scheduled reports
    && Activity digests
│
└── Marketing (with consent)
    └── Welcome series
    └── Product updates
    └── Opt-in required
```

```
When NOT to use email:

├── Real-time communication
    && Chat is better
    && Users expect instant
│
├── User-to-user messaging
    └── In-app messaging
    || Don't use email for this
│
└── Sensitive alerts
    && Security: in-app + push preferred
    && Don't rely on email alone
```

---

## 2. Email Service Selection

```
When to use what:

├── SendGrid/Mailgun/SES
    && Transactional email
    && Good deliverability
    && API-based
│
├── Postmark
    && Transactional focus
    && High deliverability
    && Good for startups
│
├── Mailchimp/Sendinblue
    && Marketing emphasis
    && Templates, campaigns
    && Less for transactional
│
└── Self-hosted (rarely)
    && Complete control
    && High cost, complexity
    && Only when needed
```

---

## 3. Template Strategy

```
When to use templates:

├── Template engine (SendGrid, Handlebars)
    && Dynamic content needed
    && Multiple email types
    && Non-technical can edit
│
├── Static HTML
    && Simple emails
    && No personalization
    || Lower flexibility
│
└── Code-generated
    && Complex logic
    && Full control
    && Harder to maintain
```

```
Template best practices:

├── Plain text version always
├── Responsive design (mobile)
├── Fallback fonts
├── Clear unsubscribe (required by law)
└── Physical address (required by law)
```

---

## 4. Delivery Reliability

```
How to ensure delivery:

├── Verification
    && SPF, DKIM, DMARC set up
    && Domain verified
    && Test with mail-tester.com
│
├── Error handling
    && Catch bounces
    && Suppress invalid emails
    && Track delivery status
│
├── Rate limiting
    && Respect provider limits
    && Batch sends
    && Exponential backoff on failure
│
└── Monitoring
    && Track open/click rates
    && Bounce rates
    && Deliverability issues
```

---

## 5. Feedback Loop

```
What to track:

├── Delivery metrics
    && Sent, delivered, bounced
    && By email type
│
├── Engagement
    && Open rate (with pixel tracking)
    && Click rate
    && Unsubscribe rate
│
├── Complaints
    && Spam reports
    && If high: review list quality
│
└── Time-based
    && Best send times
    && By user segment
```

```
When to act:

├── High bounce > 5%
    && Clean list
    || Verify addresses before send
│
├── Low engagement < 10% open
    && Review subject lines
    || Segment users differently
│
├── High complaints
    || Immediate list review
    || Consent verification
└── High unsubscribes
    || Too frequent?
    || Content not relevant?
```

---

## Key Patterns

1. **Transactional vs marketing** — Separate services, different rules
2. **Verify everything** — SPF/DKIM/DMARC
3. **Handle bounces** — Suppress invalid, track errors
4. **Monitor engagement** — Act on data
5. **Plain text fallback** — Always have