-- Supabase SQL Deployment Script
-- Copy and paste this entire script into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

BEGIN;

-- CreateTable users
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "vipExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable game_sessions
CREATE TABLE IF NOT EXISTS "public"."game_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "timeInterval" TEXT NOT NULL,
    "periodNumber" TEXT NOT NULL,
    "prediction" TEXT,
    "result" TEXT,
    "isWin" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable game_periods
CREATE TABLE IF NOT EXISTS "public"."game_periods" (
    "id" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "periodNumber" TEXT NOT NULL,
    "result" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_periods_pkey" PRIMARY KEY ("id")
);

-- Create Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "game_sessions_userId_idx" ON "public"."game_sessions"("userId");
CREATE INDEX IF NOT EXISTS "game_sessions_periodNumber_idx" ON "public"."game_sessions"("periodNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "game_periods_gameType_periodNumber_key" ON "public"."game_periods"("gameType", "periodNumber");
CREATE INDEX IF NOT EXISTS "game_periods_gameType_status_idx" ON "public"."game_periods"("gameType", "status");

-- Add Foreign Keys
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert record into _prisma_migrations to mark migration as applied
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, execution_time) 
VALUES ('20250605000000_init', '123abc', NOW(), 'init', NULL, NULL, NOW(), 0)
ON CONFLICT DO NOTHING;

COMMIT;
