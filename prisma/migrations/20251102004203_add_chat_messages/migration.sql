/*
  Warnings:

  - You are about to drop the column `messages` on the `ai_chat_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `tokenUsage` on the `ai_chat_sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- AlterTable
ALTER TABLE "ai_chat_sessions" DROP COLUMN "messages",
DROP COLUMN "tokenUsage",
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "total_tokens" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "previous_response_id" VARCHAR(255),
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "tool_invocations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_messages_chat_id_created_at_idx" ON "chat_messages"("chat_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_messages_previous_response_id_idx" ON "chat_messages"("previous_response_id");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages"("user_id");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_archived_at_idx" ON "ai_chat_sessions"("archived_at");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
