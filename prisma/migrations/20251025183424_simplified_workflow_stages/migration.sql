/*
  Warnings:

  - You are about to drop the column `phase_id` on the `mini_prompts` table. All the data in the column will be lost.
  - You are about to drop the column `phase_id` on the `workflow_stages` table. All the data in the column will be lost.
  - You are about to drop the `phases` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `workflow_stages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."mini_prompts" DROP CONSTRAINT "mini_prompts_phase_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workflow_stages" DROP CONSTRAINT "workflow_stages_phase_id_fkey";

-- DropIndex
DROP INDEX "public"."mini_prompts_phase_id_idx";

-- DropIndex
DROP INDEX "public"."workflow_stages_phase_id_idx";

-- DropIndex
DROP INDEX "public"."workflow_stages_workflow_id_phase_id_key";

-- AlterTable
ALTER TABLE "mini_prompts" DROP COLUMN "phase_id";

-- AlterTable
ALTER TABLE "workflow_stages" DROP COLUMN "phase_id",
ADD COLUMN     "color" VARCHAR(50),
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."phases";
