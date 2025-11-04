-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "mini_prompts_is_active_idx" ON "mini_prompts"("is_active");
