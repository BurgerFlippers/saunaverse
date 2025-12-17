-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "insights" JSONB;

-- CreateTable
CREATE TABLE "UserBiometrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "heartRate" INTEGER NOT NULL,

    CONSTRAINT "UserBiometrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBiometrics_userId_timestamp_idx" ON "UserBiometrics"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "UserBiometrics_userId_timestamp_key" ON "UserBiometrics"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "UserBiometrics" ADD CONSTRAINT "UserBiometrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
