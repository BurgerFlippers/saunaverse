/*
  Warnings:

  - Made the column `saunaSessionId` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_saunaSessionId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "saunaSessionId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_createdById_idx" ON "Comment"("createdById");

-- CreateIndex
CREATE INDEX "Post_createdById_idx" ON "Post"("createdById");

-- CreateIndex
CREATE INDEX "Post_saunaSessionId_idx" ON "Post"("saunaSessionId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "PostImage_postId_idx" ON "PostImage"("postId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_saunaSessionId_fkey" FOREIGN KEY ("saunaSessionId") REFERENCES "SaunaSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
