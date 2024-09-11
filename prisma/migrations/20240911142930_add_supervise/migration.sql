/*
  Warnings:

  - You are about to drop the column `evaluated_uid` on the `Evaluate` table. All the data in the column will be lost.
  - You are about to drop the column `evaluates_uid` on the `Evaluate` table. All the data in the column will be lost.
  - You are about to drop the `Form_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question_type` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assessor_id` to the `Evaluate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `evaluator_id` to the `Evaluate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Evaluate" DROP CONSTRAINT "Evaluate_evaluated_uid_fkey";

-- DropForeignKey
ALTER TABLE "Evaluate" DROP CONSTRAINT "Evaluate_evaluates_uid_fkey";

-- DropForeignKey
ALTER TABLE "Form_question" DROP CONSTRAINT "Form_question_form_id_fkey";

-- DropForeignKey
ALTER TABLE "Form_question" DROP CONSTRAINT "Form_question_question_type_id_fkey";

-- AlterTable
ALTER TABLE "Evaluate" DROP COLUMN "evaluated_uid",
DROP COLUMN "evaluates_uid",
ADD COLUMN     "assessor_id" TEXT NOT NULL,
ADD COLUMN     "evaluator_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "prefix_id" TEXT;

-- DropTable
DROP TABLE "Form_question";

-- DropTable
DROP TABLE "Question_type";

-- CreateTable
CREATE TABLE "FormQuestion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "question_type_id" TEXT NOT NULL,

    CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "QuestionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefix" (
    "prefix_id" TEXT NOT NULL,
    "prefix_name" TEXT NOT NULL,

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("prefix_id")
);

-- CreateTable
CREATE TABLE "Supervise" (
    "supervise_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "Supervise_pkey" PRIMARY KEY ("supervise_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_name_key" ON "FormQuestion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supervise_department_id_key" ON "Supervise"("department_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prefix_id_fkey" FOREIGN KEY ("prefix_id") REFERENCES "Prefix"("prefix_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_question_type_id_fkey" FOREIGN KEY ("question_type_id") REFERENCES "QuestionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervise" ADD CONSTRAINT "Supervise_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervise" ADD CONSTRAINT "Supervise_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
