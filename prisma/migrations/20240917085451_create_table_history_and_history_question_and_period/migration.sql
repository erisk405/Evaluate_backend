/*
  Warnings:

  - You are about to drop the column `form_id` on the `Evaluate` table. All the data in the column will be lost.
  - You are about to drop the column `dateofbirth` on the `User` table. All the data in the column will be lost.
  - Added the required column `period_id` to the `Evaluate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Evaluate" DROP CONSTRAINT "Evaluate_form_id_fkey";

-- AlterTable
ALTER TABLE "Evaluate" DROP COLUMN "form_id",
ADD COLUMN     "period_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateofbirth";

-- CreateTable
CREATE TABLE "Period" (
    "period_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "isAction" BOOLEAN NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "History" (
    "history_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "history_question_id" TEXT NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "standard_deviation" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "HistoryQuestion" (
    "history_question_id" TEXT NOT NULL,
    "questionHead" TEXT NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "HistoryQuestion_pkey" PRIMARY KEY ("history_question_id")
);

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("period_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("period_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_history_question_id_fkey" FOREIGN KEY ("history_question_id") REFERENCES "HistoryQuestion"("history_question_id") ON DELETE RESTRICT ON UPDATE CASCADE;
