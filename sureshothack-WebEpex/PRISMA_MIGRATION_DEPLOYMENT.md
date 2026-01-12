# Prisma Migration Deployment Guide

## Migration Files Created
- `prisma/migrations/init/migration.sql` - Initial schema with 3 tables
- `prisma/migrations/migration_lock.toml` - Prisma metadata file

## Tables Created
1. **users** - User accounts with VIP subscription support
   - Fields: id, email, fullName, password, isPremium, isVip, vipExpiresAt, createdAt, updatedAt
   - Primary Key: id
   - Unique: email

2. **game_sessions** - User game predictions and results
   - Fields: id, userId, gameType, timeInterval, periodNumber, prediction, result, isWin, status, createdAt, updatedAt
   - Foreign Key: userId -> users(id) ON DELETE CASCADE
   - Indexes: userId, periodNumber

3. **game_periods** - Game period definitions and results
   - Fields: id, gameType, periodNumber, result, status, closesAt, createdAt, updatedAt
   - Unique: (gameType, periodNumber)
   - Indexes: (gameType, status)

## How to Deploy Migration to Supabase

### Option 1: Using Supabase SQL Editor (Recommended for Production)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new SQL file and paste the entire content from `prisma/migrations/init/migration.sql`
4. Execute the SQL script
5. Verify tables are created in Table Editor

### Option 2: Using Vercel Deployment
When you deploy to Vercel:
1. Vercel will run the build command: `prisma generate && next build`
2. Configure post-deployment script to run: `prisma migrate deploy`
3. This will apply all pending migrations automatically

### Option 3: Using Prisma CLI (Local)
```bash
# Deploy existing migrations
npm run db:migrate:deploy

# Or push schema directly (if no migrations exist)
npm run db:push
```

## Status
- ✅ Migration file created: `prisma/migrations/init/migration.sql`
- ✅ Migration metadata: `prisma/migrations/migration_lock.toml`
- ✅ Committed to GitHub: Commit de6b0c1
- ⏳ PENDING: Deploy to Supabase PostgreSQL database

## Verification Steps After Deployment
1. Check Supabase Table Editor - all 3 tables should exist
2. Verify column types and constraints match schema
3. Run API test to create a user - should succeed without table errors
4. Check Prisma Studio: `npm run db:studio`

## Troubleshooting
- If tables already exist: SQL will fail with "already exists" error - this is OK, ignore and continue
- If deployment fails: Check Supabase logs in project dashboard
- If Prisma can't find tables: Run schema sync: `npm run db:push --skip-verify`
