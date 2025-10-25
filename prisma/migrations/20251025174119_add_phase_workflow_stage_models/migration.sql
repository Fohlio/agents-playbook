-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('WORKFLOW', 'MINI_PROMPT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(50),
    "icon" VARCHAR(50),
    "order" INTEGER NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "yaml_content" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_stages" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "phase_id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mini_prompts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "phase_id" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mini_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_mini_prompts" (
    "stage_id" TEXT NOT NULL,
    "mini_prompt_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "stage_mini_prompts_pkey" PRIMARY KEY ("stage_id","mini_prompt_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "TargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_stats" (
    "id" TEXT NOT NULL,
    "target_type" "TargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "unique_users_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tier_idx" ON "users"("tier");

-- CreateIndex
CREATE INDEX "api_tokens_user_id_idx" ON "api_tokens"("user_id");

-- CreateIndex
CREATE INDEX "api_tokens_token_hash_idx" ON "api_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "api_tokens_expires_at_idx" ON "api_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "phases_slug_key" ON "phases"("slug");

-- CreateIndex
CREATE INDEX "phases_slug_idx" ON "phases"("slug");

-- CreateIndex
CREATE INDEX "phases_order_idx" ON "phases"("order");

-- CreateIndex
CREATE INDEX "workflows_user_id_idx" ON "workflows"("user_id");

-- CreateIndex
CREATE INDEX "workflows_visibility_idx" ON "workflows"("visibility");

-- CreateIndex
CREATE INDEX "workflows_is_active_idx" ON "workflows"("is_active");

-- CreateIndex
CREATE INDEX "workflows_created_at_idx" ON "workflows"("created_at");

-- CreateIndex
CREATE INDEX "workflow_stages_workflow_id_idx" ON "workflow_stages"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_stages_phase_id_idx" ON "workflow_stages"("phase_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_stages_workflow_id_phase_id_key" ON "workflow_stages"("workflow_id", "phase_id");

-- CreateIndex
CREATE INDEX "mini_prompts_user_id_idx" ON "mini_prompts"("user_id");

-- CreateIndex
CREATE INDEX "mini_prompts_visibility_idx" ON "mini_prompts"("visibility");

-- CreateIndex
CREATE INDEX "mini_prompts_phase_id_idx" ON "mini_prompts"("phase_id");

-- CreateIndex
CREATE INDEX "mini_prompts_created_at_idx" ON "mini_prompts"("created_at");

-- CreateIndex
CREATE INDEX "stage_mini_prompts_stage_id_idx" ON "stage_mini_prompts"("stage_id");

-- CreateIndex
CREATE INDEX "stage_mini_prompts_mini_prompt_id_idx" ON "stage_mini_prompts"("mini_prompt_id");

-- CreateIndex
CREATE INDEX "ratings_user_id_idx" ON "ratings"("user_id");

-- CreateIndex
CREATE INDEX "ratings_target_type_target_id_idx" ON "ratings"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "ratings_rating_idx" ON "ratings"("rating");

-- CreateIndex
CREATE INDEX "ratings_created_at_idx" ON "ratings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_target_type_target_id_key" ON "ratings"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "usage_stats_target_type_idx" ON "usage_stats"("target_type");

-- CreateIndex
CREATE INDEX "usage_stats_usage_count_idx" ON "usage_stats"("usage_count");

-- CreateIndex
CREATE INDEX "usage_stats_unique_users_count_idx" ON "usage_stats"("unique_users_count");

-- CreateIndex
CREATE UNIQUE INDEX "usage_stats_target_type_target_id_key" ON "usage_stats"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompts" ADD CONSTRAINT "mini_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_prompts" ADD CONSTRAINT "mini_prompts_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_mini_prompts" ADD CONSTRAINT "stage_mini_prompts_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "workflow_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_mini_prompts" ADD CONSTRAINT "stage_mini_prompts_mini_prompt_id_fkey" FOREIGN KEY ("mini_prompt_id") REFERENCES "mini_prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
