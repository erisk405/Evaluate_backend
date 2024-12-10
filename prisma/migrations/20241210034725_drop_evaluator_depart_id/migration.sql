/*
  Warnings:

  - You are about to drop the column `eval_depart_id` on the `Evaluate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assessor_id,evaluator_id]` on the table `Evaluate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Evaluate" DROP CONSTRAINT "Evaluate_eval_depart_id_fkey";

-- DropIndex
DROP INDEX "Evaluate_assessor_id_evaluator_id_eval_depart_id_key";

-- AlterTable
ALTER TABLE "Evaluate" DROP COLUMN "eval_depart_id";

-- CreateIndex
CREATE UNIQUE INDEX "Evaluate_assessor_id_evaluator_id_key" ON "Evaluate"("assessor_id", "evaluator_id");
