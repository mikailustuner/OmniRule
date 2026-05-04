# Database Migration Protocol

Handle the database evolution with care.

## 1. Context
Current Schema: `{file:schema.prisma}` or relevant DDL.

## 2. Request
$ARGUMENTS

## 3. Specialist: Migrator
@migrator analyze the request and provide:
1. Impact Analysis
2. Migration Scripts (SQL/Prisma)
3. Verification Steps
4. Rollback Plan
