# Command: Security (Zero-Trust Audit and Implementation Protocol)

This SOP defines the mandatory security procedures for the OmniRule ecosystem. It ensures that every feature is designed and implemented with a security-first mindset, adhering to the principle of Least Privilege and Zero-Trust.

---

## 1. Threat Modeling and Design Review

Before implementation, a security analysis must be performed on the proposed architecture.

### 1.1 Data Sensitivity Mapping
- Identify all data points handled by the feature.
- Categorize data: **Public**, **Internal**, **Secret**, **PII** (Personally Identifiable Information).
- Define encryption requirements for data at rest and in transit.

### 1.2 Trust Boundaries
- Identify where data crosses from an untrusted source (User, External API) to a trusted system (Database, Internal Service).
- Define validation gates at every boundary.

---

## 2. Secure Implementation Standards

### 2.1 Input Sanitization and Validation
- **Mandatory:** Use `Zod`, `Yup`, or similar for strict runtime type checking.
- **Rule:** Trust nothing. Even internal service calls must validate their payloads.
- **Sanitization:** Escape all user-generated content before rendering (XSS protection).
- **SQL Injection:** Use parameterized queries via Prisma ORM. Raw SQL is strictly prohibited without Architect approval.

### 2.2 Authentication and Authorization (AuthN/AuthZ)
- **RBAC (Role-Based Access Control):** Every endpoint must check for the minimum required permissions.
- **Session Security:** Use HttpOnly, Secure, and SameSite cookies for session tokens.
- **JWT Best Practices:** Short expiration times, rotation of signing keys, and secure payload content.

---

## 3. Secret Management and Hygiene

### 3.1 Hardcoded Secret Prevention
- **Scan:** Use `gitleaks` or similar tools to check the codebase for patterns matching API keys, tokens, or passwords.
- **Storage:** All secrets must reside in `.env` files (local) or a secure Vault (production).
- **CI/CD:** Secrets must be injected as environment variables during the build/deploy phase.

### 3.2 Accidental Exposure Recovery
If a secret is committed to Git:
1.  **Immediate Rotation:** Revoke the exposed secret and generate a new one.
2.  **History Scrubbing:** Use `bfg-repo-cleaner` or `git filter-repo` to remove the secret from all commits.
3.  **Incident Report:** Document the exposure and update the prevention strategy.

---

## 4. API Security and Rate Limiting

### 4.1 Endpoint Protection
- **Rate Limiting:** Implement per-IP or per-User limits to prevent DoS/Brute-Force attacks.
- **CORS Policy:** Define strict Origins. Avoid `*` in production.
- **Security Headers:** Enforce `Content-Security-Policy`, `X-Frame-Options`, and `Strict-Transport-Security`.

### 4.2 Error Masking
- **Production:** Return generic error messages (e.g., "Internal Server Error") and a correlation ID.
- **Internal:** Log the full stack trace and sensitive context to a secure logging service (not the client).

---

## 5. Security Audit Checklist (The Pre-PR Gate)

- [ ] Have all inputs been validated with a schema?
- [ ] Is there any chance of SQL Injection or XSS?
- [ ] Are secrets managed via environment variables?
- [ ] Has the Least Privilege principle been applied to database/API access?
- [ ] Are logs free of sensitive user data (PII) or passwords?
- [ ] Has the `SecurityAgent` performed a specialized scan?

---

## 6. Dependency Security

### 6.1 Vulnerability Scanning
- Run `npm audit` or `snyk test` regularly.
- **Action:** Resolve any CRITICAL or HIGH vulnerabilities immediately.

### 6.2 Supply Chain Trust
- Avoid using obscure, low-maintenance packages for critical logic.
- Prefer audited, industry-standard libraries (e.g., `jose` for JWT, `argon2` for hashing).

---

## 7. Emergency Response Protocol

In the event of a detected vulnerability or breach:
1.  **Containment:** Disable the affected service or endpoint immediately.
2.  **Identification:** Use logs to trace the entry point and scope of impact.
3.  **Remediation:** Apply a surgical fix and verify with the `SecurityAgent`.
4.  **Post-Mortem:** Analyze why the guardrails failed and update this SOP.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
