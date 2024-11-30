/*
  Warnings:

  - A unique constraint covering the columns `[eval_depart_id]` on the table `Evaluate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assessor_id,evaluator_id,eval_depart_id]` on the table `Evaluate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eval_depart_id` to the `Evaluate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Evaluate_assessor_id_evaluator_id_key";

-- AlterTable
ALTER TABLE "Evaluate" ADD COLUMN     "eval_depart_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Evaluate_eval_depart_id_key" ON "Evaluate"("eval_depart_id");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluate_assessor_id_evaluator_id_eval_depart_id_key" ON "Evaluate"("assessor_id", "evaluator_id", "eval_depart_id");

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_eval_depart_id_fkey" FOREIGN KEY ("eval_depart_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
