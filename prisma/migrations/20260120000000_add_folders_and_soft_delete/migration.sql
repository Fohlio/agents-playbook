-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "ModelCategory" AS ENUM ('REASONING', 'CODING', 'GENERAL', 'VISION', 'EMBEDDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable folders
CREATE TABLE IF NOT EXISTS "folders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "key" VARCHAR(100),
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable folder_items
CREATE TABLE IF NOT EXISTS "folder_items" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable folder_references
CREATE TABLE IF NOT EXISTS "folder_references" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable models
CREATE TABLE IF NOT EXISTS "models" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "category" "ModelCategory" NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "context_window" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable workflow_models
CREATE TABLE IF NOT EXISTS "workflow_models" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable mini_prompt_models
CREATE TABLE IF NOT EXISTS "mini_prompt_models" (
    "id" TEXT NOT NULL,
    "mini_prompt_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mini_prompt_models_pkey" PRIMARY KEY ("id")
);

-- Add deleted_at to workflows (if not exists)
DO $$ BEGIN
    ALTER TABLE "workflows" ADD COLUMN "deleted_at" TIMESTAMP(3);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add deleted_at to mini_prompts (if not exists)
DO $$ BEGIN
    ALTER TABLE "mini_prompts" ADD COLUMN "deleted_at" TIMESTAMP(3);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add auto_shared_by_folder_id to shared_links (if not exists)
DO $$ BEGIN
    ALTER TABLE "shared_links" ADD COLUMN "auto_shared_by_folder_id" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- CreateIndexes for folders (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "folders_key_key" ON "folders"("key");
CREATE INDEX IF NOT EXISTS "folders_user_id_idx" ON "folders"("user_id");
CREATE INDEX IF NOT EXISTS "folders_visibility_idx" ON "folders"("visibility");
CREATE INDEX IF NOT EXISTS "folders_is_active_idx" ON "folders"("is_active");
CREATE INDEX IF NOT EXISTS "folders_key_idx" ON "folders"("key");
CREATE INDEX IF NOT EXISTS "folders_deleted_at_idx" ON "folders"("deleted_at");
CREATE INDEX IF NOT EXISTS "folders_user_id_position_idx" ON "folders"("user_id", "position");

-- CreateIndexes for folder_items (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "folder_items_folder_id_target_type_target_id_key" ON "folder_items"("folder_id", "target_type", "target_id");
CREATE INDEX IF NOT EXISTS "folder_items_folder_id_idx" ON "folder_items"("folder_id");
CREATE INDEX IF NOT EXISTS "folder_items_target_type_target_id_idx" ON "folder_items"("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "folder_items_folder_id_position_idx" ON "folder_items"("folder_id", "position");

-- CreateIndexes for folder_references (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "folder_references_user_id_folder_id_key" ON "folder_references"("user_id", "folder_id");
CREATE INDEX IF NOT EXISTS "folder_references_user_id_idx" ON "folder_references"("user_id");
CREATE INDEX IF NOT EXISTS "folder_references_folder_id_idx" ON "folder_references"("folder_id");

-- CreateIndexes for models (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "models_name_key" ON "models"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "models_slug_key" ON "models"("slug");
CREATE INDEX IF NOT EXISTS "models_slug_idx" ON "models"("slug");
CREATE INDEX IF NOT EXISTS "models_category_idx" ON "models"("category");

-- CreateIndexes for workflow_models (ignore if exists)
CREATE INDEX IF NOT EXISTS "workflow_models_workflow_id_idx" ON "workflow_models"("workflow_id");
CREATE INDEX IF NOT EXISTS "workflow_models_model_id_idx" ON "workflow_models"("model_id");

-- CreateIndexes for mini_prompt_models (ignore if exists)
CREATE INDEX IF NOT EXISTS "mini_prompt_models_mini_prompt_id_idx" ON "mini_prompt_models"("mini_prompt_id");
CREATE INDEX IF NOT EXISTS "mini_prompt_models_model_id_idx" ON "mini_prompt_models"("model_id");

-- CreateIndexes for workflows.deleted_at (ignore if exists)
CREATE INDEX IF NOT EXISTS "workflows_deleted_at_idx" ON "workflows"("deleted_at");

-- CreateIndexes for mini_prompts.deleted_at (ignore if exists)
CREATE INDEX IF NOT EXISTS "mini_prompts_deleted_at_idx" ON "mini_prompts"("deleted_at");

-- CreateIndexes for shared_links.auto_shared_by_folder_id (ignore if exists)
CREATE INDEX IF NOT EXISTS "shared_links_auto_shared_by_folder_id_idx" ON "shared_links"("auto_shared_by_folder_id");

-- AddForeignKey folders -> users (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey folder_items -> folders (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "folder_items" ADD CONSTRAINT "folder_items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey folder_references -> users (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "folder_references" ADD CONSTRAINT "folder_references_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey folder_references -> folders (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "folder_references" ADD CONSTRAINT "folder_references_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey workflow_models -> workflows (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "workflow_models" ADD CONSTRAINT "workflow_models_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey workflow_models -> models (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "workflow_models" ADD CONSTRAINT "workflow_models_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey mini_prompt_models -> mini_prompts (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "mini_prompt_models" ADD CONSTRAINT "mini_prompt_models_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey mini_prompt_models -> models (ignore if exists)
DO $$ BEGIN
    ALTER TABLE "mini_prompt_models" ADD CONSTRAINT "mini_prompt_models_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
