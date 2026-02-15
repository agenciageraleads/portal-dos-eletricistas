---
description: Seed local database with real development data.
---

# /seed - Database Seeding

$ARGUMENTS

---

## Task

Populate the local database with sample data (Services, Users, Products) for development and testing.

### Options

```bash
/seed          - Standard seed (Prisma seed)
/seed portal   - Specific Portal dos Eletricistas data (Services)
```

---

## Execution

Runs:

- `npm run seed` or `npx ts-node apps/api/prisma/seed.ts`
- `npx ts-node scripts/seed-services.ts`
