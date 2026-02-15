---
description: Full project verification suite. Pre-deployment final check.
---

# /verify - Full Suite Verification

$ARGUMENTS

---

## Task

Run the comprehensive verification suite, including end-to-end tests and performance audits.

### Command

`python .agent/scripts/verify_all.py . --url <URL>`

---

## 🔍 What it Verifies

1. **All Checklist Items** (Security, Lint, Schema, Tests, UX, SEO)
2. **Lighthouse Audit** (Performance, PWA, Best Practices)
3. **Playwright E2E** (Full application flow tests)
4. **Bundle Analysis** (Client-side footprint)
5. **Mobile Audit** (Responsiveness and touch targets)
6. **i18n Check** (Hardcoded strings detection)

---

## Usage

```bash
/verify --url https://app.portaleletricos.com.br
```
