/*
  Warnings:

  - A unique constraint covering the columns `[evaluate_id,question_id]` on the table `EvaluateDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EvaluateDetail_evaluate_id_question_id_key" ON "EvaluateDetail"("evaluate_id", "question_id");
