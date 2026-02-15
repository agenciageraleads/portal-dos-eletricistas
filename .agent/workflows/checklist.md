---
description: Run Antigravity Kit validation checklist. Priority-based project audit.
---

# /checklist - Project Audit

$ARGUMENTS

---

## Task

Run a comprehensive project audit using the Antigravity Kit's master checklist.

### Command Variations

```bash
/checklist          - Run core audit (Security, Lint, Schema, Tests, UX, SEO)
/checklist --url    - Run full audit including performance (Lighthouse, E2E)
/checklist --fix    - Run audit and attempt to auto-fix issues (where possible)
```

---

## 📋 Audit Priority

1. **Security** → Identifies vulnerabilities and exposed secrets.
2. **Lint** → Ensures code follows quality and style standards.
3. **Schema** → Validates database structure and migrations.
4. **Tests** → Executes unit and integration test suites.
5. **UX** → Audits accessibility and UI best practices.
6. **SEO** → Checks search engine optimization fundamentals.
7. **Performance** → Measures Core Web Vitals (requires --url).

---

## Execution

This command executes the master checklist script:
`python .agent/scripts/checklist.py .`

---

## Example Summary Output

```markdown
# 📊 Audit Results

✅ **Security Scan** (PASSED)
✅ **Lint & Type Check** (PASSED)
⚠️  **Schema Validation** (1 warning: pending migration)
❌ **Test Runner** (2 failures in AuthService.spec.ts)
✅ **UX Audit** (PASSED)
✅ **SEO Check** (PASSED)

### 🚀 Next Steps
1. Review failed tests in `apps/api/test/AuthService.spec.ts`
2. Run database migrations with `npx prisma migrate dev`
```
