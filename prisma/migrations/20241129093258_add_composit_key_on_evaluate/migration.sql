/*
  Warnings:

  - A unique constraint covering the columns `[assessor_id,evaluator_id]` on the table `Evaluate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Evaluate_assessor_id_evaluator_id_key" ON "Evaluate"("assessor_id", "evaluator_id");
