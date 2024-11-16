/*
  Warnings:

  - You are about to drop the column `name` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `question_type_id` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the `QuestionType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_question_type_id_fkey";

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "name",
DROP COLUMN "question_type_id",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuestionType";

-- CreateTable
CREATE TABLE "EvaluateDetail" (
    "id" TEXT NOT NULL,
    "evaluate_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EvaluateDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluateDetail_question_id_key" ON "EvaluateDetail"("question_id");

-- AddForeignKey
ALTER TABLE "EvaluateDetail" ADD CONSTRAINT "EvaluateDetail_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluateDetail" ADD CONSTRAINT "EvaluateDetail_evaluate_id_fkey" FOREIGN KEY ("evaluate_id") REFERENCES "Evaluate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
