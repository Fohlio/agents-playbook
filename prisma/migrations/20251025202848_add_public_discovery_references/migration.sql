-- CreateTable
CREATE TABLE "workflow_references" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mini_prompt_references" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mini_prompt_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mini_prompt_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_references_user_id_idx" ON "workflow_references"("user_id");

-- CreateIndex
CREATE INDEX "workflow_references_workflow_id_idx" ON "workflow_references"("workflow_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_references_user_id_workflow_id_key" ON "workflow_references"("user_id", "workflow_id");

-- CreateIndex
CREATE INDEX "mini_prompt_references_user_id_idx" ON "mini_prompt_references"("user_id");

-- CreateIndex
CREATE INDEX "mini_prompt_references_mini_prompt_id_idx" ON "mini_prompt_references"("mini_prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "mini_prompt_references_user_id_mini_prompt_id_key" ON "mini_prompt_references"("user_id", "mini_prompt_id");

-- AddForeignKey
ALTER TABLE "workflow_references" ADD CONSTRAINT "workflow_references_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_references" ADD CONSTRAINT "workflow_references_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompt_references" ADD CONSTRAINT "mini_prompt_references_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompt_references" ADD CONSTRAINT "mini_prompt_references_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
