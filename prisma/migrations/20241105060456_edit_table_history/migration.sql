/*
  Warnings:

  - You are about to drop the column `average` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `history_question_id` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `standard_deviation` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `in_group` on the `Permission` table. All the data in the column will be lost.
  - The primary key for the `PermissionForm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `HistoryQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[assessor_role_id]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department_name` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessor_role_id` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingroup` to the `PermissionForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_history_question_id_fkey";

-- DropForeignKey
ALTER TABLE "PermissionRole" DROP CONSTRAINT "PermissionRole_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "PermissionRole" DROP CONSTRAINT "PermissionRole_role_id_fkey";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "average",
DROP COLUMN "history_question_id",
DROP COLUMN "standard_deviation",
ADD COLUMN     "department_name" TEXT NOT NULL,
ADD COLUMN     "role_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "in_group",
ADD COLUMN     "assessor_role_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PermissionForm" DROP CONSTRAINT "PermissionForm_pkey",
ADD COLUMN     "ingroup" BOOLEAN NOT NULL,
ADD CONSTRAINT "PermissionForm_pkey" PRIMARY KEY ("permission_id", "form_id", "ingroup");

-- DropTable
DROP TABLE "HistoryQuestion";

-- DropTable
DROP TABLE "PermissionRole";

-- CreateTable
CREATE TABLE "HistoryDetail" (
    "history_detail_id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "questionHead" TEXT NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "HistoryDetail_pkey" PRIMARY KEY ("history_detail_id")
);

-- CreateTable
CREATE TABLE "HistoryScore" (
    "history_score_id" TEXT NOT NULL,
    "history_detail_id" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "standard_deviation" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoryScore_pkey" PRIMARY KEY ("history_score_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_assessor_role_id_key" ON "Permission"("assessor_role_id");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_assessor_role_id_fkey" FOREIGN KEY ("assessor_role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryDetail" ADD CONSTRAINT "HistoryDetail_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "History"("history_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryScore" ADD CONSTRAINT "HistoryScore_history_detail_id_fkey" FOREIGN KEY ("history_detail_id") REFERENCES "HistoryDetail"("history_detail_id") ON DELETE RESTRICT ON UPDATE CASCADE;
