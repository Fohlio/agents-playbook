-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_tags" (
    "workflow_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "workflow_tags_pkey" PRIMARY KEY ("workflow_id","tag_id")
);

-- CreateTable
CREATE TABLE "mini_prompt_tags" (
    "mini_prompt_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "mini_prompt_tags_pkey" PRIMARY KEY ("mini_prompt_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "workflow_tags_workflow_id_idx" ON "workflow_tags"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_tags_tag_id_idx" ON "workflow_tags"("tag_id");

-- CreateIndex
CREATE INDEX "mini_prompt_tags_mini_prompt_id_idx" ON "mini_prompt_tags"("mini_prompt_id");

-- CreateIndex
CREATE INDEX "mini_prompt_tags_tag_id_idx" ON "mini_prompt_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "workflow_tags" ADD CONSTRAINT "workflow_tags_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tags" ADD CONSTRAINT "workflow_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompt_tags" ADD CONSTRAINT "mini_prompt_tags_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompt_tags" ADD CONSTRAINT "mini_prompt_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
