/*
  Warnings:

  - A unique constraint covering the columns `[assessor_role_id,evaluator_role_id]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_assessor_role_id_evaluator_role_id_key" ON "Permission"("assessor_role_id", "evaluator_role_id");
