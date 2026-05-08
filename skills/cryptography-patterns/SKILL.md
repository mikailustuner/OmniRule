---
name: cryptography-patterns
description: "Cryptography: Encryption at rest, TLS, hashing, digital signatures, key management." 
triggers:
  extensions: [".py", ".ts", ".go"]
  directories: ["crypto/", "security/", "encryption/"]
  keywords: ["encryption", "crypto", "aes", "rsa", "tls", "ssl", "hash", "signature", "key", "hmac", "kms"]
auto_load_when: "Implementing encryption or cryptographic operations"
agent: security-expert
tools: ["Read", "Write", "Bash"]
---

# Cryptography Architecture Patterns

**Focus:** Encryption, hashing, key management, signatures

## 1. Encryption at Rest

```
Encryption at Rest:
├── Database
│   ├── Transparent encryption (AWS KMS, GCP KMS)
│   └── TDE (Transparent Data Encryption)
│   └── TLS to DB not enough (data still unencrypted on disk)
│
├── Object Storage (S3, GCS)
│   ├── Server-side encryption (default)
│   └── Customer-managed keys (CMK)
│   └── Client-side encryption (before upload)
│
├── File/Block Storage
│   ├── EBS, S3, Azure Disk Encryption
│   └── Encryption at host level
│
└── Application-level
    └── Encrypt specific fields (PII, secrets)
    └── Use envelope encryption
```

---

## 2. Encryption in Transit

```
TLS Implementation:
├── HTTPS everywhere
│   ├── SSL/TLS for all public endpoints
│   └── HTTP → redirect to HTTPS
│
├── Internal mTLS
│   ├── Service-to-service TLS
│   ├── Mutual authentication
│   └── SPIFFE/mTLS mesh
│
├── Certificate Management
│   ├── Short-lived certs (hours)
│   ├── Auto-rotation (Cert Manager)
│   └── ACM, Let's Encrypt
│
└── Protocol versions
    └── TLS 1.2 minimum, TLS 1.3 preferred
    └── Disable TLS 1.0, 1.1
```

---

## 3. Key Management

```
Key Management Patterns:
├── KMS (Key Management Service)
│   ├── AWS KMS, GCP Cloud KMS, Azure Key Vault
│   └── Keys never leave service
│   └── Key rotation supported
│
├── Envelope Encryption
│   ├── DEK (Data Encryption Key) encrypts data
│   ├── KEK (Key Encryption Key) encrypts DEK
│   └── Store encrypted DEK with data
│
├── Key Rotation
│   ├── Automatic (annual/monthly)
│   └── Manual for legacy systems
│   └── Re-encrypt with new key
│
└── HSM (Hardware Security Module)
    └── Highest security
    └── For root keys, signing keys
```

---

## 4. Hashing & Signatures

```
Cryptographic Hashing:
├── Password Storage
│   ├── bcrypt (cost factor 12+)
│   └── Argon2id (memory-hard)
│   └── Never plain text, never reversible
│
├── Data Integrity
│   ├── SHA-256 for checksums
│   └── HMAC for authenticated hashing
│   └── Store hash, compare
│
└── Digital Signatures
    ├── RSA (2048+ bits)
    ├── ECDSA (P-256, P-384)
    └── For API auth, JWT signing
```

---

## 5. Application Patterns

```
Application Cryptography:
├── Field-level encryption
│   └── Encrypt PII (SSN, email) in DB
│   └── Use envelope encryption
│   └── Key per field or per record
│
├── Tokenization
│   └── Replace sensitive with token
│   └── Token maps to real value (separate system)
│   └── Used for PCI compliance
│
├── Secrets management
│   └── HashiCorp Vault, AWS Secrets Manager
│   └── Inject at runtime, never in code
│   └── Audit log every access
│
└── Random values
    └── Use CSPRNG (cryptographically secure)
    └── crypto.getRandomValues() in JS
    └── secrets.token_hex() in Python
```

---

## Key Patterns

1. **Encryption at rest** - All sensitive data encrypted on disk
2. **TLS in transit** - All communication encrypted
3. **Never roll your own** - Use established libraries
4. **Key management** - Use KMS, rotate regularly
5. **Default deny** - Don't allow without encryption

---

## Anti-Patterns

```
❌ Storing encryption keys in code — keys leaked
✅ Use KMS (AWS KMS, Cloud KMS), never in code

❌ Using deprecated algorithms (MD5, SHA1) — broken
✅ SHA-256+, bcrypt, Argon2

❌ Not encrypting backups — data at risk
✅ Encrypt backups with separate key

❌ TLS 1.0/1.1 — vulnerable to attacks
✅ Enforce TLS 1.2+, prefer 1.3

❌ Using ECB mode — patterns visible in ciphertext
✅ Use GCM, CBC with HMAC
```

---

## Quick Reference

| Task | Algorithm | Key Size |
|---|---|---|
| Password | bcrypt, Argon2id | Cost 12+ |
| Hash | SHA-256 | 256 bits |
| HMAC | HMAC-SHA256 | 256 bits |
| Symmetric | AES-256-GCM | 256 bits |
| RSA signing | RSA-PSS | 2048+ bits |
| ECDSA | P-256, P-384 | 256, 384 bits |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
