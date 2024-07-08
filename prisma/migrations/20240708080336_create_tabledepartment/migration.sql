/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
ADD COLUMN     "department_id" TEXT NOT NULL DEFAULT 'null';

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "headOfDepartment_id" TEXT NOT NULL DEFAULT 'null',
    "deputyDirector_id" TEXT NOT NULL DEFAULT 'null',

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
