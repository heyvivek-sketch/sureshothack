-- CreateTable users
CREATE TABLE "public"."users" (
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
CREATE TABLE "public"."game_sessions" (
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
CREATE TABLE "public"."game_periods" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "game_sessions_userId_idx" ON "public"."game_sessions"("userId");

-- CreateIndex
CREATE INDEX "game_sessions_periodNumber_idx" ON "public"."game_sessions"("periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "game_periods_gameType_periodNumber_key" ON "public"."game_periods"("gameType", "periodNumber");

-- CreateIndex
CREATE INDEX "game_periods_gameType_status_idx" ON "public"."game_periods"("gameType", "status");

-- AddForeignKey
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
