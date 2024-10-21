/*
  Warnings:

  - You are about to drop the column `assessor_role_id` on the `Permission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_assessor_role_id_fkey";

-- DropIndex
DROP INDEX "Permission_assessor_role_id_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "assessor_role_id";

-- CreateTable
CREATE TABLE "PermissionRole" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "PermissionRole_pkey" PRIMARY KEY ("permission_id","role_id")
);

-- AddForeignKey
ALTER TABLE "PermissionRole" ADD CONSTRAINT "PermissionRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionRole" ADD CONSTRAINT "PermissionRole_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
