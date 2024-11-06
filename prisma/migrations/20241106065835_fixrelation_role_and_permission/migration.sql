-- DropIndex
DROP INDEX "Permission_assessor_role_id_key";

-- DropIndex
DROP INDEX "Permission_evaluator_role_id_key";

-- CreateIndex
CREATE INDEX "Permission_assessor_role_id_idx" ON "Permission"("assessor_role_id");

-- CreateIndex
CREATE INDEX "Permission_evaluator_role_id_idx" ON "Permission"("evaluator_role_id");
