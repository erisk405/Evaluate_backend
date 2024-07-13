/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uid` on the `User` table. All the data in the column will be lost.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_deputyDirector_id_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headOfDepartment_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "uid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headOfDepartment_id_fkey" FOREIGN KEY ("headOfDepartment_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_deputyDirector_id_fkey" FOREIGN KEY ("deputyDirector_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
