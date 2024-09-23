/*
  Warnings:

  - You are about to drop the column `permission_level` on the `Permission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "permission_level";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "role_level" "RoleLevel" NOT NULL DEFAULT 'LEVEL_1';

-- DropEnum
DROP TYPE "PermissionLevel";
