-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN     "is_automatic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "mini_prompts_is_automatic_idx" ON "mini_prompts"("is_automatic");
