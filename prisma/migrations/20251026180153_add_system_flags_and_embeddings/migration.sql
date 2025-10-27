-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN     "is_system_mini_prompt" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "is_system_workflow" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "workflow_embeddings" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "searchText" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_embeddings_workflow_id_key" ON "workflow_embeddings"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_embeddings_workflow_id_idx" ON "workflow_embeddings"("workflow_id");

-- CreateIndex
CREATE INDEX "mini_prompts_is_system_mini_prompt_idx" ON "mini_prompts"("is_system_mini_prompt");

-- CreateIndex
CREATE INDEX "workflows_is_system_workflow_idx" ON "workflows"("is_system_workflow");

-- AddForeignKey
ALTER TABLE "workflow_embeddings" ADD CONSTRAINT "workflow_embeddings_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
