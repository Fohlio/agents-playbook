-- CreateEnum
CREATE TYPE "WorkflowComplexity" AS ENUM ('XS', 'S', 'M', 'L', 'XL');

-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN     "description" VARCHAR(1000);

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "complexity" "WorkflowComplexity";

-- CreateTable
CREATE TABLE "mini_prompt_embeddings" (
    "id" TEXT NOT NULL,
    "mini_prompt_id" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "searchText" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mini_prompt_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mini_prompt_embeddings_mini_prompt_id_key" ON "mini_prompt_embeddings"("mini_prompt_id");

-- CreateIndex
CREATE INDEX "mini_prompt_embeddings_mini_prompt_id_idx" ON "mini_prompt_embeddings"("mini_prompt_id");

-- CreateIndex
CREATE INDEX "workflows_complexity_idx" ON "workflows"("complexity");

-- AddForeignKey
ALTER TABLE "mini_prompt_embeddings" ADD CONSTRAINT "mini_prompt_embeddings_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
