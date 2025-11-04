-- AlterTable
ALTER TABLE "workflow_stages" ADD COLUMN     "with_review" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "include_multi_agent_chat" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "workflow_stages_with_review_idx" ON "workflow_stages"("with_review");

-- CreateIndex
CREATE INDEX "workflows_include_multi_agent_chat_idx" ON "workflows"("include_multi_agent_chat");
