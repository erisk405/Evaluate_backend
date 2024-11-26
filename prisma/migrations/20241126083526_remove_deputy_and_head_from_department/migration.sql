/*
  Warnings:

  - You are about to drop the column `deputyDirector_id` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `headOfDepartment_id` on the `Department` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_deputyDirector_id_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headOfDepartment_id_fkey";

-- DropIndex
DROP INDEX "Department_deputyDirector_id_key";

-- DropIndex
DROP INDEX "Department_headOfDepartment_id_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "deputyDirector_id",
DROP COLUMN "headOfDepartment_id";
