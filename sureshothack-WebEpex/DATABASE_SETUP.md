# Supabase Database Deployment Instructions

## Current Status
✅ PayU payment integration complete
✅ Prisma migration files created and committed
⏳ Database tables pending creation in Supabase

## Quick Setup (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (the one with your DATABASE_URL)
3. Click **SQL Editor** in the left sidebar

### Step 2: Deploy Schema
1. Click **New Query** (or **Create a new query**)
2. Copy the SQL from `SUPABASE_DEPLOYMENT.sql` in this repository
3. Paste it into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Query completed successfully"

### Step 3: Verify Tables
1. Navigate to **Table Editor** (left sidebar)
2. Refresh the page
3. You should see 3 new tables:
   - `users`
   - `game_sessions`
   - `game_periods`

### Step 4: Test Connection
Once tables are created, your application will:
- ✅ Successfully create user accounts
- ✅ Store PayU payment records
- ✅ Track game sessions and predictions
- ✅ Manage VIP subscriptions

## Alternative: Deploy via Vercel

If you're deploying to Vercel:
1. Push code to GitHub (already done ✅)
2. Deploy to Vercel with automatic build
3. Vercel will run: `prisma generate && next build`
4. After successful build, Vercel can run: `prisma migrate deploy`
5. Tables will be auto-created on deployment

## What's Created

### users Table
- User authentication and VIP subscription management
- Fields: id, email, fullName, password, isPremium, isVip, vipExpiresAt, timestamps
- Email is unique (prevents duplicate accounts)

### game_sessions Table
- User game predictions and results
- Tracks: prediction, result, win/loss status
- Linked to users via userId (CASCADE delete for cleanup)

### game_periods Table
- Available game periods and results
- Unique constraint on (gameType, periodNumber)
- Tracks: open/closed/resulted status

## Connection String
Your app uses these environment variables:
- `DATABASE_URL` - For normal operations (with connection pooling)
- `DIRECT_URL` - For migrations (direct connection)

Both should already be configured in your `.env` file.

## Troubleshooting

**"Table already exists" error:**
- Safe to ignore - means tables were already created
- Or drop tables and re-run: `DROP TABLE IF EXISTS game_sessions, game_periods, users CASCADE;`

**"Cannot find _prisma_migrations table":**
- Supabase may have already created it
- The migration record insertion is optional

**Still getting "table does not exist" in app:**
- Refresh the Prisma schema: `npm run db:generate`
- Or just restart your app - it will re-read the schema

## Next Steps After Deployment
1. Test user signup: POST /api/auth/signup
2. Test PayU payment: Click "Become VIP" button
3. Verify user appears in database via Supabase Table Editor
4. Check VIP expiry is set correctly
