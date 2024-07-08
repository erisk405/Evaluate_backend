/*
  Warnings:

  - A unique constraint covering the columns `[headOfDepartment_id]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deputyDirector_id]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "headOfDepartment_id" DROP NOT NULL,
ALTER COLUMN "headOfDepartment_id" DROP DEFAULT,
ALTER COLUMN "deputyDirector_id" DROP NOT NULL,
ALTER COLUMN "deputyDirector_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "department_id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_headOfDepartment_id_key" ON "Department"("headOfDepartment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_deputyDirector_id_key" ON "Department"("deputyDirector_id");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headOfDepartment_id_fkey" FOREIGN KEY ("headOfDepartment_id") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_deputyDirector_id_fkey" FOREIGN KEY ("deputyDirector_id") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
