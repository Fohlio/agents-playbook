-- AlterTable
ALTER TABLE "users" ADD COLUMN     "openai_api_key" TEXT,
ADD COLUMN     "openai_api_key_updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "mini_prompt_id" TEXT,
    "mode" VARCHAR(50) NOT NULL,
    "messages" JSONB NOT NULL,
    "tokenUsage" JSONB NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_chat_sessions_user_id_idx" ON "ai_chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_workflow_id_idx" ON "ai_chat_sessions"("workflow_id");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_mini_prompt_id_idx" ON "ai_chat_sessions"("mini_prompt_id");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_mode_idx" ON "ai_chat_sessions"("mode");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_last_message_at_idx" ON "ai_chat_sessions"("last_message_at");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_updated_at_idx" ON "ai_chat_sessions"("updated_at");

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
