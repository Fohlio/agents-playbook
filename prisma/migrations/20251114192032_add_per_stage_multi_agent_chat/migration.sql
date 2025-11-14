-- AlterTable
ALTER TABLE "workflow_stages" ADD COLUMN     "include_multi_agent_chat" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "workflow_stages_include_multi_agent_chat_idx" ON "workflow_stages"("include_multi_agent_chat");
