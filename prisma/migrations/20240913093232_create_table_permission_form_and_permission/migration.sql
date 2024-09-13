-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateTable
CREATE TABLE "Permission" (
    "permission_id" TEXT NOT NULL,
    "assessor_role_id" TEXT NOT NULL,
    "evaluator_role_id" TEXT NOT NULL,
    "permission_level" "PermissionLevel" NOT NULL DEFAULT 'LEVEL_1',
    "in_group" BOOLEAN NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "PermissionForm" (
    "permission_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,

    CONSTRAINT "PermissionForm_pkey" PRIMARY KEY ("permission_id","form_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_assessor_role_id_key" ON "Permission"("assessor_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_evaluator_role_id_key" ON "Permission"("evaluator_role_id");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_assessor_role_id_fkey" FOREIGN KEY ("assessor_role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_evaluator_role_id_fkey" FOREIGN KEY ("evaluator_role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionForm" ADD CONSTRAINT "PermissionForm_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionForm" ADD CONSTRAINT "PermissionForm_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
