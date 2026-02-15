---
description: Deep security audit. Vulnerabilities, secrets, and OWASP compliance.
---

# /security - Security Audit

$ARGUMENTS

---

## Task

Perform a deep security scan of the codebase, dependencies, and configuration.

### 🛡️ Checks

1. **Secret Scanning**: Detects API keys or credentials committed to code.
2. **Vulnerability Scan**: Identifies known CVEs in dependencies.
3. **OWASP Audit**: Checks for common web vulnerabilities (XSS, SQLi, etc).

---

## Execution

`python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
