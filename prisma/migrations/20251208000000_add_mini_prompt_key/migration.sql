-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN "key" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "mini_prompts_key_key" ON "mini_prompts"("key");

-- CreateIndex
CREATE INDEX "mini_prompts_key_idx" ON "mini_prompts"("key");
